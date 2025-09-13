import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function DistrictPage() {
  const { districtName } = useParams();
  const [assemblies, setAssemblies] = useState([]);
  const [otherDistricts, setOtherDistricts] = useState([]);

  useEffect(() => {
    console.log('1. The district name from URL is:', districtName);

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

        // Print all unique Districts for debugging
        console.log('All unique Districts in CSV:', [...new Set(data.map(d => d['District']))]);

        // Robust match: ignore case and trim spaces, use "District" field
        console.log('3. Searching assemblies in district...');
        const asms = data
          .filter(d =>
            d['District'] &&
            d['District'].trim().toLowerCase() === districtName.trim().toLowerCase()
          )
          .map(d => d['Assembly']);
        console.log('4. Found these assemblies:', [...new Set(asms)]);

        setAssemblies([...new Set(asms)]);

        // All other districts
        const dists = data
          .map(d => d['District'])
          .filter(d => d && d.trim().toLowerCase() !== districtName.trim().toLowerCase());
        setOtherDistricts([...new Set(dists)]);
      });
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