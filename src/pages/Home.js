import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { supabase } from '../supabaseClient';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedAssembly, setSelectedAssembly] = useState('');
  const [selectedLocalBody, setSelectedLocalBody] = useState('');

  // Separate loading states for each dropdown
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingAssemblies, setLoadingAssemblies] = useState(false);
  const [loadingLocalBodies, setLoadingLocalBodies] = useState(false);

  // Fetch all districts on mount
  useEffect(() => {
    async function fetchDistricts() {
      setLoadingDistricts(true);
      const { data, error } = await supabase
        .from('lb_data')
        .select('District');
      if (error) {
        console.error("Error fetching districts from Supabase:", error);
      } else {
        const uniqueDistricts = [
          ...new Set(
            data
              .map(row => row.District && row.District.trim())
              .filter(Boolean)
          ),
        ].sort();
        setDistricts(uniqueDistricts);
      }
      setLoadingDistricts(false);
    }
    fetchDistricts();
  }, []);

  // Fetch assemblies when district changes
  useEffect(() => {
    if (selectedDistrict) {
      async function fetchAssemblies() {
        setLoadingAssemblies(true);
        const { data, error } = await supabase
          .from('lb_data')
          .select('Assembly')
          .ilike('District', selectedDistrict);
        if (error) {
          console.error("Error fetching assemblies from Supabase:", error);
        } else {
          const uniqueAssemblies = [...new Set(data.map(row => row.Assembly?.trim()).filter(Boolean))].sort();
          setAssemblies(uniqueAssemblies);
        }
        setSelectedAssembly('');
        setSelectedLocalBody('');
        setLocalBodies([]);
        setLoadingAssemblies(false);
      }
      fetchAssemblies();
    }
  }, [selectedDistrict]);

  // Fetch local bodies when assembly changes
  useEffect(() => {
    if (selectedAssembly && selectedDistrict) {
      async function fetchLocalBodies() {
        setLoadingLocalBodies(true);
        const { data, error } = await supabase
          .from('lb_data')
          .select('"Local Body", "Local Body Type", Name_std_ml, "LSG Code"')
          .ilike('District', selectedDistrict)
          .ilike('Assembly', selectedAssembly);
        if (error) {
          console.error("Error fetching local bodies from Supabase:", error);
        } else {
          const filteredLocalBodies = data
            .filter(row =>
              ['GP', 'Municipality', 'Corporation'].includes(row['Local Body Type'])
            )
            .map(row => ({
              name: row['Local Body']?.trim(),
              type: row['Local Body Type']?.trim(),
              nameMalayalam: row['Name_std_ml'],
              lsgCode: row['LSG Code']
            }))
            .filter(lb => lb.name)
            .sort((a, b) => a.name.localeCompare(b.name));
          setLocalBodies(filteredLocalBodies);
        }
        setSelectedLocalBody('');
        setLoadingLocalBodies(false);
      }
      fetchLocalBodies();
    }
  }, [selectedAssembly, selectedDistrict]);

  const handleSubmit = () => {
    if (selectedLocalBody) {
      const localBodyData = localBodies.find(lb => lb.name === selectedLocalBody);
      if (localBodyData) {
        navigate('/dashboard', {
          state: {
            localBodyName: selectedLocalBody,
            nameMalayalam: localBodyData.nameMalayalam || selectedLocalBody,
            localBodyType: localBodyData.type,
            district: selectedDistrict,
            assembly: selectedAssembly,
            lsgCode: localBodyData.lsgCode || ''
          }
        });
      }
    }
  };

  return (
    <div className="home-container">
      {/* Universal Top Navigation Bar */}
      <TopNav />
      
      <div className="main-content">
        <div className="dropdown-container">
          <h2>Select Your Location</h2>
          
          <div className="dropdown-group">
            <label htmlFor="district-select">Select District:</label>
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="dropdown"
              disabled={loadingDistricts}
            >
              {loadingDistricts ? (
                <option disabled>
                  <span className="dropdown-spinner"></span>Loading...
                </option>
              ) : (
                <>
                  <option value="">-- Select District --</option>
                  {districts.map(district => (
                    <option key={district} value={district}>{district}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="assembly-select">Select Assembly:</label>
            <select
              id="assembly-select"
              value={selectedAssembly}
              onChange={(e) => setSelectedAssembly(e.target.value)}
              disabled={!selectedDistrict || loadingAssemblies}
              className="dropdown"
            >
              {loadingAssemblies ? (
                <option disabled>
                  <span className="dropdown-spinner"></span>Loading...
                </option>
              ) : (
                <>
                  <option value="">-- Select Assembly --</option>
                  {assemblies.map(assembly => (
                    <option key={assembly} value={assembly}>{assembly}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="localbody-select">Select Local Body:</label>
            <select
              id="localbody-select"
              value={selectedLocalBody}
              onChange={(e) => setSelectedLocalBody(e.target.value)}
              disabled={!selectedAssembly || loadingLocalBodies}
              className="dropdown"
            >
              {loadingLocalBodies ? (
                <option disabled>
                  <span className="dropdown-spinner"></span>Loading...
                </option>
              ) : (
                <>
                  <option value="">-- Select Local Body --</option>
                  {localBodies.map(localBody => (
                    <option key={localBody.name} value={localBody.name}>
                      {localBody.name} ({localBody.type})
                    </option>
                  ))}
                </>
              )}
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
      </div>

      <footer className="footer">
        <p>Developed by Jayamohanan</p>
      </footer>
    </div>
  );
}

export default Home;
