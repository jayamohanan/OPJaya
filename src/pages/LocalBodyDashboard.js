import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../components/LanguageContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AddIssueModal from '../components/AddIssueModal';
import Footer from '../components/Footer';
import TopNav from '../components/TopNav'; // Add this import
import { supabase } from '../supabaseClient';
import './LocalBodyDashboard.css';

const sections = [
  { title: 'Towns' },
  { title: 'Roads' },
  { title: 'Waste Management' },
  { title: 'Water Bodies' },
  { title: 'Public Health' },
  { title: 'Infrastructure' }
];

const tiles = [   
  {
    name: 'Sample Tile 1',
    description: 'Description for tile 1',
    number: 123,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 2',
    description: 'Description for tile 2',
    number: 456,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 3',
    description: 'Description for tile 3',
    number: 789,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 4',
    description: 'Description for tile 4',
    number: 101,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 5',
    description: 'Description for tile 5',
    number: 202,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 6',
    description: 'Description for tile 6',
    number: 303,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 7',
    description: 'Description for tile 7',
    number: 404,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 8',
    description: 'Description for tile 8',
    number: 505,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 9',
    description: 'Description for tile 9',
    number: 606,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
  {
    name: 'Sample Tile 10',
    description: 'Description for tile 10',
    number: 707,
    image: 'https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/jaya.jpg',
  },
];

// Helper function to convert section title to folder name
const sectionToFolder = (sectionTitle) => {
  const mapping = {
    'Towns': 'towns',
    'Roads': 'roads',
    'Bus Stands/Bus Stops': 'bus_stands_bus_stops',
    'Water Bodies': 'water_bodies',
    'Bin Install and Upkeep': 'bin_install_and_upkeep',
    'Bin Usage': 'bin_usage'
  };
  return mapping[sectionTitle];
};

// See More Modal Component
function SeeMoreModal({ isOpen, onClose, sectionTitle, issues, loadingIssues }) {
  if (!isOpen) return null;

  return (
    <div className="see-more-modal-overlay" onClick={onClose}>
      <div className="see-more-modal" onClick={(e) => e.stopPropagation()}>
        <div className="see-more-modal-header">
          <h2>{sectionTitle} - All Issues</h2>
          <button className="close-modal-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="see-more-modal-content">
          {loadingIssues ? (
            <div className="modal-loading">
              <div className="loading-spinner"></div>
              <p>Loading all issues...</p>
            </div>
          ) : (
            <div className="modal-tiles-grid">
              {/* Sample tiles */}
              {tiles.map((tile, idx) => (
                <div className="modal-tile" key={`sample-${idx}`}>
                  <div className="modal-tile-img">
                    <img src={tile.image} alt={tile.name} />
                  </div>
                  <div className="modal-tile-info">
                    <div className="modal-tile-name">{tile.name}</div>
                    <div className="modal-tile-desc">{tile.description}</div>
                    <div className="modal-tile-number">{tile.number}</div>
                  </div>
                </div>
              ))}

              {/* Real issues */}
              {issues?.map((issue) => (
                <div className="modal-tile" key={`issue-${issue.id}`}>
                  <div className="modal-tile-img">
                    <img 
                      src={issue.photos && issue.photos.length > 0 ? issue.photos[0] : 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image'} 
                      alt={issue.title}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="modal-tile-info">
                    <div className="modal-tile-name">{issue.title}</div>
                    <div className="modal-tile-desc">{issue.description}</div>
                    <div className="modal-tile-number">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}

              {/* No issues message */}
              {!loadingIssues && (!issues || issues.length === 0) && (
                <div className="modal-no-issues">
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                  <h3>No issues found in {sectionTitle}</h3>
                  <p>Be the first to report an issue in this category!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


function UpdateHKSModal({ open, onClose, wards, lang, onSubmit, loading, localBodyName, localBodyType }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, '0'));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [rates, setRates] = useState({});
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (wards) {
      const initialRates = {};
      wards.forEach(w => { initialRates[w.ward_id] = ''; });
      setRates(initialRates);
    }
  }, [wards]);

  if (!open) return null;

  const handleChange = (wardId, value) => {
    // Only allow numbers and dot
    if (/^\d*\.?\d*$/.test(value)) {
      setRates(r => ({ ...r, [wardId]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Validate all rates are numbers between 0 and 100
    for (const val of Object.values(rates)) {
      if (val === '') continue;
      const num = Number(val);
      if (isNaN(num) || num < 0 || num > 100) {
        setError('Please enter valid rates between 0 and 100 for all wards.');
        return;
      }
    }
    // If any ward is empty, show confirmation
    const hasEmpty = Object.values(rates).some(val => val === '');
    if (hasEmpty) {
      setShowConfirm(true);
    } else {
      onSubmit({ month, year, rates });
    }
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onSubmit({ month, year, rates });
  };

  return (
    <div className="see-more-modal-overlay" onClick={onClose}>
      <div className="see-more-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '95vw', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.18)', padding: 0 }}>
        <div className="see-more-modal-header" style={{ borderBottom: '1px solid #eee', padding: '20px 24px 10px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 22, textAlign: 'left' }}>Update HKS Collection Rate</h2>
          <button className="close-modal-btn" onClick={onClose} style={{ top: 18, right: 18 }}>×</button>
        </div>
        <div style={{ margin: '0 24px 12px 24px', color: '#333', fontSize: 16, textAlign: 'left', fontWeight: 500 }}>
          {localBodyName} {localBodyType ? `(${localBodyType})` : ''}
        </div>
        <form onSubmit={handleSubmit} style={{ margin: '0 24px 24px 24px' }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <select value={month} onChange={e => setMonth(e.target.value)} required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
              {[...Array(12)].map((_, i) => (
                <option key={i+1} value={String(i+1).padStart(2, '0')}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)} required style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
              {[...Array(5)].map((_, i) => {
                const y = now.getFullYear() - 2 + i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
          </div>
          {wards && wards.length > 0 ? (
            <div style={{ maxHeight: '50vh', overflowY: 'auto', border: '1px solid #eee', borderRadius: 8, background: '#fafbfc', marginBottom: 16 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Ward No.</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Ward Name</th>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>Rate (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {wards.map(w => (
                    <tr key={w.ward_id}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>{w.ward_no}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>{lang === 'ml' ? (w.ward_name_ml || w.ward_name_en) : (w.ward_name_en || w.ward_name_ml)}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={rates[w.ward_id]}
                          onChange={e => handleChange(w.ward_id, e.target.value)}
                          style={{ width: 90, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                          inputMode="decimal"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ marginBottom: 16, color: '#b00' }}>No wards found for this local body.</div>
          )}
          {error && <div style={{ color: '#b00', marginBottom: 10 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="sidebar-btn primary" style={{ minWidth: 120, maxWidth: 200, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={loading || !wards || wards.length === 0}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
        {showConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.3)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: '#fff', borderRadius: 10, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.18)'
            }}>
              <div style={{ fontSize: 18, marginBottom: 16, color: '#b00', textAlign: 'center' }}>
                Some wards have no value entered.<br />Are you sure you want to submit?
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button className="sidebar-btn" onClick={() => setShowConfirm(false)}>Cancel</button>
                <button className="sidebar-btn primary" onClick={handleConfirm}>Yes, Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LocalBodyDashboard() {
  const { lang } = useContext(LanguageContext); // 'ml' or 'en'
  const { state } = useLocation();
  const navigate = useNavigate();

  // Extract IDs from navigation state
  const localBodyId = state?.localBodyId || state?.id || '';
  const assemblyId = state?.assemblyId || '';
  const districtId = state?.districtId || '';

  // State for fetched data
  const [localBody, setLocalBody] = useState(null); // { local_body_id, local_body_name_en, ... }
  const [assembly, setAssembly] = useState(null); // { assembly_id, assembly_name_en, ... }
  const [district, setDistrict] = useState(null); // { district_id, district_name_en, ... }

  // Fetch local body, assembly, and district details
  useEffect(() => {
    async function fetchData() {
      if (!localBodyId) return;
      // Fetch local body with correct field names
      const { data: lb, error: lbError } = await supabase
        .from('local_body')
        .select('local_body_id, local_body_name_en, local_body_name_ml, block_name_en, district_panchayat_name_en, assembly_id, type_id, local_body_type(type_name_en, type_name_ml)')
        .eq('local_body_id', localBodyId)
        .single();
      if (lbError || !lb) {
        setLocalBody(null);
        setAssembly(null);
        setDistrict(null);
        return;
      }
      setLocalBody(lb);

      // Fetch assembly with correct field names
      const { data: asm, error: asmError } = await supabase
        .from('assembly')
        .select('assembly_id, assembly_name_en, assembly_name_ml, district_id')
        .eq('assembly_id', lb.assembly_id)
        .single();
      if (asmError || !asm) {
        setAssembly(null);
        setDistrict(null);
        return;
      }
      setAssembly(asm);

      // Fetch district with correct field names
      const { data: dist, error: distError } = await supabase
        .from('district')
        .select('district_id, district_name_en, district_name_ml')
        .eq('district_id', asm.district_id)
        .single();
      if (distError || !dist) {
        setDistrict(null);
        return;
      }
      setDistrict(dist);
    }
    fetchData();
  }, [localBodyId]);

  // Malayalam type mapping
  const getTypeInMalayalam = (type) => {
    const typeMapping = {
      'GP': 'ഗ്രാമപഞ്ചായത്ത്',
      'Municipality': 'മുനിസിപ്പാലിറ്റി',
      'Corporation': 'കോർപ്പറേഷൻ',
      'Grama Panchayat': 'ഗ്രാമപഞ്ചായത്ത്',
      'municipality': 'മുനിസിപ്പാലിറ്റി',
      'corporation': 'കോർപ്പറേഷൻ',
      'Block Panchayat': 'ബ്ലോക്ക് പഞ്ചായത്ത്',
      'District Panchayat': 'ജില്ലാ പഞ്ചായത്ത്'
    };
    return typeMapping[type] || type;
  };

  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [issues, setIssues] = useState({});
  const [loadingIssues, setLoadingIssues] = useState({});
  const [scrollPositions, setScrollPositions] = useState({});
  const [seeMoreModal, setSeeMoreModal] = useState({ isOpen: false, sectionTitle: '' });
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    inProgressIssues: 0
  });

  // Add state for modal
  const [seeAllModal, setSeeAllModal] = useState({
    isOpen: false,
    sectionTitle: '',
    sectionIssues: []
  });

  // HKS Collection Rate state
  const [hksCollectionRates, setHksCollectionRates] = useState([]);
  const [showAllHKSRates, setShowAllHKSRates] = useState(false);
  const [loadingHKSRates, setLoadingHKSRates] = useState(false);

  // Modal state for updating HKS rates
  const [showHKSModal, setShowHKSModal] = useState(false);
  const [wards, setWards] = useState([]);
  const [hksLoading, setHksLoading] = useState(false);

  // Fetch HKS Collection Rates from Supabase for the current local body
  useEffect(() => {
    console.log('Fetching HKS Collection Rates...');
    async function fetchHKSRates() {
      if (!localBody?.local_body_id) return;
      setLoadingHKSRates(true);
      // 1. Get all ward_ids for the local body
      const { data: wards, error: wardError } = await supabase
        .from('ward')
        .select('ward_id, ward_name_en, ward_name_ml, ward_no')
        .eq('local_body_id', localBody.local_body_id);

      if (!wards) return;

      const wardIds = wards.map(w => w.ward_id);

      // 2. Get all collections for those wards
      const { data: collections, error: collectionError } = await supabase
        .from('ward_collection')
        .select('rate, year_month, ward_id')
        .in('ward_id', wardIds);

      // 3. Merge with ward info and pick latest per ward
      const wardMap = {};
      wards.forEach(w => { wardMap[w.ward_id] = w; });

      const latestByWard = {};
      (collections || []).forEach(item => {
        if (!item.ward_id) return;
        if (!latestByWard[item.ward_id] || new Date(item.year_month) > new Date(latestByWard[item.ward_id].year_month)) {
          latestByWard[item.ward_id] = item;
        }
      });

      const mapped = Object.values(latestByWard)
        .map(item => ({
          name:
            lang === 'ml'
              ? `${wardMap[item.ward_id].ward_name_ml || wardMap[item.ward_id].ward_name_en} (വാർഡ് ${wardMap[item.ward_id].ward_no})`
              : `${wardMap[item.ward_id].ward_name_en || wardMap[item.ward_id].ward_name_ml} (Ward ${wardMap[item.ward_id].ward_no})`,
          rate: item.rate
        }))
        .sort((a, b) => a.rate - b.rate);
      setHksCollectionRates(mapped);
      setLoadingHKSRates(false);
    }
    fetchHKSRates();
  }, [localBody?.local_body_id]);

  // Show all or first 5
  const displayedHKSRates = showAllHKSRates ? hksCollectionRates : hksCollectionRates.slice(0, 5);

  // Toggle HKS rates view
  const toggleHKSRatesView = () => {
    setShowAllHKSRates(!showAllHKSRates);
  };

  // Calculate stats when issues change
  useEffect(() => {
    const allIssues = Object.values(issues).flat();
    const totalIssues = allIssues.length;
    const openIssues = allIssues.filter(issue => issue.status === 'open').length;
    const resolvedIssues = allIssues.filter(issue => issue.status === 'resolved').length;
    const inProgressIssues = allIssues.filter(issue => issue.status === 'in-progress').length;

    setStats({
      totalIssues,
      openIssues,
      resolvedIssues,
      inProgressIssues
    });
  }, [issues]);

  // Scroll functions
  const scrollLeft = (sectionTitle) => {
    const container = document.getElementById(`scroll-${sectionTitle.replace(/\s+/g, '-')}`);
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
      updateScrollPosition(sectionTitle, container);
    }
  };

  const scrollRight = (sectionTitle) => {
    const container = document.getElementById(`scroll-${sectionTitle.replace(/\s+/g, '-')}`);
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
      updateScrollPosition(sectionTitle, container);
    }
  };

  const updateScrollPosition = (sectionTitle, container) => {
    setTimeout(() => {
      const canScrollLeft = container.scrollLeft > 0;
      const canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      
      setScrollPositions(prev => ({
        ...prev,
        [sectionTitle]: { canScrollLeft, canScrollRight }
      }));
    }, 300);
  };

  const handleScroll = (sectionTitle) => {
    const container = document.getElementById(`scroll-${sectionTitle.replace(/\s+/g, '-')}`);
    if (container) {
      updateScrollPosition(sectionTitle, container);
    }
  };

  // Fetch issues for a specific section
  const fetchIssuesForSection = async (sectionTitle) => {
    if (!localBody || !localBody.lsg_code) return;

    const folderName = sectionToFolder(sectionTitle);
    if (!folderName) return;

    setLoadingIssues(prev => ({ ...prev, [sectionTitle]: true }));

    try {
      const basePath = `https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/issues/${localBody.lsg_code}/${folderName}`;
      const sampleIssues = await fetchKnownIssues(basePath);

      setIssues(prev => ({
        ...prev,
        [sectionTitle]: sampleIssues
      }));
    } catch (error) {
      console.error(`Failed to fetch issues for ${sectionTitle}:`, error);
      setIssues(prev => ({
        ...prev,
        [sectionTitle]: []
      }));
    } finally {
      setLoadingIssues(prev => ({ ...prev, [sectionTitle]: false }));
    }
  };

  const fetchKnownIssues = async (basePath) => {
    const foundIssues = [];
    const testIssueIds = [
      '123e4567-e89b-12d3-a456-426614174000',
      '456f7890-a12b-34c5-d678-901234567890',
      '789a0123-b45c-67d8-e901-234567890123'
    ];

    for (const issueId of testIssueIds) {
      try {
        const response = await fetch(`${basePath}/${issueId}/issuedata.json`);
        if (response.ok) {
          const issueData = await response.json();
          foundIssues.push(issueData);
        }
      } catch (error) {
        // Issue doesn't exist, continue
      }
    }

    return foundIssues;
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMapClick = () => {
    // Remove geojsonUrl from state, as it is no longer defined or used
    navigate('/map', {
      state: {
        localBodyName: localBody?.local_body_name_en,
        localBodyType: localBody?.local_body_type_en,
        localBodyData: localBody
      }
    });
  };

  const handleSeeMore = (sectionTitle) => {
    setSeeMoreModal({ isOpen: true, sectionTitle });
    // Fetch more issues if needed
    if (!issues[sectionTitle]) {
      fetchIssuesForSection(sectionTitle);
    }
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image';
  };

  // Add this missing formatDate function
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  // Add this function to handle "See all issues" click
  const handleSeeAllIssues = (sectionTitle) => {
    console.log(`See all clicked for: ${sectionTitle}`);
    
    // Fetch issues if not already loaded
    if (!issues[sectionTitle] && sectionToFolder(sectionTitle)) {
      fetchIssuesForSection(sectionTitle);
    }
    
    // Open modal with current issues
    setSeeAllModal({
      isOpen: true,
      sectionTitle: sectionTitle,
      sectionIssues: [...tiles, ...(issues[sectionTitle] || [])]
    });
  };

  // Add function to close modal
  const closeSeeAllModal = () => {
    setSeeAllModal({
      isOpen: false,
      sectionTitle: '',
      sectionIssues: []
    });
  };

  // Mock recent activities
  const recentActivities = [
    { title: 'New issue reported', type: 'Roads', time: '2 hours ago' },
    { title: 'Issue resolved', type: 'Water Bodies', time: '4 hours ago' },
    { title: 'Issue in progress', type: 'Bin Usage', time: '1 day ago' },
    { title: 'New issue reported', type: 'Towns', time: '2 days ago' },
  ];

  // Add this function inside your component
  const isMalayalamText = (text) => {
    // Malayalam Unicode range: 0D00-0D7F
    const malayalamRegex = /[\u0D00-\u0D7F]/;
    return malayalamRegex.test(text);
  };

  // Add this handler for submitting HKS rates
  const handleHKSSubmit = async ({ month, year, rates }) => {
    setHksLoading(true);
    const yearMonth = `${year}-${month}-01`;
    const inserts = Object.entries(rates)
      .filter(([_, rate]) => rate !== '' && !isNaN(rate))
      .map(([ward_id, rate]) => ({ ward_id, year_month: yearMonth, rate: Number(rate) }));
    if (inserts.length > 0) {
      const { error, data } = await supabase
        .from('ward_collection')
        .upsert(inserts, { onConflict: ['ward_id', 'year_month'] });
      if (error) {
        console.log('supa message:', error.message);
        alert('Error updating rates: ' + error.message);
        setHksLoading(false);
        return;
      } else {
        console.log('supa message:', data);
      }
    }
    setHksLoading(false);
    setShowHKSModal(false);
    // Optionally, refresh HKS rates
  };

  // Fetch wards for the local body (shared for sidebar and modal)
  useEffect(() => {
    async function fetchWards() {
      if (!localBody?.local_body_id) return;
      const { data: wardsData } = await supabase
        .from('ward')
        .select('ward_id, ward_name_en, ward_name_ml, ward_no, local_body_id')
        .eq('local_body_id', localBody.local_body_id);
      setWards(wardsData || []);
    }
    fetchWards();
  }, [localBody?.local_body_id]);

  return (
    <div className="dashboard-container">
      {/* Universal Top Navigation Bar */}
      <TopNav />

      <div className="dashboard-content-wrapper">
        {/* Remove the old inline top nav and keep the rest */}
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          {/* Local Body Name Header */}
          <div className="sidebar-section">
            <div className="local-body-header">
              <h2 className="local-body-name malayalam-text">
                {lang === 'ml'
                  ? (localBody?.local_body_name_ml || localBody?.local_body_name_en || 'Unknown Local Body')
                  : (localBody?.local_body_name_en || localBody?.local_body_name_ml || 'Unknown Local Body')}
              </h2>
              <div className="local-body-type malayalam-text">
                {lang === 'ml'
                  ? (localBody?.local_body_type?.type_name_ml || localBody?.local_body_type?.type_name_en || '')
                  : (localBody?.local_body_type?.type_name_en || localBody?.local_body_type?.type_name_ml || '')}
              </div>
              <div className="local-body-assembly malayalam-text">
                {lang === 'ml'
                  ? (assembly?.assembly_name_ml || assembly?.assembly_name_en || '')
                  : (assembly?.assembly_name_en || assembly?.assembly_name_ml || '')}
              </div>
              <div className="local-body-district">
                {lang === 'ml'
                  ? (district?.district_name_ml || district?.district_name_en || '')
                  : (district?.district_name_en || district?.district_name_ml || '')}
              </div>
            </div>
          </div>

          {/* HKS Collection Rate Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">HKS Collection Rate</div>
            <div className="hks-rates-container">
              {loadingHKSRates ? (
                <div>Loading...</div>
              ) : (
                <>
                  {displayedHKSRates.map((item, index) => (
                    <div key={index} className="hks-rate-item">
                      <span className="hks-name malayalam-text">{item.name}</span>
                      <span className="hks-rate">{item.rate}%</span>
                    </div>
                  ))}
                  <span 
                    className="see-more-hks-btn"
                    onClick={toggleHKSRatesView}
                  >
                    {showAllHKSRates ? 'Show Less' : 'See More'}
                  </span>
                  <button className="sidebar-btn" style={{ marginTop: 12, width: '100%' }} onClick={() => setShowHKSModal(true)}>
                    Update HKS Collection Rate
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">Quick Actions</div>
            <div className="quick-actions">
              <button 
                className="sidebar-btn primary"
                onClick={() => setIsAddIssueModalOpen(true)}
              >
                <span>+</span>
                Report New Issue
              </button>
              <button className="sidebar-btn" onClick={handleMapClick}>
                <span>🗺️</span>
                View on Map
              </button>
              <button className="sidebar-btn">
                <span>📊</span>
                Generate Report
              </button>
              <button className="sidebar-btn">
                <span>📧</span>
                Contact Officials
              </button>
            </div>
          </div>

          {/* Local Body Info Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">Local Body Info</div>
            <div className="sidebar-stats">
              <div className="stat-item">
                <span className="stat-label">Type</span>
                <span className="stat-value" style={{ fontSize: '0.8rem' }}>
                  {lang === 'ml'
                    ? (localBody?.local_body_type?.type_name_ml || localBody?.local_body_type?.type_name_en || '')
                    : (localBody?.local_body_type?.type_name_en || localBody?.local_body_type?.type_name_ml || '')}
                </span>
              </div>
              {district && (
                <div className="stat-item">
                  <span className="stat-label">District</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/district/${district?.district_id}`)}
                  >
                    {lang === 'ml'
                      ? (district?.district_name_ml || district?.district_name_en || '')
                      : (district?.district_name_en || district?.district_name_ml || '')}
                  </span>
                </div>
              )}
              {assembly && (
                <div className="stat-item">
                  <span className="stat-label">Assembly</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/assembly/${assembly?.assembly_id}`)}
                  >
                    {lang === 'ml'
                      ? (assembly?.assembly_name_ml || assembly?.assembly_name_en || '')
                      : (assembly?.assembly_name_en || assembly?.assembly_name_ml || '')}
                  </span>
                </div>
              )}
              {/* No LSG Code in new schema, remove if not needed */}
            </div>
          </div>

          {/* Add this new section for Progress Checklist */}
          <div className="sidebar-section">
            <div className="sidebar-title">Progress Checklist</div>
            <div className="progress-checklist-container">
              <Link to="/localbody-checklist" style={{ margin: 16, display: 'inline-block' }}>
                View Progress Checklist
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="dashboard-main">
          <div className="main-title">
            People
            {/* <img
              src={`${process.env.PUBLIC_URL}/people_icon.png`}
              alt="People Icon"
              className="people-icon"
              style={{ marginLeft: 8, height: 24, verticalAlign: 'middle' }}
            /> */}
          </div>
          {/* All dashboard sections */}
          <div className="dashboard-sections">
            {sections.map((section) => (
              <div className="dashboard-section" key={section.title}>
                <div className="dashboard-section-header">
                  <span>{section.title}</span>
                  <button 
                    className="see-all-issues-btn"
                    onClick={() => handleSeeAllIssues(section.title)}
                    type="button"
                  >
                    See all →
                  </button>
                </div>
                
                <div className="dashboard-section-content">
                  <div className="scroll-container">
                    {/* Left scroll arrow */}
                    <button 
                      className="scroll-nav left"
                      onClick={() => scrollLeft(section.title)}
                      disabled={!scrollPositions[section.title]?.canScrollLeft}
                      aria-label="Scroll left"
                    >
                      ‹
                    </button>

                    {/* Horizontal scrollable content */}
                    <div 
                      className="dashboard-tiles-scroll"
                      id={`scroll-${section.title.replace(/\s+/g, '-')}`}
                      onScroll={() => handleScroll(section.title)}
                    >
                      {/* Sample tiles */}
                      {tiles.map((tile, idx) => (
                        <div className="dashboard-tile" key={`sample-${idx}`}>
                          <div className="dashboard-tile-img">
                            <img src={tile.image} alt={tile.name} />
                          </div>
                          <div className="dashboard-tile-info">
                            <div className="dashboard-tile-name">{tile.name}</div>
                            <div className="dashboard-tile-desc">{tile.description}</div>
                            <div className="dashboard-tile-number">{tile.number}</div>
                          </div>
                        </div>
                      ))}

                      {/* Loading spinner for issues */}
                      {loadingIssues[section.title] && (
                        <div className="loading-tile">
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #1976d2',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 10px'
                          }}></div>
                          <div>Loading issues...</div>
                        </div>
                      )}

                      {/* Real issues from R2 */}
                      {issues[section.title]?.map((issue) => (
                        <div className="dashboard-tile" key={`issue-${issue.id}`}>
                          <div className="dashboard-tile-img">
                            <img 
                              src={issue.photos && issue.photos.length > 0 ? issue.photos[0] : 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image'} 
                              alt={issue.title}
                              onError={handleImageError}
                            />
                          </div>
                          <div className="dashboard-tile-info">
                            <div className="dashboard-tile-name">{issue.title}</div>
                            <div className="dashboard-tile-desc">{issue.description}</div>
                            <div className="dashboard-tile-number">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* No issues message */}
                      {!loadingIssues[section.title] && issues[section.title] && issues[section.title].length === 0 && (
                        <div className="no-issues-tile">
                          <div style={{ fontSize: '24px', marginBottom: '10px' }}>📝</div>
                          <div>No issues found in this section</div>
                        </div>
                      )}
                    </div>

                    {/* Right scroll arrow */}
                    <button 
                      className="scroll-nav right"
                      onClick={() => scrollRight(section.title)}
                      disabled={!scrollPositions[section.title]?.canScrollRight}
                      aria-label="Scroll right"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Empty for now */}
        <div className="dashboard-rightbar">
          {/* Future content for right sidebar can go here */}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Add Issue Modal */}
      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onClose={() => setIsAddIssueModalOpen(false)}
        localBodyData={localBody}
      />

      {/* See More Modal - All Issues */}
      <SeeMoreModal
        isOpen={seeMoreModal.isOpen}
        onClose={() => setSeeMoreModal({ isOpen: false, sectionTitle: '' })}
        sectionTitle={seeMoreModal.sectionTitle}
        issues={issues[seeMoreModal.sectionTitle]}
        loadingIssues={loadingIssues[seeMoreModal.sectionTitle]}
      />

      {/* See All Modal */}
      {seeAllModal.isOpen && (
        <div className="see-more-modal-overlay" onClick={closeSeeAllModal}>
          <div className="see-more-modal" onClick={(e) => e.stopPropagation()}>
            <div className="see-more-modal-header">
              <h2>{seeAllModal.sectionTitle} - All Issues</h2>
              <button className="close-modal-btn" onClick={closeSeeAllModal}>
                ×
              </button>
            </div>
            <div className="see-more-modal-content">
              <div className="modal-tiles-grid">
                {seeAllModal.sectionIssues.map((item, index) => (
                  <div className="modal-tile" key={`modal-${index}`}>
                    <div className="modal-tile-img">
                      <img 
                        src={item.image || (item.photos && item.photos[0]) || 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image'} 
                        alt={item.name || item.title}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="modal-tile-info">
                      <div className="modal-tile-name">{item.name || item.title}</div>
                      <div className="modal-tile-desc">{item.description}</div>
                      <div className="modal-tile-number">
                        {item.number || (item.createdAt ? formatDate(item.createdAt) : 'N/A')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {seeAllModal.sectionIssues.length === 0 && (
                <div className="modal-no-issues">
                  <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
                  <h3>No Issues Found</h3>
                  <p>There are currently no issues in this section.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update HKS Modal */}
      <UpdateHKSModal
        open={showHKSModal}
        onClose={() => setShowHKSModal(false)}
        wards={wards}
        lang={lang}
        onSubmit={handleHKSSubmit}
        loading={hksLoading}
        localBodyId={localBody?.local_body_id}
      />
    </div>
  );
}



export default LocalBodyDashboard;
