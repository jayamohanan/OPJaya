import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapSection({ geojsonUrl, title }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const popupRef = useRef();
  const mapRef = useRef();

  useEffect(() => {
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(data => setGeojson(data));
  }, [geojsonUrl]);

  // Fit map to geojson bounds
  useEffect(() => {
    if (geojson && mapRef.current) {
      const map = mapRef.current;
      const layer = new window.L.GeoJSON(geojson);
      try {
        map.fitBounds(layer.getBounds(), { padding: [10, 10] });
      } catch {}
    }
  }, [geojson]);

  function onEachFeature(feature, layer) {
    layer.on({
      click: () => {
        setPopupInfo({
          properties: feature.properties
        });
      }
    });
  }

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

  function getDisplayName(properties) {
    return (
      properties?.Name ||
      properties?.name ||
      properties?.local_body_name_en ||
      properties?.assembly_name_en ||
      ''
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 900, margin: '0 auto 32px auto' }}>
      <div style={{ width: 600, aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <MapContainer
          ref={mapRef}
          style={{ width: '100%', height: '100%' }}
          center={[10.5, 76.2]}
          zoom={10}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          attributionControl={true}
          zoomControl={false} // Disable zoom control
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
          />
          {geojson && <GeoJSON data={geojson} style={{ color: '#1976d2', weight: 2, fillOpacity: 0.1 }} onEachFeature={onEachFeature} />}
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
              {getDisplayName(popupInfo.properties)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapSection;
