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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const popupRef = React.useRef();
  const mapRectRef = React.useRef();

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
    let name = feature.properties?.local_body_name_en || feature.properties?.assembly_name_en || feature.properties?.Name || feature.properties?.name || '';
    name = (name || '').trim().toLowerCase();
    // Find in featureCategories by English name
    const found = featureCategories.find(f => f.name_en === name && f.category);
    if (found && found.category) {
      return found.category.trim();
    }
    return 'Normal';
  }

  // Helper to convert a string to title case
  function toTitleCase(str) {
    return (str || '').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  // Helper to get display name in English and title case
  function getDisplayName(feature) {
    let name = feature.properties?.local_body_name_en || feature.properties?.assembly_name_en || feature.properties?.Name || feature.properties?.name || '';
    return toTitleCase(name);
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
        `<span style='font-weight:600;font-size:11px;color:#111; background: none !important; background-color: transparent !important;'>${getDisplayName(feature)}</span>`,
        { direction: 'center', permanent: true, className: 'choropleth-label', sticky: false }
      );
    }
    layer.on({
      click: (e) => {
        setPopupInfo({
          properties: feature.properties,
          by: 'click'
        });
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
      },
      mouseover: (e) => {
        setHoveredFeatureName(name);
        setPopupInfo({
          properties: feature.properties,
          by: 'hover'
        });
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
        layer.setStyle({
          fillColor: CATEGORY_HARD_COLORS[getCategory(feature)] || CATEGORY_HARD_COLORS.default,
          fillOpacity: 0.95,
          weight: 1,
          opacity: 1,
          color: '#ffffffff',
        });
        console.log('Hovered division:', name);
      },
      mousemove: (e) => {
        setMousePos({ x: e.originalEvent.clientX, y: e.originalEvent.clientY });
      },
      mouseout: () => {
        setHoveredFeatureName(null);
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

  // Legend categories and order
  const legendItems = [
    { key: 'Perfect', label: 'Perfect', color: CATEGORY_COLORS.Perfect },
    { key: 'Good', label: 'Good', color: CATEGORY_COLORS.Good },
    { key: 'Normal', label: 'Normal', color: CATEGORY_COLORS.Normal },
  ];

  // Helper to calculate tooltip position and arrow direction
  function getTooltipPosition() {
    if (!mapRectRef.current) return { left: mousePos.x + 12, top: mousePos.y + 12, arrow: 'down' };
    const rect = mapRectRef.current.getBoundingClientRect();
    const tooltipWidth = 220;
    const tooltipHeight = 70;
    let left = mousePos.x + 12;
    let top = mousePos.y + 12;
    let arrow = 'down';
    // If too close to right edge, show to left of mouse
    if (left + tooltipWidth > rect.right) {
      left = mousePos.x - tooltipWidth - 12;
    }
    // If too close to bottom edge, show above mouse
    if (top + tooltipHeight > rect.bottom) {
      top = mousePos.y - tooltipHeight - 18;
      arrow = 'up';
    }
    // If too close to left edge, clamp
    if (left < rect.left) left = rect.left + 8;
    // If too close to top edge, clamp
    if (top < rect.top) top = rect.top + 8;
    return { left, top, arrow };
  }
  const tooltipPos = getTooltipPosition();

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={mapRectRef}>
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
        {/* Legend */}
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '6px 10px',
          zIndex: 1000,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {legendItems.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <span style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                background: item.color,
                borderRadius: 3,
                marginRight: 7,
                border: '1px solid #bbb'
              }} />
              <span style={{ fontSize: 12 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Info window as a tooltip near mouse position */}
      {popupInfo && (
        <div
          ref={popupRef}
          className="geojson-popup"
          style={{
            position: 'fixed',
            left: tooltipPos.left,
            top: tooltipPos.top,
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
            {getDisplayName({ properties: popupInfo.properties })}
          </div>
          <div style={{ color: '#444', fontSize: 14, marginBottom: 0 }}>
            {getCategory({ properties: popupInfo.properties })}
          </div>
          {tooltipPos.arrow === 'down' ? (
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
          ) : (
            <div style={{
              position: 'absolute',
              left: 18,
              bottom: '100%',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '10px solid #fff',
              filter: 'drop-shadow(0 -2px 4px rgba(25,118,210,0.13))'
            }} />
          )}
        </div>
      )}
    </div>
  );
}

export default ChoroplethMapRect;
