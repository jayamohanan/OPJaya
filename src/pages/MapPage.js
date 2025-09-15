import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav'; // Add this import
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';

function GeoJsonLayer({ url, onSuccess, onError }) {
  const map = useMap();

  useEffect(() => {
    if (!url) return;
    let geoJsonLayer;
    let didCancel = false;

    console.log('[MapPage] Looking for GeoJSON file at:', url);

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('GeoJSON not found');
        return response.json();
      })
      .then(geojsonData => {
        geoJsonLayer = window.L.geoJSON(geojsonData, {
          style: {
            color: '#1976d2',
            weight: 2,
            fillColor: '#1976d2',
            fillOpacity: 0.15
          }
        }).addTo(map);
        const bounds = geoJsonLayer.getBounds();
        if (bounds && bounds.isValid && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
        onSuccess();
        console.log('[MapPage] GeoJSON loaded successfully');
      })
      .catch(err => {
        onError();
        console.error('[MapPage] GeoJSON load error', err);
      });

    return () => {
      didCancel = true;
      if (geoJsonLayer) map.removeLayer(geoJsonLayer);
    };
  }, [url, map, onSuccess, onError]);

  return null;
}

function MapPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const lbName = state?.localBodyName || 'Unknown';
  const lbType = state?.localBodyType || '';
  // Compose the GeoJSON file URL for the boundary
  const geojsonFileName = state?.localBodyName ? encodeURIComponent(state.localBodyName.toLowerCase()) + '.geojson' : '';
  const geojsonUrl = geojsonFileName ? `${process.env.PUBLIC_URL}/geojson-repo/local-body-outline/${geojsonFileName}` : '';

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
          {geojsonUrl && (
            <GeoJsonLayer
              url={geojsonUrl}
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