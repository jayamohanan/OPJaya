import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './AddIssueModal.css';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LABELS } from '../constants/labels';
import { devError } from '../utils/devLog';


const issueTypes = [
  'Towns',
  'Roads', 
  'Bus Stands/Bus Stops',
  'Water Bodies',
  'Bin Install and Upkeep',
  'Bin Usage'
];

const typeMap = {
  'Towns': 'town',
  'Roads': 'road',
  'Bus Stands/Bus Stops': 'bus_stop',
  'Water Bodies': 'water_body'
};

function CenterMarker({ onChange }) {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      onChange([center.lat, center.lng]);
    },
  });
  return (
    <div style={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -100%)',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="marker" style={{ width: 32, height: 32 }} />
    </div>
  );
}

function AddIssueModal({ isOpen, onClose, localBodyData }) {
  const [formData, setFormData] = useState({
    description: '',
    type: '',
    photos: []
  });
  const [location, setLocation] = useState([10.0, 76.0]);
  const [locationSet, setLocationSet] = useState(false);
  const [locationUrl, setLocationUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [towns, setTowns] = useState([]);
  const [selectedTown, setSelectedTown] = useState('');

  useEffect(() => {
    async function fetchTowns() {
      if (!isOpen || !localBodyData?.[FIELDS.LOCAL_BODY.ID]) {
        setTowns([]);
        setSelectedTown('');
        return;
      }
      const { data: townsData } = await supabase
        .from(TABLES.TOWN)
        .select([
          FIELDS.TOWN.ID,
          FIELDS.TOWN.TOWN_NAME_EN,
          FIELDS.TOWN.TOWN_NAME_ML,
          LABELS.TOWN_LAT,
          LABELS.TOWN_LNG
        ].join(', '))
        .eq(FIELDS.TOWN.LOCAL_BODY_ID, localBodyData?.[FIELDS.LOCAL_BODY.ID] || localBodyData?.id || '');
      setTowns(townsData || []);
      setSelectedTown('');
    }
    fetchTowns();
  }, [isOpen, localBodyData?.[FIELDS.LOCAL_BODY.ID]]);

  useEffect(() => {
    if (formData.type === 'Towns' && selectedTown) {
      const townObj = towns.find(t => t[FIELDS.TOWN.ID] === selectedTown);
      const lat = townObj && townObj[LABELS.TOWN_LAT];
      const lng = townObj && townObj[LABELS.TOWN_LNG];
      if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
        setLocation([parseFloat(lat), parseFloat(lng)]);
        setLocationSet(false);
        setLocationUrl('');
      }
    }
  }, [selectedTown, formData.type, towns]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'type' && value !== 'Towns') {
      setSelectedTown('');
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files]
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleLocationChange = (coords) => {
    setLocation(coords);
    setLocationSet(false);
  };

  const handleSetLocation = () => {
    setLocationSet(true);
    setLocationUrl(`https://maps.google.com/?q=${location[0]},${location[1]}`);
  };

  // Upload to R2 bucket aayiram-bathery
  const uploadToR2 = async (file, filename) => {
    try {
      const folderedFilename = `issue-images/${filename}`;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('filename', folderedFilename);
      const response = await fetch('http://localhost:3001/api/upload-to-r2', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Failed to upload to R2');
      }
      // Always construct the public URL using your public bucket id
      const publicUrl = `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/${folderedFilename}`;
      return publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    // Enforce mandatory fields
    if (!formData.type) {
      setError('Please select an issue type.');
      setIsSubmitting(false);
      return;
    }
    if (formData.type === 'Towns' && !selectedTown) {
      setError('Please select a town.');
      setIsSubmitting(false);
      return;
    }
    if (!locationSet || !locationUrl) {
      setError('Please set the location using the map.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.photos.length) {
      setError('Please upload at least one photo.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.description) {
      setError('Please enter a description.');
      setIsSubmitting(false);
      return;
    }
    const dbType = typeMap[formData.type];
    if (!dbType) {
      setError('Invalid issue type selected.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(true);
    try {
      const issueId = uuidv4();
      const photoUrls = [];
      for (let i = 0; i < formData.photos.length; i++) {
        const photo = formData.photos[i];
        const fileExtension = photo.name.split('.').pop();
        const filename = `${issueId}_photo_${i + 1}.${fileExtension}`;
        const photoUrl = await uploadToR2(photo, filename);
        photoUrls.push(photoUrl);
      }
      // Insert into Supabase issues table
      const { error: supaError } = await supabase.from(TABLES.ISSUES).insert({
        [FIELDS.ISSUES.LOCAL_BODY_ID]: localBodyData?.[FIELDS.LOCAL_BODY.ID] || localBodyData?.id || '',
        [FIELDS.ISSUES.TYPE]: dbType,
        [FIELDS.ISSUES.DESCRIPTION]: formData.description,
        [FIELDS.ISSUES.LOCATION_URL]: locationUrl,
        [FIELDS.ISSUES.IMAGE_URL]: photoUrls[0] || '',
        [FIELDS.ISSUES.RESOLVED]: false,
        [FIELDS.ISSUES.TOWN_ID]: formData.type === 'Towns' ? selectedTown : null
      });
      if (supaError) throw supaError;
      alert('Issue submitted successfully!');
      setFormData({
        description: '',
        type: '',
        photos: []
      });
      setLocation([10.0, 76.0]);
      setLocationSet(false);
      setLocationUrl('');
      setSelectedTown('');
      onClose();
    } catch (error) {
      // Log the error reason for debugging
  devError('Failed to submit issue:', error);
      alert('Failed to submit issue. Please try again.\n' + (error.message || JSON.stringify(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Issue</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="issue-form">
          <div className="form-group">
            <label htmlFor="type">Issue Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select issue type</option>
              {issueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Conditional Town Dropdown */}
          {formData.type === 'Towns' && (
            <div className="form-group">
              <label htmlFor="town">Select Town *</label>
              <select
                id="town"
                name="town"
                value={selectedTown}
                onChange={e => setSelectedTown(e.target.value)}
                required
              >
                <option value="">Select town</option>
                {towns.map(town => (
                  <option key={town[FIELDS.TOWN.ID]} value={town[FIELDS.TOWN.ID]}>
                    {town[FIELDS.TOWN.TOWN_NAME_EN]} {town[FIELDS.TOWN.TOWN_NAME_ML] ? ` / ${town[FIELDS.TOWN.TOWN_NAME_ML]}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="form-group">
            <label>Location *</label>
            <div style={{ height: 250, borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative' }}>
              <MapContainer
                center={location}
                zoom={16}
                style={{ width: '100%', height: '100%' }}
                dragging={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                touchZoom={true}
                zoomControl={true}
                attributionControl={false}
                onMoveend={e => {
                  const center = e.target.getCenter();
                  setLocation([center.lat, center.lng]);
                  setLocationSet(false);
                  setLocationUrl('');
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <CenterMarker onChange={handleLocationChange} />
              </MapContainer>
            </div>
            {/* Set Location button is clearly below the map */}
            <button type="button" style={{ margin: '8px 0', width: '100%', fontWeight: 600, fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 10 }} onClick={handleSetLocation}>
              Set Location
            </button>
            {locationSet && locationUrl && (
              <div style={{ color: 'green', marginTop: 4, wordBreak: 'break-all' }}>Location set!<br /><span style={{ fontSize: 12 }}>{locationUrl}</span></div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="photos">Photos *</label>
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              required
            />
            
            {formData.photos.length > 0 && (
              <div className="photo-preview">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="photo-item">
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Preview ${index + 1}`}
                      style={{ width: 60, height: 60, objectFit: 'cover' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(index)}
                      className="remove-photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddIssueModal;