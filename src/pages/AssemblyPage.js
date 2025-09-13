import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function AssemblyPage() {
  const { assemblyName } = useParams();
  const [localBodies, setLocalBodies] = useState([]);
  const [otherAssemblies, setOtherAssemblies] = useState([]);
  const [district, setDistrict] = useState('');

  useEffect(() => {
    console.log('1. The assembly name from URL is:', assemblyName);

    fetch('/OPJaya/lb_data.csv')
      .then(res => res.text())
      .then(text => {
        console.log('2. Fetched CSV data, parsing...');
        const rows = text.split('\n').map(r => r.split(','));
        const header = rows[0];
        const data = rows.slice(1).map(row => {
          const obj = {};
          header.forEach((h, i) => obj[h.trim()] = row[i]?.trim());
          return obj;
        });

        // Print all unique Assembly for debugging
        console.log('All unique Assembly in CSV:', [...new Set(data.map(d => d['Assembly']))]);

        // Robust match: ignore case and trim spaces, use "Assembly" field
        console.log('3. Searching local bodies in assembly...');
        const lbs = data.filter(
          d =>
            d['Assembly'] &&
            d['Assembly'].trim().toLowerCase() === assemblyName.trim().toLowerCase()
        );
        console.log('4. Found these local bodies:', lbs.map(d => d['Local Body']));

        setLocalBodies(lbs.map(d => d['Local Body']));

        const districtName = lbs[0]?.District;
        console.log('5. District for this assembly:', districtName);
        setDistrict(districtName);

        // Find other assemblies in the same district (robust match)
        console.log('6. Searching for other assemblies in the same district...');
        const assemblies = data
          .filter(
            d =>
              d.District &&
              districtName &&
              d.District.trim().toLowerCase() === districtName.trim().toLowerCase() &&
              d['Assembly'] &&
              d['Assembly'].trim().toLowerCase() !== assemblyName.trim().toLowerCase()
          )
          .map(d => d['Assembly']);
        console.log('7. Found these other assemblies:', [...new Set(assemblies)]);

        setOtherAssemblies([...new Set(assemblies)]);
      });
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