import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import RankingSection from '../components/RankingSection';
import { LanguageContext } from '../components/LanguageContext';
import MapSection from '../components/MapSection';
import ChoroplethMapRect from '../components/ChoroplethMapRect';
import React from 'react';

function DistrictPage() {
  const { districtName: districtId } = useParams();
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [assemblies, setAssemblies] = useState([]); // [{ id, name, category }]
  const [district, setDistrict] = useState(null);
  const [mapTab, setMapTab] = useState('choropleth');

  useEffect(() => {
    async function fetchData() {
      // Fetch district by ID (get both _ml and _en)
      const { data: districtData, error: districtError } = await supabase
        .from('district')
        .select('district_id, district_name_en, district_name_ml')
        .eq('district_id', districtId)
        .single();
      if (districtError || !districtData) {
        setAssemblies([]);
        setDistrict(null);
        return;
      }
      setDistrict(districtData);

      // Fetch all assemblies in this district with their category (get both _ml and _en)
      const { data: asms, error: asmError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, assembly_name_ml, assembly_category(category)')
        .eq('district_id', districtData.district_id);
      if (asmError) {
        setAssemblies([]);
      } else {
        setAssemblies(
          (asms || []).map(a => ({
            id: a.assembly_id,
            name: lang === 'ml' ? (a.assembly_name_ml || a.assembly_name_en) : (a.assembly_name_en || a.assembly_name_ml),
            category: a.assembly_category?.category || 'Normal'
          }))
        );
      }
    }
    fetchData();
  }, [districtId, lang]);

  // Get English name for geojson path
  const districtNameEn = district?.district_name_en || '';
  const geojsonUrl = districtNameEn
    ? `https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/geojson/districts/with-assemblies/${encodeURIComponent(districtNameEn.toLowerCase())}.geojson`
    : null;

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  // Prepare items for RankingSection
  const rankingItems = assemblies; // assemblies already has id, name, category

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>
        District: {lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
      </h1>
      {/* Combined Map Section with Tabs */}
      {geojsonUrl && (
        <div style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 32, padding: 0, overflow: 'hidden', maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', borderBottom: '1px solid #eee', background: '#f7f7f7' }}>
            <div style={{ display: 'flex', width: 400, maxWidth: '100%' }}>
              <button onClick={() => setMapTab('choropleth')} style={{ flex: 1, padding: 16, border: 'none', background: mapTab === 'choropleth' ? '#fff' : 'transparent', fontWeight: mapTab === 'choropleth' ? 700 : 400, borderBottom: mapTab === 'choropleth' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}>Rank</button>
              <button onClick={() => setMapTab('base')} style={{ flex: 1, padding: 16, border: 'none', background: mapTab === 'base' ? '#fff' : 'transparent', fontWeight: mapTab === 'base' ? 700 : 400, borderBottom: mapTab === 'base' ? '2px solid #1976d2' : 'none', cursor: 'pointer' }}>Map</button>
            </div>
          </div>
          <div style={{ padding: 0, minHeight: 420, maxWidth: 900, margin: '0 auto' }}>
            {mapTab === 'choropleth' && (
              <ChoroplethMapRect
                geojsonUrl={geojsonUrl}
                featureType="assembly"
                featureCategories={assemblies.map(a => ({
                  ...a,
                  name: (a.name || '').toLowerCase()
                }))}
                showBaseMap={true}
                fillOpacity={0.4}
                tileLayerUrl={"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
                hoverHighlightStyle={{ weight: 4, color: '#1976d2', fillOpacity: 0.5 }}
              />
            )}
            {mapTab === 'base' && (
              <MapSection
                geojsonUrl={geojsonUrl}
                title={lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
                zoomControl={false}
              />
            )}
          </div>
        </div>
      )}
      {/* Ranking Section */}
      <RankingSection
        title={
          (lang === 'ml'
            ? (district?.district_name_ml || district?.district_name_en)
            : (district?.district_name_en || district?.district_name_ml)) + ' Ranking'
        }
        items={rankingItems}
        categories={rankingCategories}
        itemType="assembly"
      />
    </div>
  );
}

export default DistrictPage;