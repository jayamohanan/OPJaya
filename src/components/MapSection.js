import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import TownIssuesModal from './TownIssuesModal';
import { FIELDS } from '../constants/dbSchema';

function MapSection({ geojsonUrl, title, townsMap = {}, issuesByTown = {} }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedTownId, setSelectedTownId] = useState(null);
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
      click: (e) => {
        const townId = feature.properties?.[FIELDS.TOWN.ID];
        const townName = townId && townsMap[townId] ? townsMap[townId][FIELDS.TOWN.TOWN_NAME_EN] : undefined;
        console.log('Feature clicked:', feature.properties, 'townId:', townId, 'townName:', townName);
        if (townId && townsMap[townId]) {
          setSelectedTownId(townId);
        }
        setPopupInfo({
          properties: feature.properties
        });
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
      },
      mousemove: (e) => {
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
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
      {/* Info window as a tooltip near mouse position */}
      {popupInfo && (
        <div
          ref={popupRef}
          className="geojson-popup"
          style={{
            position: 'fixed',
            left: mousePos.x + 12,
            top: mousePos.y + 12,
            background: '#fff',
            border: '1px solid #1976d2',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
            padding: 14,
            minWidth: 180,
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
            fontSize: 15
          }}
        >
          <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 17, marginBottom: 4 }}>
            {getDisplayName(popupInfo.properties)}
          </div>
          <div style={{ color: '#444', fontSize: 14, marginBottom: 0 }}>
            {/* You can add more info here if needed */}
          </div>
          <div style={{
            position: 'absolute',
            left: 18,
            top: '100%',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '10px solid #fff',
            filter: 'drop-shadow(0 2px 4px rgba(25,118,210,0.13))'
          }} />
        </div>
      )}
      {/* Show TownIssuesModal when a town is selected */}
      {selectedTownId && (
        <TownIssuesModal
          isOpen={!!selectedTownId}
          onClose={() => setSelectedTownId(null)}
          town={selectedTownId}
          issues={issuesByTown[selectedTownId] || []}
          townsMap={townsMap}
        />
      )}
    </div>
  );
}

export default MapSection;
