import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { FIELDS } from '../constants/dbSchema';
import { devLog } from '../utils/devLog';


function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      const layer = L.geoJSON(geojson);
      try {
        map.fitBounds(layer.getBounds(), { padding: [10, 10] });
      } catch {}
    }
  }, [geojson, map]);
  return null;
}

function GeojsonOutlineRect({ geojsonUrl, featureType, logAllFeatures }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const navigate = useNavigate();
  const popupRef = useRef();

  useEffect(() => {
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(data => {
        setGeojson(data);
        if (data && data.features && logAllFeatures) {
          devLog('All feature metadata:');
          data.features.forEach((feature, idx) => {
            devLog(`Feature ${idx + 1}:`, feature.properties);
          });
        }
      });
  }, [geojsonUrl, logAllFeatures]);

  // Style for outline only
  const style = {
    color: '#1976d2',
    weight: 2,
    fillOpacity: 0.05,
    fillColor: '#1976d2',
    cursor: 'pointer',
  };

  // Store map instance
  const mapInstanceRef = useRef();

  // Feature click handler
  function onEachFeature(feature, layer) {
    layer.on({
      click: (e) => {
        setPopupInfo({
          mouseX: e.containerPoint.x,
          mouseY: e.containerPoint.y,
          properties: feature.properties
        });
      }
    });
  }

  // Attach map instance
  function handleMapCreated(map) {
    mapInstanceRef.current = map;
  }

  // Close popup when clicking outside
  useEffect(() => {
    function handleDocClick(e) {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupInfo(null);
      }
    }
    if (popupInfo) {
      document.addEventListener('mousedown', handleDocClick);
      return () => document.removeEventListener('mousedown', handleDocClick);
    }
  }, [popupInfo]);

  // Get display name/type from properties
  function toTitleCase(str) {
    if (!str) return '';
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  function getDisplayInfo(properties) {
    if (!properties) return { name: '', type: '' };
    let name = properties.local_body_name_en || properties.name || properties.local_body_name_ml || properties.Name || '';
    let type = properties.local_body_type_en || properties.type || properties.local_body_type_ml || properties.Type || '';
    if (featureType === 'local_body') {
      return {
        name: toTitleCase(name),
        type: toTitleCase(type)
      };
    } else if (featureType === 'assembly') {
      name = properties.assembly_name_en || properties.name || properties.assembly_name_ml || properties.Name || '';
      return {
        name: toTitleCase(name),
        type: 'Assembly'
      };
    }
    return { name: toTitleCase(name), type: toTitleCase(type) };
  }

  // Navigation handler
  function handleGoto() {
    if (!popupInfo) return;
    const props = popupInfo.properties;
    if (featureType === 'local_body' && props[FIELDS.LOCAL_BODY.ID]) {
      navigate(`/localbodydashboard`, { state: { localBodyId: props[FIELDS.LOCAL_BODY.ID] } });
    } else if (featureType === 'assembly' && props.assembly_id) {
      navigate(`/assembly/${props.assembly_id}`);
    }
  }

  // Instead of popup, render info window as a section to the right of the map rect
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 900, margin: '32px auto' }}>
      <div style={{ width: 600, aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#f8fafd', position: 'relative' }}>
        <MapContainer
          whenCreated={handleMapCreated}
          style={{ width: '100%', height: '100%', background: '#f8fafd' }}
          center={[10.5, 76.2]}
          zoom={10}
          scrollWheelZoom={false}
          dragging={true}
          doubleClickZoom={false}
          attributionControl={false}
          zoomControl={false}
        >
          {geojson && <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />}
          {geojson && <FitBounds geojson={geojson} />}
        </MapContainer>
      </div>
      {/* Info window as a section to the right, half the height of map rect, centered */}
      <div style={{ minWidth: 220, width: 300, height: 300, marginLeft: 32, display: 'flex', alignItems: 'center' }}>
        {popupInfo && (
          <div
            ref={popupRef}
            className="geojson-popup"
            style={{
              background: '#fff',
              border: '1px solid #1976d2',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
              padding: 18,
              minWidth: 220,
              width: '100%',
              height: '100%',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginBottom: 6 }}>
              {getDisplayInfo(popupInfo.properties).name}
            </div>
            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>
              {getDisplayInfo(popupInfo.properties).type}
            </div>
            <button onClick={handleGoto} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 18px', fontWeight: 600, cursor: 'pointer' }}>
              Go to page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GeojsonOutlineRect;
