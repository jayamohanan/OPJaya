import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function DistrictPage() {
  const { districtName } = useParams();
  const [assemblies, setAssemblies] = useState([]);
  const [otherDistricts, setOtherDistricts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch all assemblies in this district
      const { data: asms, error } = await supabase
        .from('lb_data') // <-- updated table name
        .select('Assembly, District')
        .ilike('District', districtName);

      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }

      setAssemblies([...new Set(asms.map(d => d.Assembly))]);

      // Fetch all other districts
      const { data: all, error: error2 } = await supabase
        .from('lb_data') // <-- updated table name
        .select('District');

      if (!error2) {
        const dists = all
          .map(d => d.District)
          .filter(d => d && d.toLowerCase() !== districtName.toLowerCase());
        setOtherDistricts([...new Set(dists)]);
      }
    }
    fetchData();
  }, [districtName]);

  return (
    <div style={{ padding: 40 }}>
      <h1>District: {districtName}</h1>
      <div>
        <strong>Assemblies in this District:</strong><br />
        {assemblies.length > 0 ? assemblies.join(', ') : 'None'}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Other Districts:</strong><br />
        {otherDistricts.length > 0 ? otherDistricts.join(', ') : 'None'}
      </div>
    </div>
  );
}

export default DistrictPage;