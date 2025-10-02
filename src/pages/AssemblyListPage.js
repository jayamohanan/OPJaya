import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LanguageContext } from '../components/LanguageContext';
import { CATEGORY_COLORS } from '../constants/categoryColors';
import { LABELS } from '../constants/labels';
import { 
  getAllDistrictsData, 
  getAllAssembliesData, 
  getAllLocalBodiesData, 
  getLocalBodyCategories 
} from '../services/clientDataService';

function AssemblyListPage() {
  const { lang } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [assembliesByDistrict, setAssembliesByDistrict] = useState({});
  const [localBodiesByAssembly, setLocalBodiesByAssembly] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedDistricts, setExpandedDistricts] = useState({});
  const [expandedAssemblies, setExpandedAssemblies] = useState({});

  const toggleDistrict = (districtId) => {
    setExpandedDistricts(prev => ({ ...prev, [districtId]: !prev[districtId] }));
  };
  const toggleAssembly = (assemblyId) => {
    setExpandedAssemblies(prev => ({ ...prev, [assemblyId]: !prev[assemblyId] }));
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        // Fetch districts
        const districtData = await getAllDistrictsData();
        setDistricts(districtData || []);
        
        // Fetch assemblies
        const assemblyData = await getAllAssembliesData();
        // Group assemblies by district
        const grouped = {};
        (assemblyData || []).forEach(a => {
          const dId = a[FIELDS.ASSEMBLY.DISTRICT_ID];
          if (!grouped[dId]) grouped[dId] = [];
          grouped[dId].push(a);
        });
        setAssembliesByDistrict(grouped);
        
        // Fetch local bodies for all assemblies
        const localBodyData = await getAllLocalBodiesData();
        
        // Fetch local body categories
        const localBodyCategoryData = await getLocalBodyCategories();
        
        // Create a lookup for categories
        const lbCategoryLookup = {};
        (localBodyCategoryData || []).forEach(cat => {
          lbCategoryLookup[cat.local_body_id] = cat.category;
        });
        
        // Merge category into local body data
        (localBodyData || []).forEach(lb => {
          lb.local_body_category = { category: lbCategoryLookup[lb[FIELDS.LOCAL_BODY.ID]] || 'Normal' };
        });
        
        const lbGrouped = {};
        (localBodyData || []).forEach(lb => {
          const aId = lb[FIELDS.LOCAL_BODY.ASSEMBLY_ID];
          if (!lbGrouped[aId]) lbGrouped[aId] = [];
          lbGrouped[aId].push(lb);
        });
        setLocalBodiesByAssembly(lbGrouped);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  // Sort districts in descending order of district_id
  const sortedDistricts = [...districts].sort((a, b) => b[FIELDS.DISTRICT.ID] - a[FIELDS.DISTRICT.ID]);

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      {/* Kerala State super section */}
      <div style={{ marginBottom: 40 }}>
        <h1>
          <span style={{ display: 'inline-block', width: 18, height: 18, background: CATEGORY_COLORS['Perfect'], borderRadius: 3, marginRight: 6, border: '1px solid #bbb' }} />
          {lang === 'ml' ? 'കേരളം' : 'Kerala State'}
        </h1>
        <a
          href="#"
          onClick={e => {
            e.preventDefault();
            navigate('/state');
          }}
          style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 700, fontSize: 18 }}
        >
          {lang === 'ml' ? LABELS.state.ml : LABELS.state.en}
        </a>
      </div>
      {sortedDistricts.map(district => (
        <div key={district[FIELDS.DISTRICT.ID]} style={{ marginBottom: 32 }}>
          <h2 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => toggleDistrict(district[FIELDS.DISTRICT.ID])}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: 0 }}
              aria-label={expandedDistricts[district[FIELDS.DISTRICT.ID]] ? 'Collapse' : 'Expand'}
            >
              {expandedDistricts[district[FIELDS.DISTRICT.ID]] ? '▼' : '▶'}
            </button>
            <span style={{ display: 'inline-block', width: 16, height: 16, background: CATEGORY_COLORS['Normal'], borderRadius: 3, marginRight: 2, border: '1px solid #bbb' }} />
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                navigate(`/district/${district[FIELDS.DISTRICT.ID]}`);
              }}
              style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 700 }}
            >
              {lang === 'ml'
                ? `${district[FIELDS.DISTRICT.NAME_ML] || district[FIELDS.DISTRICT.NAME_EN]} ${LABELS.district.ml}`
                : `${district[FIELDS.DISTRICT.NAME_EN] || district[FIELDS.DISTRICT.NAME_ML]} ${LABELS.district.en}`}
            </a>
          </h2>
          {expandedDistricts[district[FIELDS.DISTRICT.ID]] && (
            <ul style={{ marginLeft: 16, listStyleType: 'none', paddingLeft: 0 }}>
              {(assembliesByDistrict[district[FIELDS.DISTRICT.ID]] || []).map(assembly => {
                const category = assembly.local_body_category?.category || 'Normal';
                return (
                  <li key={assembly[FIELDS.ASSEMBLY.ID]} style={{ marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => toggleAssembly(assembly[FIELDS.ASSEMBLY.ID])}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0 }}
                        aria-label={expandedAssemblies[assembly[FIELDS.ASSEMBLY.ID]] ? 'Collapse' : 'Expand'}
                      >
                        {expandedAssemblies[assembly[FIELDS.ASSEMBLY.ID]] ? '▼' : '▶'}
                      </button>
                      <span style={{ display: 'inline-block', width: 14, height: 14, background: CATEGORY_COLORS[category] || CATEGORY_COLORS['Normal'], borderRadius: 3, marginRight: 2, border: '1px solid #bbb' }} />
                      <a
                        href="#"
                        onClick={e => {
                          e.preventDefault();
                          navigate(`/assembly/${assembly[FIELDS.ASSEMBLY.ID]}`);
                        }}
                        style={{ color: '#388E3C', textDecoration: 'underline', fontWeight: 500 }}
                      >
                        {lang === 'ml'
                          ? `${assembly[FIELDS.ASSEMBLY.NAME_ML] || assembly[FIELDS.ASSEMBLY.NAME_EN]} ${LABELS.assembly.ml}`
                          : `${assembly[FIELDS.ASSEMBLY.NAME_EN] || assembly[FIELDS.ASSEMBLY.NAME_ML]} ${LABELS.assembly.en}`}
                      </a>
                    </div>
                    {/* List local bodies for this assembly */}
                    {expandedAssemblies[assembly[FIELDS.ASSEMBLY.ID]] && (localBodiesByAssembly[assembly[FIELDS.ASSEMBLY.ID]] || []).length > 0 && (
                      <ul style={{ marginLeft: 32, marginTop: 2, listStyleType: 'disc' }}>
                        {(() => {
                          const lbs = localBodiesByAssembly[assembly[FIELDS.ASSEMBLY.ID]] || [];
                          const sortedLbs = [...lbs].sort((a, b) => {
                            const order = { Perfect: 0, Good: 1, Normal: 2 };
                            const aCatRaw = a.local_body_category?.category || 'Normal';
                            const bCatRaw = b.local_body_category?.category || 'Normal';
                            const aCat = aCatRaw.trim().charAt(0).toUpperCase() + aCatRaw.trim().slice(1).toLowerCase();
                            const bCat = bCatRaw.trim().charAt(0).toUpperCase() + bCatRaw.trim().slice(1).toLowerCase();
                            return order[aCat] - order[bCat];
                          });
                          return sortedLbs.map(lb => {
                            const lbCategoryRaw = lb.local_body_category?.category || 'Normal';
                            const lbCategory = lbCategoryRaw.trim().charAt(0).toUpperCase() + lbCategoryRaw.trim().slice(1).toLowerCase();
                            return (
                              <li key={lb[FIELDS.LOCAL_BODY.ID]} style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ display: 'inline-block', width: 10, height: 10, background: CATEGORY_COLORS[lbCategory] || CATEGORY_COLORS['Normal'], borderRadius: 2, marginRight: 2, border: '1px solid #bbb' }} />
                                <a
                                  href="#"
                                  onClick={e => {
                                    e.preventDefault();
                                    navigate(`/localbody/${lb[FIELDS.LOCAL_BODY.ID]}`);
                                  }}
                                  style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 400 }}
                                >
                                  {lang === 'ml'
                                    ? (lb[FIELDS.LOCAL_BODY.NAME_ML] || lb[FIELDS.LOCAL_BODY.NAME_EN])
                                    : (lb[FIELDS.LOCAL_BODY.NAME_EN] || lb[FIELDS.LOCAL_BODY.NAME_ML])}
                                </a>
                              </li>
                            );
                          });
                        })()}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default AssemblyListPage;
