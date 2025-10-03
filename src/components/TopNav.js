import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { useNavigate } from 'react-router-dom';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { getStateData, getAssembliesForDistrict, getLocalBodiesForAssembly } from '../services/clientDataService';
import './TopNav.css';

function TopNav() {
  const navigate = useNavigate();
  const { lang, setLang } = useContext(LanguageContext);
  const [type, setType] = useState('localbody');
  const [district, setDistrict] = useState('');
  const [assembly, setAssembly] = useState('');
  const [localBody, setLocalBody] = useState('');

  const [districtOptions, setDistrictOptions] = useState([]);
  const [assemblyOptions, setAssemblyOptions] = useState([]);
  const [localBodyOptions, setLocalBodyOptions] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingAssemblies, setLoadingAssemblies] = useState(false);
  const [loadingLocalBodies, setLoadingLocalBodies] = useState(false);

  useEffect(() => {
    async function fetchDistricts() {
      setLoadingDistricts(true);
      try {
        const { districts } = await getStateData();
        setDistrictOptions((districts || []).sort((a, b) => a[FIELDS.DISTRICT.NAME_EN].localeCompare(b[FIELDS.DISTRICT.NAME_EN])));
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
      setLoadingDistricts(false);
    }
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (district) {
      async function fetchAssemblies() {
        setLoadingAssemblies(true);
        try {
          const data = await getAssembliesForDistrict(district);
          setAssemblyOptions((data || []).sort((a, b) => a[FIELDS.ASSEMBLY.NAME_EN].localeCompare(b[FIELDS.ASSEMBLY.NAME_EN])));
        } catch (error) {
          console.error('Error fetching assemblies:', error);
        }
        setAssembly('');
        setLocalBody('');
        setLocalBodyOptions([]);
        setLoadingAssemblies(false);
      }
      fetchAssemblies();
    }
  }, [district]);

  useEffect(() => {
    if (assembly && district) {
      async function fetchLocalBodies() {
        setLoadingLocalBodies(true);
        try {
          const data = await getLocalBodiesForAssembly(assembly);
          setLocalBodyOptions((data || []).sort((a, b) => a[FIELDS.LOCAL_BODY.NAME_EN].localeCompare(b[FIELDS.LOCAL_BODY.NAME_EN])));
        } catch (error) {
          console.error('Error fetching local bodies:', error);
        }
        setLocalBody('');
        setLoadingLocalBodies(false);
      }
      fetchLocalBodies();
    }
  }, [assembly, district]);

  function handleGo() {
    if (type === 'localbody' && localBody) {
      navigate(`/localbody/${localBody}`);
    } else if (type === 'assembly' && assembly) {
      navigate(`/assembly/${assembly}`);
    } else if (type === 'district' && district) {
      navigate(`/district/${district}`);
    } else if (type === 'state') {
      navigate('/state');
    }
  }

  return (
    <nav className="top-nav">
      <div className="top-nav-left">
        <button 
          className="website-name"
          onClick={() => navigate('/')}
        >
          ആയിരം ബത്തേരി
        </button>
      </div>
      <div className="top-nav-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
        {/* Type Dropdown */}
        <select className="center-dropdown" value={type} onChange={e => setType(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }}>
          <option value="localbody">Local Body</option>
          <option value="assembly">Assembly</option>
          <option value="district">District</option>
          <option value="state">State</option>
        </select>
        {/* District Dropdown */}
        {(type === 'localbody' || type === 'assembly' || type === 'district') && (
          <select className="center-dropdown" value={district} onChange={e => setDistrict(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }} disabled={loadingDistricts}>
            <option value="">Select District</option>
            {districtOptions.map(opt => (
              <option key={opt[FIELDS.DISTRICT.ID]} value={opt[FIELDS.DISTRICT.ID]} disabled={opt[FIELDS.DISTRICT.IS_ACTIVE] === false} style={opt[FIELDS.DISTRICT.IS_ACTIVE] === false ? { color: '#aaa' } : {}}>
                {lang === 'ml' ? (opt[FIELDS.DISTRICT.NAME_ML] || opt[FIELDS.DISTRICT.NAME_EN]) : (opt[FIELDS.DISTRICT.NAME_EN] || opt[FIELDS.DISTRICT.NAME_ML])}
              </option>
            ))}
          </select>
        )}
        {/* Assembly Dropdown */}
        {(type === 'localbody' || type === 'assembly') && (
          <select className="center-dropdown" value={assembly} onChange={e => setAssembly(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }} disabled={!district || loadingAssemblies}>
            <option value="">Select Assembly</option>
            {assemblyOptions.map(opt => (
              <option key={opt[FIELDS.ASSEMBLY.ID]} value={opt[FIELDS.ASSEMBLY.ID]}>
                {lang === 'ml' ? (opt[FIELDS.ASSEMBLY.NAME_ML] || opt[FIELDS.ASSEMBLY.NAME_EN]) : (opt[FIELDS.ASSEMBLY.NAME_EN] || opt[FIELDS.ASSEMBLY.NAME_ML])}
              </option>
            ))}
          </select>
        )}
        {/* Local Body Dropdown */}
        {type === 'localbody' && (
          <select className="center-dropdown" value={localBody} onChange={e => setLocalBody(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }} disabled={!assembly || loadingLocalBodies}>
            <option value="">Select Local Body</option>
            {localBodyOptions.map(opt => (
              <option key={opt[FIELDS.LOCAL_BODY.ID]} value={opt[FIELDS.LOCAL_BODY.ID]}>
                {lang === 'ml' ? (opt[FIELDS.LOCAL_BODY.NAME_ML] || opt[FIELDS.LOCAL_BODY.NAME_EN]) : (opt[FIELDS.LOCAL_BODY.NAME_EN] || opt[FIELDS.LOCAL_BODY.NAME_ML])}
              </option>
            ))}
          </select>
        )}
        {/* Go Button */}
        <button style={{ fontWeight: 600, padding: '4px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }} onClick={handleGo}>Go</button>
      </div>
      <div className="top-nav-right">
        <select
          className="lang-dropdown"
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{ marginRight: 24, fontWeight: 500, padding: '4px 10px', borderRadius: 4 }}
        >
          <option value="en">English</option>
          <option value="ml">Malayalam</option>
        </select>
      </div>
    </nav>
  );
}

export default TopNav;