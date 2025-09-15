import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';


function AssemblyPage() {
  const { assemblyName } = useParams();
  const [localBodies, setLocalBodies] = useState([]); // [{ id, name }]
  const [otherAssemblies, setOtherAssemblies] = useState([]); // [{ id, name }]
  const [district, setDistrict] = useState('');

  useEffect(() => {
    async function fetchData() {
      // Fetch assembly by name
      const { data: assemblyData, error: assemblyError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, district_id')
        .ilike('assembly_name_en', assemblyName)
        .single();
      if (assemblyError || !assemblyData) {
        console.error('Supabase fetch error (assembly):', assemblyError);
        setLocalBodies([]);
        setOtherAssemblies([]);
        setDistrict('');
        return;
      }

      // Fetch district name
      let districtName = '';
      if (assemblyData.district_id) {
        const { data: districtData, error: districtError } = await supabase
          .from('district')
          .select('district_name_en')
          .eq('district_id', assemblyData.district_id)
          .single();
        if (!districtError && districtData) {
          districtName = districtData.name;
        }
      }
      setDistrict(districtName);

      // Fetch all local bodies in this assembly
      const { data: lbs, error: lbError } = await supabase
        .from('local_body')
        .select('local_body_id, local_body_name_en')
        .eq('assembly_id', assemblyData.assembly_id);
      if (lbError) {
        setLocalBodies([]);
      } else {
        setLocalBodies((lbs || []).sort((a, b) => a.local_body_name_en.localeCompare(b.local_body_name_en)));
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
              .sort((a, b) => a.assembly_name_en.localeCompare(b.name))
          );
        } else {
          setOtherAssemblies([]);
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
        {localBodies.length > 0 ? localBodies.map(lb => lb.local_body_name_en).join(', ') : 'None'}
      </div>
      <div style={{ marginTop: 16 }}>
        <strong>Other Assemblies in {district || 'this district'}:</strong><br />
        {otherAssemblies.length > 0 ? otherAssemblies.map(a => a.assembly_name_en).join(', ') : 'None'}
      </div>
    </div>
  );
}

export default AssemblyPage;