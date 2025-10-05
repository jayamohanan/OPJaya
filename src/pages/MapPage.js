import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav'; // Add this import
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPage.css';
import { LanguageContext } from '../components/LanguageContext';
import { supabase } from '../supabaseClient';
import { LABELS } from '../constants/labels';
import { FIELDS } from '../constants/dbSchema';
import L from 'leaflet';
import TownIssuesModal from '../components/TownIssuesModal';

function GeoJsonLayer({ url, onSuccess, onError }) {
  const map = useMap();

  useEffect(() => {
    if (!url) return;
    let geoJsonLayer;
    let didCancel = false;
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

function TownMarkers({ localBodyId, onTownClick }) {
  const { lang } = useContext(LanguageContext);
  const [towns, setTowns] = useState([]);

  useEffect(() => {
    async function fetchTowns() {
      if (!localBodyId) return;
      const { data: townsData } = await supabase
        .from('town')
        .select([
          FIELDS.TOWN.ID,
          FIELDS.TOWN.TOWN_NAME_EN,
          FIELDS.TOWN.TOWN_NAME_ML,
          LABELS.TOWN_LAT,
          LABELS.TOWN_LNG
        ].join(', '))
        .eq(FIELDS.TOWN.LOCAL_BODY_ID, localBodyId);
      setTowns(townsData || []);
    }
    fetchTowns();
  }, [localBodyId]);

  return towns.map(town => {
    if (town[LABELS.TOWN_LAT] && town[LABELS.TOWN_LNG]) {
      const label = lang === 'ml' ? (town[FIELDS.TOWN.TOWN_NAME_ML] || town[FIELDS.TOWN.TOWN_NAME_EN]) : (town[FIELDS.TOWN.TOWN_NAME_EN] || town[FIELDS.TOWN.TOWN_NAME_ML]);
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
          key={town[FIELDS.TOWN.ID]}
          position={[parseFloat(town[LABELS.TOWN_LAT]), parseFloat(town[LABELS.TOWN_LNG])]}
          icon={iconWithLabel}
          eventHandlers={{
            click: () => onTownClick(town[FIELDS.TOWN.ID])
          }}
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
  const geojsonFileName = state?.localBodyData?.[FIELDS.LOCAL_BODY.ID] ? `${state.localBodyData[FIELDS.LOCAL_BODY.ID]}.geojson` : '';
  const geojsonUrl = geojsonFileName ? `/geojson/local-bodies/outlines/${geojsonFileName}` : '';

  const [townsMap, setTownsMap] = useState({});
  const [issuesByTown, setIssuesByTown] = useState({});
  const [selectedTownId, setSelectedTownId] = useState(null);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  useEffect(() => {
    async function fetchTownsAndIssues() {
      if (!state?.localBodyData?.[FIELDS.LOCAL_BODY.ID]) return;
      // Fetch towns
      const { data: towns } = await supabase
        .from('town')
        .select('*')
        .eq(FIELDS.TOWN.LOCAL_BODY_ID, state.localBodyData[FIELDS.LOCAL_BODY.ID]);
      const map = {};
      (towns || []).forEach(town => { map[town[FIELDS.TOWN.ID]] = town; });
      setTownsMap(map);
      // Fetch issues for towns
      const { data: issues } = await supabase
        .from('issues')
        .select('*')
        .eq(FIELDS.ISSUES.LOCAL_BODY_ID, state.localBodyData[FIELDS.LOCAL_BODY.ID]);
      const grouped = {};
      (issues || []).forEach(issue => {
        if (issue[FIELDS.ISSUES.TOWN_ID]) {
          if (!grouped[issue[FIELDS.ISSUES.TOWN_ID]]) grouped[issue[FIELDS.ISSUES.TOWN_ID]] = [];
          grouped[issue[FIELDS.ISSUES.TOWN_ID]].push(issue);
        }
      });
      setIssuesByTown(grouped);
    }
    fetchTownsAndIssues();
  }, [state?.localBodyData?.[FIELDS.LOCAL_BODY.ID]]);

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
          {state?.localBodyData?.[FIELDS.LOCAL_BODY.ID] && <TownMarkers localBodyId={state.localBodyData[FIELDS.LOCAL_BODY.ID]} onTownClick={setSelectedTownId} />}
        </MapContainer>
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
    </div>
  );
}

export default MapPage;