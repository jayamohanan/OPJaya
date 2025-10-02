import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../components/LanguageContext';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
import './Home.css';

function Home() {
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [assemblies, setAssemblies] = useState([]);
  const [localBodies, setLocalBodies] = useState([]);

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
      console.log('fetchDistricts called');
      setLoadingDistricts(true);
      const { data, error } = await supabase
        .from(TABLES.DISTRICT)
        .select([
          FIELDS.DISTRICT.ID,
          FIELDS.DISTRICT.NAME_EN,
          FIELDS.DISTRICT.NAME_ML,
          'is_active'
        ].join(', '));
      if (error) {
        console.error("Error fetching districts from Supabase:", error);
      } else {
        const sortedDistricts = (data || []).sort((a, b) => a[FIELDS.DISTRICT.NAME_EN].localeCompare(b[FIELDS.DISTRICT.NAME_EN]));
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
          .from(TABLES.ASSEMBLY)
          .select([
            FIELDS.ASSEMBLY.ID,
            FIELDS.ASSEMBLY.NAME_EN,
            FIELDS.ASSEMBLY.NAME_ML,
            FIELDS.ASSEMBLY.DISTRICT_ID
          ].join(', '))
          .eq(FIELDS.ASSEMBLY.DISTRICT_ID, selectedDistrictId);
        if (error) {
          console.error("Error fetching assemblies from Supabase:", error);
        } else {
          const sortedAssemblies = (data || []).sort((a, b) => a[FIELDS.ASSEMBLY.NAME_EN].localeCompare(b[FIELDS.ASSEMBLY.NAME_EN]));
          setAssemblies(sortedAssemblies);
        }
        setSelectedAssemblyId('');
        setSelectedLocalBodyId('');
        setLocalBodies([]);
        setLoadingAssemblies(false);
      }
      fetchAssemblies();
    }
  }, [selectedDistrictId])

  // Fetch local bodies when assembly changes (from 'local_body' table, join local_body_type)
  useEffect(() => {
    if (selectedAssemblyId && selectedDistrictId) {
      async function fetchLocalBodies() {
        setLoadingLocalBodies(true);
        const { data, error } = await supabase
          .from(TABLES.LOCAL_BODY)
          .select([
            FIELDS.LOCAL_BODY.ID,
            FIELDS.LOCAL_BODY.NAME_EN,
            FIELDS.LOCAL_BODY.NAME_ML,
            FIELDS.LOCAL_BODY.BLOCK_NAME_EN,
            FIELDS.LOCAL_BODY.DIST_PANCHAYAT_NAME_EN,
            FIELDS.LOCAL_BODY.ASSEMBLY_ID,
            FIELDS.LOCAL_BODY.TYPE_ID,
            `${TABLES.LOCAL_BODY_TYPE}(${FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN}, ${FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML})`
          ].join(', '))
          .eq(FIELDS.LOCAL_BODY.ASSEMBLY_ID, selectedAssemblyId);
        if (error) {
          console.error("Error fetching local bodies from Supabase:", error);
        } else {
          const filteredLocalBodies = (data || [])
            .map(row => ({
              [FIELDS.LOCAL_BODY.ID]: row[FIELDS.LOCAL_BODY.ID],
              [FIELDS.LOCAL_BODY.NAME_EN]: row[FIELDS.LOCAL_BODY.NAME_EN]?.trim(),
              [FIELDS.LOCAL_BODY.NAME_ML]: row[FIELDS.LOCAL_BODY.NAME_ML],
              [FIELDS.LOCAL_BODY.BLOCK_NAME_EN]: row[FIELDS.LOCAL_BODY.BLOCK_NAME_EN],
              [FIELDS.LOCAL_BODY.DIST_PANCHAYAT_NAME_EN]: row[FIELDS.LOCAL_BODY.DIST_PANCHAYAT_NAME_EN],
              [FIELDS.LOCAL_BODY.ASSEMBLY_ID]: row[FIELDS.LOCAL_BODY.ASSEMBLY_ID],
              [FIELDS.LOCAL_BODY.LOCAL_BODY_TYPE]: row[TABLES.LOCAL_BODY_TYPE] || {}
            }))
            .filter(lb => lb[FIELDS.LOCAL_BODY.NAME_EN])
            .sort((a, b) => a[FIELDS.LOCAL_BODY.NAME_EN].localeCompare(b[FIELDS.LOCAL_BODY.NAME_EN]));
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
      const localBodyData = localBodies.find(lb => lb[FIELDS.LOCAL_BODY.ID] === selectedLocalBodyId);
      if (localBodyData) {
        navigate(`/localbody/${localBodyData[FIELDS.LOCAL_BODY.ID]}`);
      }
    } else if (selectedAssemblyId) {
      // Navigate to assembly page with assembly name
      const assemblyData = assemblies.find(a => a[FIELDS.ASSEMBLY.ID] === selectedAssemblyId);
      if (assemblyData) {
        navigate(`/assembly/${encodeURIComponent(assemblyData[FIELDS.ASSEMBLY.NAME_EN])}`);
      }
    } else if (selectedDistrictId) {
      // Navigate to district page with district name
      const districtData = districts.find(d => d[FIELDS.DISTRICT.ID] === selectedDistrictId);
      if (districtData) {
        navigate(`/district/${encodeURIComponent(districtData[FIELDS.DISTRICT.NAME_EN])}`);
      }
    } else {
      // Navigate to state page
      navigate('/state');
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
          <button
            onClick={() => navigate('/assembly-list')}
            style={{ marginBottom: 18, fontWeight: 600, padding: '6px 18px', borderRadius: 6, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16 }}
          >
            Assembly List
          </button>
          
          <div className="dropdown-group">
            <label htmlFor="district-select">Select District:</label>
            <select
              id="district-select"
              value={selectedDistrictId}
              onChange={(e) => {
                const selected = districts.find(d => d[FIELDS.DISTRICT.ID] === e.target.value);
                if (selected && selected[FIELDS.DISTRICT.IS_ACTIVE] === false) return;
                setSelectedDistrictId(e.target.value);
              }}
              className="dropdown"
              disabled={loadingDistricts}
            >
              {loadingDistricts ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select District --</option>
                  {districts.map(district => (
                    <option key={district[FIELDS.DISTRICT.ID]} value={district[FIELDS.DISTRICT.ID]} disabled={district[FIELDS.DISTRICT.IS_ACTIVE] === false} style={district[FIELDS.DISTRICT.IS_ACTIVE] === false ? { color: '#aaa' } : {}}>
                      {lang === 'ml'
                        ? (district[FIELDS.DISTRICT.NAME_ML] || district[FIELDS.DISTRICT.NAME_EN])
                        : (district[FIELDS.DISTRICT.NAME_EN] || district[FIELDS.DISTRICT.NAME_ML])}
                    </option>
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
              onChange={(e) => {
                const selected = assemblies.find(a => a[FIELDS.ASSEMBLY.ID] === e.target.value);
                if (selected && selected[FIELDS.ASSEMBLY.IS_ACTIVE] === false) return;
                setSelectedAssemblyId(e.target.value);
              }}
              disabled={!selectedDistrictId || loadingAssemblies}
              className="dropdown"
            >
              {loadingAssemblies ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select Assembly --</option>
                  {assemblies.map(assembly => (
                    <option key={assembly[FIELDS.ASSEMBLY.ID]} value={assembly[FIELDS.ASSEMBLY.ID]} disabled={assembly[FIELDS.ASSEMBLY.IS_ACTIVE] === false} style={assembly[FIELDS.ASSEMBLY.IS_ACTIVE] === false ? { color: '#aaa' } : {}}>
                      {lang === 'ml'
                        ? (assembly[FIELDS.ASSEMBLY.NAME_ML] || assembly[FIELDS.ASSEMBLY.NAME_EN])
                        : (assembly[FIELDS.ASSEMBLY.NAME_EN] || assembly[FIELDS.ASSEMBLY.NAME_ML])}
                    </option>
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
              onChange={(e) => {
                const selected = localBodies.find(lb => lb[FIELDS.LOCAL_BODY.ID] === e.target.value);
                if (selected && selected[FIELDS.LOCAL_BODY.IS_ACTIVE] === false) return;
                setSelectedLocalBodyId(e.target.value);
              }}
              disabled={!selectedAssemblyId || loadingLocalBodies}
              className="dropdown"
            >
              {loadingLocalBodies ? (
                <option disabled>Loading...</option>
              ) : (
                <>
                  <option value="">-- Select Local Body --</option>
                  {localBodies.map(localBody => (
                    <option key={localBody[FIELDS.LOCAL_BODY.ID]} value={localBody[FIELDS.LOCAL_BODY.ID]} disabled={localBody[FIELDS.LOCAL_BODY.IS_ACTIVE] === false} style={localBody[FIELDS.LOCAL_BODY.IS_ACTIVE] === false ? { color: '#aaa' } : {}}>
                      {lang === 'ml'
                        ? (localBody[FIELDS.LOCAL_BODY.NAME_ML] || localBody[FIELDS.LOCAL_BODY.NAME_EN])
                        : (localBody[FIELDS.LOCAL_BODY.NAME_EN] || localBody[FIELDS.LOCAL_BODY.NAME_ML])}
                      {' '}
                      ({lang === 'ml'
                        ? (localBody[FIELDS.LOCAL_BODY.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML] || localBody[FIELDS.LOCAL_BODY.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN] || '')
                        : (localBody[FIELDS.LOCAL_BODY.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_EN] || localBody[FIELDS.LOCAL_BODY.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.TYPE_NAME_ML] || '')})
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>


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
