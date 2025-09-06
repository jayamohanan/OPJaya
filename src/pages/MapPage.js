import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import omnivore from '@mapbox/leaflet-omnivore';
import { useEffect } from 'react';

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
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Navigation buttons */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        gap: 12
      }}>
        <button
          onClick={handleHomeClick}
          style={{
            padding: '8px 12px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          🏠 Home
        </button>
        <button
          onClick={handleBackClick}
          style={{
            padding: '8px 12px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 14
          }}
        >
          ← Back
        </button>
      </div>

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
  );
}

export default MapPage;