import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RankingSection from '../components/RankingSection';

function DistrictPage() {
  const { districtName } = useParams();
  const [assemblies, setAssemblies] = useState([]); // [{ id, name, category }]
  const [district, setDistrict] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch district by name
      const { data: districtData, error: districtError } = await supabase
        .from('district')
        .select('district_id, district_name_en')
        .ilike('district_name_en', districtName)
        .single();
      if (districtError || !districtData) {
        setAssemblies([]);
        setDistrict(null);
        return;
      }
      setDistrict(districtData);

      // Fetch all assemblies in this district with their category
      const { data: asms, error: asmError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, assembly_category(category)')
        .eq('district_id', districtData.district_id);
      if (asmError) {
        setAssemblies([]);
      } else {
        setAssemblies(
          (asms || []).map(a => ({
            id: a.assembly_id,
            name: a.assembly_name_en,
            category: a.assembly_category?.category || 'Normal'
          }))
        );
      }
    }
    fetchData();
  }, [districtName]);

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>District: {districtName}</h1>
      <RankingSection
        title={(district?.district_name_en || districtName) + ' Assembly Ranking'}
        items={assemblies}
        categories={rankingCategories}
      />
    </div>
  );
}

export default DistrictPage;