import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ChoroplethMapRect.css';

const CATEGORY_COLORS = {
  Perfect: '#A5D6A7', // soft green
  Good: '#FFF59D',    // soft yellow
  Normal: '#FFCC80',  // soft orange
  default: '#E0E0E0'  // fallback grey
};

function FitBounds({ geojson }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      const layer = window.L ? window.L.geoJSON(geojson) : null;
      try {
        if (layer) {
          const bounds = layer.getBounds();
          // Use a small positive padding for a tight fit, but not too zoomed out
          map.fitBounds(bounds, { padding: [2, 2] });
        }
      } catch {}
    }
  }, [geojson, map]);
  return null;
}

function ChoroplethMapRect({ geojsonUrl, featureType, featureCategories, style }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const popupRef = React.useRef();

  useEffect(() => {
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(setGeojson);
  }, [geojsonUrl]);

  // Helper to get category for a feature
  function getCategory(feature) {
    let name = feature.properties?.Name || feature.properties?.name || feature.properties?.local_body_name_en || feature.properties?.assembly_name_en;
    if (!name) return 'Normal';
    // Find in featureCategories by name (case-insensitive, trim)
    const found = featureCategories.find(
      f => (f.local_body_name_en || '').trim().toLowerCase() === name.trim().toLowerCase() && f.category
    );

    if (found && found.category) {
      return found.category.trim();
    }
    return 'Normal';
  }

  // Helper to get display name
  function getDisplayName(feature) {
    return (
      feature.properties?.Name ||
      feature.properties?.name ||
      feature.properties?.local_body_name_en ||
      feature.properties?.assembly_name_en ||
      ''
    );
  }

  // Style for each feature
  function styleFeature(feature) {
    const category = getCategory(feature);
    return {
      fillColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
      weight: 1,
      opacity: 1,
      color: '#ffffffff',
      
      // color: '#555',

      fillOpacity: 0.8
    };
  }

  // Render a Tooltip for each feature using GeoJSON's onEachFeature
  function onEachFeature(feature, layer) {
    const name = getDisplayName(feature);
    if (name) {
      layer.bindTooltip(
        `<span style='font-weight:600;font-size:11px;color:#111; background: none !important; background-color: transparent !important;'>${name}</span>`,
        { direction: 'center', permanent: true, className: 'choropleth-label', sticky: false }
      );
    }
    layer.on({
      click: () => {
        setPopupInfo({
          properties: feature.properties
        });
      }
    });
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: 900, margin: '32px auto' }}>
      <div style={{ width: 600, aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#f8fafd', position: 'relative' }}>
        <MapContainer
          style={{ width: '100%', height: '100%', borderRadius: 16 }}
          zoom={10}
          center={[10.8, 76.2]}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
        >
          {geojson && (
            <GeoJSON
              data={geojson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
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
              {getDisplayName({ properties: popupInfo.properties })}
            </div>
            <div style={{ color: '#444', fontSize: 15, marginBottom: 12 }}>
              {getCategory({ properties: popupInfo.properties })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChoroplethMapRect;
