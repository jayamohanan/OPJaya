import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ChoroplethMapRect.css';
import { CATEGORY_COLORS, CATEGORY_HARD_COLORS } from '../constants/categoryColors';

// Palette 5 – Green → Light Green → Orange-Red
const PALETTE_5 = {
  Perfect: '#388E3C',
  Good: '#689F38',
  Normal: '#D84315',
  default: '#757575'
};
const PALETTE_5_HARD = {
  Perfect: '#4CAF50',
  Good: '#8BC34A',
  Normal: '#FF5722',
  default: '#E0E0E0'
};

function FitBounds({ geojson, setDebugBounds }) {
  const map = useMap();
  useEffect(() => {
    if (geojson) {
      const layer = window.L ? window.L.geoJSON(geojson) : null;
      try {
        if (layer) {
          const bounds = layer.getBounds();
          setDebugBounds([bounds.getSouthWest(), bounds.getNorthEast()]); // pass as array for Rectangle
          map.fitBounds(bounds, { padding: [2, 2] }); // restore default padding and remove forced zoom
        }
      } catch {}
    }
  }, [geojson, map, setDebugBounds]);
  return null;
}

function ChoroplethMapRect({ geojsonUrl, featureType, featureCategories, style, hoverHighlightStyle }) {
  const [geojson, setGeojson] = useState(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [hoveredFeatureName, setHoveredFeatureName] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [debugBounds, setDebugBounds] = useState(null); // debug bounds
  const [fullscreen, setFullscreen] = useState(false);
  const popupRef = React.useRef();
  const mapRectRef = React.useRef();

  useEffect(() => {
    if (!geojsonUrl) return;
    fetch(geojsonUrl)
      .then(res => res.json())
      .then(setGeojson);
  }, [geojsonUrl]);

  // Helper to get category for a feature
  function getCategory(feature) {
    let name = feature.properties?.local_body_name_en || feature.properties?.assembly_name_en || feature.properties?.Name || feature.properties?.name || '';
    name = (name || '').trim().toLowerCase();
    let matchFound = false;
    let matchedValue = null;
    // Find in featureCategories by English name
    const found = featureCategories.find(f => {
      
      const fcName = (f.name_en || '').trim().toLowerCase();
      
      const isMatch = fcName === name;
      if (isMatch) {
        matchFound = true;
        matchedValue = fcName;
      }
      return isMatch && f.category;
    });
    if (matchFound) {
    } 
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

  // Helper to get type for a feature
  function getType(feature) {
    let name_en = (feature.properties?.local_body_name_en || feature.properties?.Name || '').toLowerCase().trim();
    const found = featureCategories.find(f => (f.name_en || '').toLowerCase().trim() === name_en);
    return found && found.type ? found.type.trim() : '';
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
        color: '#fff', // boundary color set to white
      };
    }
    return {
      fillColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.default,
      weight: 1,
      opacity: 1,
      color: '#fff', // boundary color set to white
      fillOpacity: 0.8
    };
  }

  function getContrastTextColor(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substr(0,2),16);
    const g = parseInt(hex.substr(2,2),16);
    const b = parseInt(hex.substr(4,2),16);
    const luminance = (0.299*r + 0.587*g + 0.114*b)/255;
    return luminance > 0.6 ? '#111' : '#fff';
  }

  // Render a Tooltip for each feature using GeoJSON's onEachFeature
  function onEachFeature(feature, layer) {
    const name = getDisplayName(feature);
    let name_en = (feature.properties?.local_body_name_en || feature.properties?.Name || '').toLowerCase().trim();
    const found = featureCategories.find(f => (f.name_en || '').toLowerCase().trim() === name_en);
    const typeId = found && found.type ? found.type.trim().toUpperCase() : '';
    let typeMarker = '';
    // if (typeId === 'MUNICIPALITY') typeMarker = '<div style="text-align:center;font-size:20px;">🇲</div>';
    // else if (typeId === 'CORPORATION') typeMarker = '<div style="text-align:center;font-size:20px;">🇨</div>';
     if (typeId === 'MUNICIPALITY') typeMarker = '<div style="text-align:center;font-size:20px;"></div>';
    else if (typeId === 'CORPORATION') typeMarker = '<div style="text-align:center;font-size:20px;"></div>';
    const category = getCategory(feature);
    const fillColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
    const textColor = '#111'; // always use black for map label text
    if (name) {
      layer.bindTooltip(
        `<div style='font-weight:600;font-size:11px;color:#fff; text-align:center; -webkit-text-stroke: 0.1px #000;'>${name}${typeMarker}</div>`,
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
      {/* Fullscreen button */}
      <button
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 2001,
          background: 'rgba(255,255,255,0.95)',
          border: 'none',
          borderRadius: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: 18
        }}
        title="Fullscreen"
        onClick={() => setFullscreen(true)}
      >
        &#x26F6;
      </button>
      {/* Main map */}
      <div style={{ width: 600, aspectRatio: '1', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#fff', position: 'relative' }}>
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
              key={featureCategories.length} 
              data={geojson}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}
          {geojson && <FitBounds geojson={geojson} setDebugBounds={setDebugBounds} />}
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
      {/* Fullscreen popup overlay */}
      {fullscreen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.98)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            style={{
              position: 'absolute',
              top: 24,
              right: 32,
              zIndex: 3001,
              background: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: 18
            }}
            title="Close"
            onClick={() => setFullscreen(false)}
          >
            &#x2715;
          </button>
          <div style={{ width: '90vw', height: '90vh', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', background: '#fff', position: 'relative' }}>
            <MapContainer
              style={{ width: '100%', height: '100%', borderRadius: 16 }}
              zoom={10}
              center={[10.8, 76.2]}
              scrollWheelZoom={true}
              dragging={true}
              doubleClickZoom={true}
              zoomControl={true}
              attributionControl={false}
            >
              {geojson && (
                <GeoJSON
                  key={featureCategories.length + '-fullscreen'}
                  data={geojson}
                  style={styleFeature}
                  onEachFeature={onEachFeature}
                />
              )}
              {geojson && <FitBounds geojson={geojson} setDebugBounds={setDebugBounds} />}
            </MapContainer>
          </div>
        </div>
      )}
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
          {/* Add local body type to tooltip */}
          <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
            {(() => {
              // Try to get type from featureCategories by name_en
              const name_en = (popupInfo.properties?.local_body_name_en || popupInfo.properties?.Name || '').toLowerCase().trim();
              const found = featureCategories.find(f => f.name_en === name_en);
              return found && found.type ? found.type : '';
            })()}
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
