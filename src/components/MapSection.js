import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapSection({ geojsonUrl, title }) {
  const [geojson, setGeojson] = useState(null);
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

  return (
    <div style={{ width: '100%', maxWidth: 600, aspectRatio: '1', margin: '0 auto 32px auto', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
      <MapContainer
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        center={[10.5, 76.2]}
        zoom={10}
        scrollWheelZoom={false}
        dragging={true}
        doubleClickZoom={false}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://osm.org/copyright'>OpenStreetMap</a> contributors"
        />
        {geojson && <GeoJSON data={geojson} style={{ color: '#1976d2', weight: 2, fillOpacity: 0.1 }} />}
      </MapContainer>
    </div>
  );
}

export default MapSection;
