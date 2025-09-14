import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

function AssemblyPage() {
  const { assemblyName } = useParams();
  const [localBodies, setLocalBodies] = useState([]);
  const [otherAssemblies, setOtherAssemblies] = useState([]);
  const [district, setDistrict] = useState('');

  useEffect(() => {
    async function fetchData() {
      // Fetch all local bodies in this assembly
      const { data: lbs, error } = await supabase
        .from('lb_data') // <-- updated table name
        .select('*')
        .ilike('Assembly', assemblyName); // case-insensitive match

      if (error) {
        console.error('Supabase fetch error:', error);
        return;
      }

      setLocalBodies(lbs.map(d => d['Local Body']));

      const districtName = lbs[0]?.District;
      setDistrict(districtName);

      // Fetch all other assemblies in the same district
      if (districtName) {
        const { data: allInDistrict, error: error2 } = await supabase
          .from('lb_data') // <-- updated table name
          .select('Assembly, District')
          .ilike('District', districtName);

        if (!error2) {
          const assemblies = allInDistrict
            .map(d => d.Assembly)
            .filter(a => a && a.toLowerCase() !== assemblyName.toLowerCase());
          setOtherAssemblies([...new Set(assemblies)]);
        }
      }
    }
    fetchData();
  }, [assemblyName]);

  return (
    <div style={{ padding: 40 }}>
      <h1>Assembly: {assemblyName}</h1>
      <div>
        <strong>Local Bodies in this Assembly:</strong><br />
        {localBodies.length > 0 ? localBodies.join(', ') : 'None'}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Other Assemblies in {district || 'this district'}:</strong><br />
        {otherAssemblies.length > 0 ? otherAssemblies.join(', ') : 'None'}
      </div>
    </div>
  );
}

export default AssemblyPage;