import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import RankingSection from '../components/RankingSection';


function AssemblyPage() {
  const { assemblyName } = useParams();
  const [rankedLocalBodies, setRankedLocalBodies] = useState([]); // [{ id, name, category }]
  const [otherAssemblies, setOtherAssemblies] = useState([]); // [{ id, name }]
  const [district, setDistrict] = useState('');
  const [assembly, setAssembly] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Fetch assembly by name
      const { data: assemblyData, error: assemblyError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, district_id')
        .ilike('assembly_name_en', assemblyName)
        .single();
      if (assemblyError || !assemblyData) {
        setRankedLocalBodies([]);
        setOtherAssemblies([]);
        setDistrict('');
        setAssembly(null);
        return;
      }
      setAssembly(assemblyData);

      // Fetch district name
      let districtName = '';
      if (assemblyData.district_id) {
        const { data: districtData, error: districtError } = await supabase
          .from('district')
          .select('district_name_en')
          .eq('district_id', assemblyData.district_id)
          .single();
        if (!districtError && districtData) {
          districtName = districtData.district_name_en;
        }
      }
      setDistrict(districtName);

      // Fetch all local bodies in this assembly with their category
      const { data: lbs, error: lbError } = await supabase
        .from('local_body')
        .select('local_body_id, local_body_name_en, local_body_category(category)')
        .eq('assembly_id', assemblyData.assembly_id);
      if (lbError) {
        setRankedLocalBodies([]);
      } else {
        // Group by category: Perfect > Good > Normal
        const categories = { 'Perfect': [], 'Good': [], 'Normal': [] };
        (lbs || []).forEach(lb => {
          const cat = lb.local_body_category?.category || 'Normal';
          if (categories[cat]) categories[cat].push(lb);
          else categories['Normal'].push(lb);
        });
        setRankedLocalBodies([
          ...categories['Perfect'],
          ...categories['Good'],
          ...categories['Normal']
        ]);
      }

      // Fetch all other assemblies in the same district
      if (assemblyData.district_id) {
        const { data: allInDistrict, error: error2 } = await supabase
          .from('assembly')
          .select('assembly_id, assembly_name_en')
          .eq('district_id', assemblyData.district_id);
        if (!error2 && allInDistrict) {
          setOtherAssemblies(
            allInDistrict
              .filter(a => a.assembly_name_en.toLowerCase() !== assemblyName.toLowerCase())
              .sort((a, b) => a.assembly_name_en.localeCompare(b.assembly_name_en))
          );
        } else {
          setOtherAssemblies([]);
        }
      }
    }
    fetchData();
  }, [assemblyName]);

  // Prepare items for RankingSection
  const rankingItems = rankedLocalBodies.map(lb => ({
    id: lb.local_body_id,
    name: lb.local_body_name_en,
    category: lb.local_body_category?.category || 'Normal'
  }));

  const rankingCategories = [
    { key: 'Perfect', label: '🏅 Perfect', color: '#43a047', bg: '#e8f5e9' },
    { key: 'Good', label: '🥇 Good', color: '#fbc02d', bg: '#fffde7' },
    { key: 'Normal', label: '🥈 Normal', color: '#90a4ae', bg: '#eceff1' }
  ];

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ marginBottom: 24 }}>Assembly: {assemblyName}</h1>
      <RankingSection
        title={assembly?.assembly_name_en + ' Ranking'}
        items={rankingItems}
        categories={rankingCategories}
      />
      <div style={{ marginTop: 16 }}>
        <strong>Other Assemblies in {district || 'this district'}:</strong><br />
        {otherAssemblies.length > 0 ? otherAssemblies.map(a => a.assembly_name_en).join(', ') : 'None'}
      </div>
    </div>
  );
}

export default AssemblyPage;