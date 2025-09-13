import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import './AddIssueModal.css';

const issueTypes = [
  'Towns',
  'Roads', 
  'Bus Stands/Bus Stops',
  'Water Bodies',
  'Bin Install and Upkeep',
  'Bin Usage'
];

function AddIssueModal({ isOpen, onClose, localBodyData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    locationUrl: '',
    photos: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const uploadToR2 = async (file, filename) => {
    try {
      const r2Url = `https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/issues/${localBodyData.lsgCode}/${filename}`;
      console.log('Would upload to:', r2Url);
      await new Promise(resolve => setTimeout(resolve, 500));
      return r2Url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const issueData = {
        id: issueId,
        localBodyData: localBodyData,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        locationUrl: formData.locationUrl,
        photos: photoUrls,
        createdAt: new Date().toISOString(),
        status: 'open'
      };

      const issueJsonBlob = new Blob([JSON.stringify(issueData, null, 2)], {
        type: 'application/json'
      });
      
      await uploadToR2(issueJsonBlob, `${issueId}.json`);

      alert('Issue submitted successfully!');
      
      setFormData({
        title: '',
        description: '',
        type: '',
        locationUrl: '',
        photos: []
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to submit issue:', error);
      alert('Failed to submit issue. Please try again.');
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
            <label htmlFor="title">Issue Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Brief description of the issue"
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Detailed description of the issue"
            />
          </div>

          <div className="form-group">
            <label htmlFor="locationUrl">Location URL</label>
            <input
              type="url"
              id="locationUrl"
              name="locationUrl"
              value={formData.locationUrl}
              onChange={handleInputChange}
              placeholder="Google Maps link or coordinates"
            />
          </div>

          <div className="form-group">
            <label htmlFor="photos">Photos</label>
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
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