import React, { useContext, useState, useEffect } from 'react';
import { LanguageContext } from './LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TABLES, FIELDS } from '../constants/dbSchema';
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
      const { data, error } = await supabase
        .from(TABLES.DISTRICT)
        .select([
          FIELDS.DISTRICT.ID,
          FIELDS.DISTRICT.NAME_EN,
          FIELDS.DISTRICT.NAME_ML,
          'is_active'
        ].join(', '));
      if (!error) {
        setDistrictOptions((data || []).sort((a, b) => a.district_name_en.localeCompare(b.district_name_en)));
      }
      setLoadingDistricts(false);
    }
    fetchDistricts();
  }, []);

  useEffect(() => {
    if (district) {
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
          .eq(FIELDS.ASSEMBLY.DISTRICT_ID, district);
        if (!error) {
          setAssemblyOptions((data || []).sort((a, b) => a.assembly_name_en.localeCompare(b.assembly_name_en)));
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
        const { data, error } = await supabase
          .from(TABLES.LOCAL_BODY)
          .select([
            FIELDS.LOCAL_BODY.ID,
            FIELDS.LOCAL_BODY.NAME_EN,
            FIELDS.LOCAL_BODY.NAME_ML,
            FIELDS.LOCAL_BODY.ASSEMBLY_ID
          ].join(', '))
          .eq(FIELDS.LOCAL_BODY.ASSEMBLY_ID, assembly);
        if (!error) {
          setLocalBodyOptions((data || []).sort((a, b) => a.local_body_name_en.localeCompare(b.local_body_name_en)));
        }
        setLocalBody('');
        setLoadingLocalBodies(false);
      }
      fetchLocalBodies();
    }
  }, [assembly, district]);

  function handleGo() {
    if (type === 'localbody') navigate('/localbody');
    else if (type === 'assembly') navigate('/assembly');
    else if (type === 'district') navigate('/district');
    else if (type === 'state') navigate('/state');
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
              <option key={opt.district_id} value={opt.district_id} disabled={opt.is_active === false} style={opt.is_active === false ? { color: '#aaa' } : {}}>
                {lang === 'ml' ? (opt.district_name_ml || opt.district_name_en) : (opt.district_name_en || opt.district_name_ml)}
              </option>
            ))}
          </select>
        )}
        {/* Assembly Dropdown */}
        {(type === 'localbody' || type === 'assembly') && (
          <select className="center-dropdown" value={assembly} onChange={e => setAssembly(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }} disabled={!district || loadingAssemblies}>
            <option value="">Select Assembly</option>
            {assemblyOptions.map(opt => (
              <option key={opt.assembly_id} value={opt.assembly_id}>
                {lang === 'ml' ? (opt.assembly_name_ml || opt.assembly_name_en) : (opt.assembly_name_en || opt.assembly_name_ml)}
              </option>
            ))}
          </select>
        )}
        {/* Local Body Dropdown */}
        {type === 'localbody' && (
          <select className="center-dropdown" value={localBody} onChange={e => setLocalBody(e.target.value)} style={{ fontWeight: 500, padding: '4px 10px', borderRadius: 4 }} disabled={!assembly || loadingLocalBodies}>
            <option value="">Select Local Body</option>
            {localBodyOptions.map(opt => (
              <option key={opt.local_body_id} value={opt.local_body_id}>
                {lang === 'ml' ? (opt.local_body_name_ml || opt.local_body_name_en) : (opt.local_body_name_en || opt.local_body_name_ml)}
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