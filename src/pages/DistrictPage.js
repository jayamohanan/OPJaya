import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import RankingSection from '../components/RankingSection';
import { LanguageContext } from '../components/LanguageContext';
import MapSection from '../components/MapSection';
import GeojsonOutlineRect from '../components/GeojsonOutlineRect';
import ChoroplethMapRect from '../components/ChoroplethMapRect';

function DistrictPage() {
  const { districtName: districtId } = useParams();
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const [assemblies, setAssemblies] = useState([]); // [{ id, name, category }]
  const [district, setDistrict] = useState(null);

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
      {/* Map Section with OSM base map */}
      {geojsonUrl && (
        <div>
          <h2 style={{ margin: '16px 0 8px 0' }}>District Map (with Base Map)</h2>
          <MapSection
            geojsonUrl={geojsonUrl}
            title={lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
          />
        </div>
      )}
      {/* Outline-only clickable map section */}
      {geojsonUrl && (
        <div>
          <h2 style={{ margin: '32px 0 8px 0' }}>District Map (Clickable Outlines)</h2>
          <GeojsonOutlineRect
            geojsonUrl={geojsonUrl}
            featureType="assembly"
          />
        </div>
      )}
      {/* Choropleth map section */}
      {geojsonUrl && (
        <div>
          <h2 style={{ margin: '32px 0 8px 0' }}>District Map (Choropleth by Category)</h2>
          <ChoroplethMapRect
            geojsonUrl={geojsonUrl}
            featureType="assembly"
            featureCategories={assemblies.map(a => ({
              ...a,
              name: (a.name || '').toLowerCase() // ensure lower case for matching
            }))}
          />
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