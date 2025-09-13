import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav'; // Add this import
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import omnivore from '@mapbox/leaflet-omnivore';
import './MapPage.css';

function KMLLayer({ url, onSuccess, onError }) {
  const map = useMap();

  useEffect(() => {
    if (!url) return;
    let kmlLayer;
    let didCancel = false;

    console.log('[MapPage] Looking for KML file at:', url);

    kmlLayer = omnivore.kml(url)
      .on('ready', function() {
        map.fitBounds(kmlLayer.getBounds(), { padding: [20, 20] });
        onSuccess();
        console.log('[MapPage] KML loaded successfully');
      })
      .on('error', function() {
        onError();
        console.error('[MapPage] KML to GeoJSON conversion failed');
      })
      .addTo(map);

    return () => {
      didCancel = true;
      if (kmlLayer) map.removeLayer(kmlLayer);
    };
  }, [url, map, onSuccess, onError]);

  return null;
}

function MapPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const lbName = state?.localBodyName || 'Unknown';
  const lbType = state?.localBodyType || '';
  const kmlUrl = state?.kmlUrl || '';

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="map-container">
      {/* Add Universal Top Navigation Bar */}
      <TopNav />
      
      {/* Remove any existing home/back buttons if they exist */}
      {/* Your existing map content - wrap in map-content div */}
      <div className="map-content" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
        {/* Title */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 16px',
          borderRadius: 4,
          fontSize: 18,
          fontWeight: 'bold'
        }}>
          {lbName} {lbType} - Map
        </div>

        {/* Full-page map */}
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          zoom={13}
          center={[10, 76]}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {kmlUrl && (
            <KMLLayer
              url={kmlUrl}
              onSuccess={() => console.log('[MapPage] Map loaded')}
              onError={() => console.error('[MapPage] Map load error')}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;