import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DistrictPage() {
  const { districtName } = useParams();
  const [assemblies, setAssemblies] = useState([]); // [{ id, name }]
  const [otherDistricts, setOtherDistricts] = useState([]); // [{ id, name }]
  const [district, setDistrict] = useState(null); // { id, name }

  useEffect(() => {
    async function fetchData() {
      // Fetch district by name
      const { data: districtData, error: districtError } = await supabase
        .from('district')
        .select('id, name')
        .ilike('name', districtName)
        .single();
      if (districtError || !districtData) {
        console.error('Supabase fetch error (district):', districtError);
        setDistrict(null);
        setAssemblies([]);
        setOtherDistricts([]);
        return;
      }
      setDistrict(districtData);

      // Fetch assemblies in this district
      const { data: asms, error: asmError } = await supabase
        .from('assembly')
        .select('id, name')
        .eq('district_id', districtData.id);
      if (asmError) {
        console.error('Supabase fetch error (assemblies):', asmError);
        setAssemblies([]);
      } else {
        setAssemblies((asms || []).sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Fetch all other districts
      const { data: allDistricts, error: allDistError } = await supabase
        .from('district')
        .select('id, name');
      if (allDistError) {
        setOtherDistricts([]);
      } else {
        setOtherDistricts(
          (allDistricts || [])
            .filter(d => d.id !== districtData.id)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    }
    fetchData();
  }, [districtName]);

  return (
    <div style={{ padding: 40 }}>
      <h1>District: {district ? district.name : districtName}</h1>
      <div>
        <strong>Assemblies in this District:</strong><br />
        {assemblies.length > 0 ? assemblies.map(a => a.name).join(', ') : 'None'}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Other Districts:</strong><br />
        {otherDistricts.length > 0 ? otherDistricts.map(d => d.name).join(', ') : 'None'}
      </div>
    </div>
  );
}

export default DistrictPage;