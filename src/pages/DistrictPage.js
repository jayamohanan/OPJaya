import { useParams } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { supabase } from '../supabaseClient';
import RankingSection from '../components/RankingSection';
import { LanguageContext } from '../components/LanguageContext';
import MapSection from '../components/MapSection';
import GeojsonOutlineRect from '../components/GeojsonOutlineRect';

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

  // Prepare items for RankingSection (example, adjust as needed)
  const rankingItems = assemblies.map(a => ({
    id: a.assembly_id,
    name: lang === 'ml' ? (a.assembly_name_ml || a.assembly_name_en) : (a.assembly_name_en || a.assembly_name_ml),
    // Add more properties as needed
  }));

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>
        District: {lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
      </h1>
      {/* Map Section with OSM base map */}
      {geojsonUrl && (
        <MapSection
          geojsonUrl={geojsonUrl}
          title={lang === 'ml' ? (district?.district_name_ml || district?.district_name_en) : (district?.district_name_en || district?.district_name_ml)}
        />
      )}
      {/* Outline-only clickable map section */}
      {geojsonUrl && (
        <GeojsonOutlineRect
          geojsonUrl={geojsonUrl}
          featureType="assembly"
        />
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