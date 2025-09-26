import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ChoroplethMapRect.css';

// Palette 1 – Fresh & Natural
const PALETTE_1 = {
  Perfect: '#4CAF50',
  Good: '#FFC107',
  Normal: '#FF7043',
  default: '#E0E0E0'
};
const PALETTE_1_HARD = {
  Perfect: '#388E3C',
  Good: '#FFA000',
  Normal: '#D84315',
  default: '#757575'
};

// Palette 2 – Modern & Polished
const PALETTE_2 = {
  Perfect: '#2196F3',
  Good: '#4CAF50',
  Normal: '#FF9800',
  default: '#E0E0E0'
};
const PALETTE_2_HARD = {
  Perfect: '#1976D2',
  Good: '#388E3C',
  Normal: '#E65100',
  default: '#757575'
};

// Palette 3 – Pastel & Elegant
const PALETTE_3 = {
  Perfect: '#E57373',
  Good: '#64B5F6',
  Normal: '#81C784',
  default: '#E0E0E0'
};
const PALETTE_3_HARD = {
  Perfect: '#D32F2F',
  Good: '#1976D2',
  Normal: '#388E3C',
  default: '#757575'
};

// Palette 4 – Green → Teal → Orange
const PALETTE_4 = {
  Perfect: '#2ECC71', // Fresh green
  Good: '#1ABC9C',   // Clean teal
  Normal: '#E67E22', // Polished orange
  default: '#E0E0E0'
};
const PALETTE_4_HARD = {
  Perfect: '#27AE60',
  Good: '#16A085',
  Normal: '#CA6F1E',
  default: '#757575'
};

// Palette 5 – Green → Light Green → Orange-Red
const PALETTE_5 = {
  Perfect: '#4CAF50',
  Good: '#8BC34A',
  Normal: '#FF5722',
  default: '#E0E0E0'
};
const PALETTE_5_HARD = {
  Perfect: '#388E3C',
  Good: '#689F38',
  Normal: '#D84315',
  default: '#757575'
};

// Palette 6 – Green → Aqua → Coral
const PALETTE_6 = {
  Perfect: '#009688',
  Good: '#4DB6AC',
  Normal: '#FF7043',
  default: '#E0E0E0'
};
const PALETTE_6_HARD = {
  Perfect: '#00796B',
  Good: '#26A69A',
  Normal: '#D84315',
  default: '#757575'
};

const PALETTE_MAP = {
  palette1: { base: PALETTE_1, hard: PALETTE_1_HARD },
  palette2: { base: PALETTE_2, hard: PALETTE_2_HARD },
  palette3: { base: PALETTE_3, hard: PALETTE_3_HARD },
  palette4: { base: PALETTE_4, hard: PALETTE_4_HARD },
  palette5: { base: PALETTE_5, hard: PALETTE_5_HARD },
  palette6: { base: PALETTE_6, hard: PALETTE_6_HARD },
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

function ChoroplethMapRect({ palette = 'palette1', geojsonUrl, featureType, featureCategories, style, hoverHighlightStyle }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [hoveredFeatureName, setHoveredFeatureName] = useState(null);
  const popupRef = React.useRef();

  useEffect(() => {
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(setGeojson);
  }, [geojsonUrl]);

  // Pick color palette based on prop
  const paletteObj = PALETTE_MAP[palette] || PALETTE_MAP['palette1'];
  const CATEGORY_COLORS = paletteObj.base;
  const CATEGORY_HARD_COLORS = paletteObj.hard;

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
    const name = getDisplayName(feature);
    // If this feature is hovered, apply hard color and fillOpacity 0.95
    if (hoveredFeatureName && name === hoveredFeatureName) {
      return {
        fillColor: CATEGORY_HARD_COLORS[category] || CATEGORY_HARD_COLORS.default,
        fillOpacity: 0.95,
        weight: 1,
        opacity: 1,
        color: '#ffffffff',
      };
    }
    return {
      fillColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
      weight: 1,
      opacity: 1,
      color: '#ffffffff',
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
          properties: feature.properties,
          by: 'click'
        });
      },
      mouseover: () => {
        setHoveredFeatureName(name);
        setPopupInfo({
          properties: feature.properties,
          by: 'hover'
        });
        layer.setStyle({
          fillColor: CATEGORY_HARD_COLORS[getCategory(feature)] || CATEGORY_HARD_COLORS.default,
          fillOpacity: 0.95,
          weight: 1,
          opacity: 1,
          color: '#ffffffff',
        });
        console.log('Hovered division:', name);
      },
      mouseout: () => {
        setHoveredFeatureName(null);
        // Only clear popup if it was set by hover
        setPopupInfo(prev => (prev && prev.by === 'hover' ? null : prev));
        layer.setStyle(styleFeature(feature));
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
