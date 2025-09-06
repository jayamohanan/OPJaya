import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [csvData, setCsvData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedAssembly, setSelectedAssembly] = useState('');
  const [selectedLocalBody, setSelectedLocalBody] = useState('');
  
  const [loading, setLoading] = useState(true);

  // Load CSV data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching CSV file...');
        const response = await fetch(`${process.env.PUBLIC_URL}/lb_data.csv`);
        const csvText = await response.text();
        console.log('CSV fetched successfully.');

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('CSV parsed.');
            const data = results.data;
            console.log('Parsed data sample (first 5 rows):', data.slice(0, 5));
            
            setCsvData(data);

            // Extract unique districts
            const uniqueDistricts = [...new Set(data.map(row => row.District?.trim()).filter(Boolean))].sort();
            setDistricts(uniqueDistricts);
            console.log('Districts extracted:', uniqueDistricts);
            
            setLoading(false);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading CSV file:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update assemblies when district changes
  useEffect(() => {
    if (selectedDistrict && csvData.length > 0) {
      const filteredAssemblies = [...new Set(
        csvData
          .filter(row => row.District?.trim() === selectedDistrict)
          .map(row => row.Assembly?.trim())
          .filter(Boolean)
      )].sort();
      
      console.log(`Assemblies for district "${selectedDistrict}":`, filteredAssemblies);

      setAssemblies(filteredAssemblies);
      setSelectedAssembly('');
      setSelectedLocalBody('');
      setLocalBodies([]);
    }
  }, [selectedDistrict, csvData]);

  // Update local bodies when assembly changes
  useEffect(() => {
    if (selectedAssembly && csvData.length > 0) {
      const filteredLocalBodies = csvData
        .filter(row => 
          row.District?.trim() === selectedDistrict && 
          row.Assembly?.trim() === selectedAssembly &&
          ['GP', 'Municipality', 'Corporation'].includes(row['Local Body Type'])
        )
        .map(row => ({
          name: row['Local Body']?.trim(),
          type: row['Local Body Type']?.trim()
        }))
        .filter(lb => lb.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      console.log(`Local bodies for assembly "${selectedAssembly}":`, filteredLocalBodies.map(lb => lb.name));

      setLocalBodies(filteredLocalBodies);
      setSelectedLocalBody('');
    }
  }, [selectedAssembly, csvData, selectedDistrict]);

  const handleSubmit = () => {
    if (selectedLocalBody) {
      const localBodyData = localBodies.find(lb => lb.name === selectedLocalBody);
      if (localBodyData) {
        const localBodyId = `${selectedDistrict}_${selectedAssembly}_${selectedLocalBody}`.replace(/\s+/g, '_');
        
        navigate(`/localbody/${localBodyId}`, {
          state: {
            localBodyName: localBodyData.name,
            localBodyType: localBodyData.type,
            assembly: selectedAssembly,
            district: selectedDistrict
          }
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading Kerala Cleanliness Platform...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="header">
        <h1>Kerala Cleanliness Platform</h1>
        <p>Community-led approach to improve cleanliness across all 1034 local bodies of Kerala</p>
      </header>

      <main className="main-content">
        <div className="dropdown-container">
          <h2>Select Your Location</h2>
          
          <div className="dropdown-group">
            <label htmlFor="district-select">Select District:</label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="dropdown"
            >
              <option value="">-- Select District --</option>
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="assembly-select">Select Assembly:</label>
            <select
              id="assembly-select"
              value={selectedAssembly}
              onChange={(e) => setSelectedAssembly(e.target.value)}
              disabled={!selectedDistrict}
              className="dropdown"
            >
              <option value="">-- Select Assembly --</option>
              {assemblies.map(assembly => (
                <option key={assembly} value={assembly}>{assembly}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="localbody-select">Select Local Body:</label>
            <select
              id="localbody-select"
              value={selectedLocalBody}
              onChange={(e) => setSelectedLocalBody(e.target.value)}
              disabled={!selectedAssembly}
              className="dropdown"
            >
              <option value="">-- Select Local Body --</option>
              {localBodies.map(localBody => (
                <option key={localBody.name} value={localBody.name}>
                  {localBody.name} ({localBody.type})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedLocalBody}
            className="submit-btn"
          >
            View Dashboard
          </button>
        </div>
      </main>

      <footer className="footer">
        <p>Developed by Jayamohanan</p>
      </footer>
    </div>
  );
}

export default Home;
