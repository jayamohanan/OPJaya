import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { supabase } from '../supabaseClient';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]); // [{ district_id, district_name_en, district_name_ml }]
  const [assemblies, setAssemblies] = useState([]); // [{ assembly_id, assembly_name_en, assembly_name_ml, district_id }]
  const [localBodies, setLocalBodies] = useState([]); // [{ local_body_id, local_body_name_en, local_body_type_en, ... }]

  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedAssemblyId, setSelectedAssemblyId] = useState('');
  const [selectedLocalBodyId, setSelectedLocalBodyId] = useState('');

  // Separate loading states for each dropdown
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingAssemblies, setLoadingAssemblies] = useState(false);
  const [loadingLocalBodies, setLoadingLocalBodies] = useState(false);

  // Fetch all districts on mount (from 'district' table)
  useEffect(() => {
    async function fetchDistricts() {
      setLoadingDistricts(true);
      const { data, error } = await supabase
        .from('district')
        .select('district_id, district_name_en, district_name_ml');
      if (error) {
        console.error("Error fetching districts from Supabase:", error);
      } else {
        const sortedDistricts = (data || []).sort((a, b) => a.district_name_en.localeCompare(b.district_name_en));
        setDistricts(sortedDistricts);
      }
      setLoadingDistricts(false);
    }
    fetchDistricts();
  }, []);

  // Fetch assemblies when district changes (from 'assembly' table)
  useEffect(() => {
    if (selectedDistrictId) {
      async function fetchAssemblies() {
        setLoadingAssemblies(true);
        const { data, error } = await supabase
          .from('assembly')
          .select('assembly_id, assembly_name_en, assembly_name_ml, district_id')
          .eq('district_id', selectedDistrictId);
        if (error) {
          console.error("Error fetching assemblies from Supabase:", error);
        } else {
          const sortedAssemblies = (data || []).sort((a, b) => a.assembly_name_en.localeCompare(b.assembly_name_en));
          setAssemblies(sortedAssemblies);
        }
        setSelectedAssemblyId('');
        setSelectedLocalBodyId('');
        setLocalBodies([]);
        setLoadingAssemblies(false);
      }
      fetchAssemblies();
    }
  }, [selectedDistrictId]);

  // Fetch local bodies when assembly changes (from 'local_body' table)
  useEffect(() => {
    if (selectedAssemblyId && selectedDistrictId) {
      async function fetchLocalBodies() {
        setLoadingLocalBodies(true);
        const { data, error } = await supabase
          .from('local_body')
          .select('local_body_id, local_body_name_en, local_body_type_en, block_name_en, district_panchayat_name_en, local_body_name_ml, local_body_type_ml, assembly_id, district_id')
          .eq('assembly_id', selectedAssemblyId);
        if (error) {
          console.error("Error fetching local bodies from Supabase:", error);
        } else {
          const filteredLocalBodies = (data || [])
            .map(row => ({
              local_body_id: row.local_body_id,
              local_body_name_en: row.local_body_name_en?.trim(),
              local_body_type_en: row.local_body_type_en?.trim(),
              block_name_en: row.block_name_en,
              district_panchayat_name_en: row.district_panchayat_name_en,
              local_body_name_ml: row.local_body_name_ml,
              local_body_type_ml: row.local_body_type_ml,
              assembly_id: row.assembly_id,
              district_id: row.district_id
            }))
            .filter(lb => lb.local_body_name_en)
            .sort((a, b) => a.local_body_name_en.localeCompare(b.local_body_name_en));
          setLocalBodies(filteredLocalBodies);
        }
        setSelectedLocalBodyId('');
        setLoadingLocalBodies(false);
      }
      fetchLocalBodies();
    }
  }, [selectedAssemblyId, selectedDistrictId]);

  const handleSubmit = () => {
    if (selectedLocalBodyId) {

      const localBodyData = localBodies.find(lb => lb.local_body_id === selectedLocalBodyId);
      const assemblyData = assemblies.find(a => a.assembly_id === selectedAssemblyId);
      const districtData = districts.find(d => d.district_id === selectedDistrictId);

      if (localBodyData && assemblyData && districtData) {
        navigate('/dashboard', {
          state: {
            localBodyId: localBodyData.local_body_id,
            localBodyName: localBodyData.local_body_name_en,
            nameMalayalam: localBodyData.local_body_name_ml || localBodyData.local_body_name_en,
            localBodyType: localBodyData.local_body_type_en,
            localBodyTypeML: localBodyData.local_body_type_ml,
            blockName: localBodyData.block_name_en,
            districtPanchayatName: localBodyData.district_panchayat_name_en,
            districtId: districtData.district_id,
            district: districtData.district_name_en,
            districtML: districtData.district_name_ml,
            assemblyId: assemblyData.assembly_id,
            assembly: assemblyData.assembly_name_en,
            assemblyML: assemblyData.assembly_name_ml
          }
        });
      }
    }
  };

  // Debug log to show the value of selectedLocalBodyId whenever it changes
  useEffect(() => {
    console.log('selectedLocalBodyId:', selectedLocalBodyId);
  }, [selectedLocalBodyId]);

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
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="dropdown"
              disabled={loadingDistricts}
            >
              {loadingDistricts ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select District --</option>
                  {districts.map(district => (
                    <option key={district.district_id} value={district.district_id}>{district.district_name_en}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="assembly-select">Select Assembly:</label>
            <select
              id="assembly-select"
              value={selectedAssemblyId}
              onChange={(e) => setSelectedAssemblyId(e.target.value)}
              disabled={!selectedDistrictId || loadingAssemblies}
              className="dropdown"
            >
              {loadingAssemblies ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select Assembly --</option>
                  {assemblies.map(assembly => (
                    <option key={assembly.assembly_id} value={assembly.assembly_id}>{assembly.assembly_name_en}</option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="localbody-select">Select Local Body:</label>
            <select
              id="localbody-select"
              value={selectedLocalBodyId}
              onChange={(e) => setSelectedLocalBodyId(e.target.value)}
              disabled={!selectedAssemblyId || loadingLocalBodies}
              className="dropdown"
            >
              {loadingLocalBodies ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select Local Body --</option>
                  {localBodies.map(localBody => (
                    <option key={localBody.local_body_id} value={localBody.local_body_id}>
                      {localBody.local_body_name_en} ({localBody.local_body_type_en})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {console.log('View Dashboard button disabled:', !selectedLocalBodyId)}
          <button
            onClick={handleSubmit}
            disabled={!selectedLocalBodyId}
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
