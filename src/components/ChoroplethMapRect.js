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
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 600,
      aspectRatio: '1/1',
      margin: '0 auto',
      ...style,
      position: 'relative'
    }}>
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
  );
}

export default ChoroplethMapRect;
