import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav'; // Add this import
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { LanguageContext } from '../components/LanguageContext';
import { supabase } from '../supabaseClient';
import { LABELS } from '../constants/labels';
import L from 'leaflet';

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

function TownMarkers({ localBodyId }) {
  const { lang } = useContext(LanguageContext);
  const [towns, setTowns] = useState([]);

  useEffect(() => {
    async function fetchTowns() {
      if (!localBodyId) return;
      const { data: townsData } = await supabase
        .from('town')
        .select([
          'town_id',
          'town_name_en',
          'town_name_ml',
          LABELS.TOWN_LAT,
          LABELS.TOWN_LNG
        ].join(', '))
        .eq('local_body_id', localBodyId);
      setTowns(townsData || []);
    }
    fetchTowns();
  }, [localBodyId]);

  return towns.map(town => {
    if (town[LABELS.TOWN_LAT] && town[LABELS.TOWN_LNG]) {
      const label = lang === 'ml' ? (town.town_name_ml || town.town_name_en) : (town.town_name_en || town.town_name_ml);
      const iconWithLabel = L.divIcon({
        html: `<div style='display: flex; flex-direction: column; align-items: center;'>
                  <img src='https://cdn-icons-png.flaticon.com/512/684/684908.png' style='width:32px;height:32px;'/>
                  <span style='background: #fff; color: #1976d2; font-size: 13px; font-weight: 600; border-radius: 4px; padding: 2px 6px; margin-top: 2px; box-shadow: 0 1px 4px rgba(0,0,0,0.08);'>${label}</span>
               </div>`,
        className: '',
        iconSize: [32, 44],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
      return (
        <Marker
          key={town.town_id}
          position={[parseFloat(town[LABELS.TOWN_LAT]), parseFloat(town[LABELS.TOWN_LNG])]}
          icon={iconWithLabel}
        />
      );
    }
    return null;
  });
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
          {/* Add town markers for current local body */}
          {state?.localBodyData?.local_body_id && <TownMarkers localBodyId={state.localBodyData.local_body_id} />}
        </MapContainer>
      </div>
    </div>
  );
}

export default MapPage;