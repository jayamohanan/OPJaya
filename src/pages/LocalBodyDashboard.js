import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../components/LanguageContext';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AddIssueModal from '../components/AddIssueModal';
import Footer from '../components/Footer';
import TopNav from '../components/TopNav'; // Add this import
import { TABLES, FIELDS } from '../constants/dbSchema';
import { LABELS } from '../constants/labels';
import './LocalBodyDashboard.css';
import TownIssuesModal from '../components/TownIssuesModal';
import { 
  getLocalBodyData, 
  getAssemblyData, 
  getDistrictData, 
  getWardsForLocalBody,
  getWardCollectionRates,
  getIssuesForLocalBody,
  getTownsForLocalBody,
  updateWardCollectionRates
} from '../services/clientDataService';
import { devError, devLog } from '../utils/devLog';

const sections = [
  { title: 'Towns' },
  { title: 'Others' }
];

const tiles = [   
  {
    name: 'Sample Tile 1',
    description: 'Description for tile 1',
    number: 123,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.001,76.001'
  },
  {
    name: 'Sample Tile 2',
    description: 'Description for tile 2',
    number: 456,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.002,76.002'
  },
  {
    name: 'Sample Tile 3',
    description: 'Description for tile 3',
    number: 789,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.003,76.003'
  },
  {
    name: 'Sample Tile 4',
    description: 'Description for tile 4',
    number: 101,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.004,76.004'
  },
  {
    name: 'Sample Tile 5',
    description: 'Description for tile 5',
    number: 202,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.005,76.005'
  },
  {
    name: 'Sample Tile 6',
    description: 'Description for tile 6',
    number: 303,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.006,76.006'
  },
  {
    name: 'Sample Tile 7',
    description: 'Description for tile 7',
    number: 404,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.007,76.007'
  },
  {
    name: 'Sample Tile 8',
    description: 'Description for tile 8',
    number: 505,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.008,76.008'
  },
  {
    name: 'Sample Tile 9',
    description: 'Description for tile 9',
    number: 606,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.009,76.009'
  },
  {
    name: 'Sample Tile 10',
    description: 'Description for tile 10',
    number: 707,
    image: 'https://pub-aeb176f5a53e4995aa86295ee4e9649e.r2.dev/jaya.jpg',
    location_url: 'https://maps.google.com/?q=10.010,76.010'
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

// Add mapping from section titles to type keys
const sectionTitleToType = {
  'Towns': 'town',
  'Others': 'others'
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
                    {tile.location_url && (
                      <div className="modal-tile-location">
                        <a href={tile.location_url} target="_blank" rel="noopener noreferrer">View Location</a>
                      </div>
                    )}
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
                    {issue.location_url && (
                      <div className="modal-tile-location">
                        <a href={issue.location_url} target="_blank" rel="noopener noreferrer">View Location</a>
                      </div>
                    )}
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
      wards.forEach(w => { initialRates[w[FIELDS.WARD.ID]] = ''; });
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
                    <tr key={w[FIELDS.WARD.ID]}>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>{w[FIELDS.WARD.WARD_NO]}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>{lang === 'ml' ? (w[FIELDS.WARD.NAME_ML] || w[FIELDS.WARD.NAME_EN]) : (w[FIELDS.WARD.NAME_EN] || w[FIELDS.WARD.NAME_ML])}</td>
                      <td style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={rates[w[FIELDS.WARD.ID]]}
                          onChange={e => handleChange(w[FIELDS.WARD.ID], e.target.value)}
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

// Helper for HKS rate color
function getRateColor(rate) {
  if (rate >= 90) return '#2ecc40'; // green
  if (rate >= 80) return '#7ed957'; // 25% away from green, 75% from red
  return '#ff4136'; // red
}

function LocalBodyDashboard() {
  const { lang, setLang } = useContext(LanguageContext); // 'ml' or 'en'
  const { districtId, assemblyId, localBodyId } = useParams();
  const navigate = useNavigate();

  // State for fetched data
  const [localBody, setLocalBody] = useState(null);
  const [assembly, setAssembly] = useState(null);
  const [district, setDistrict] = useState(null);

  // Fetch local body, assembly, and district details
  useEffect(() => {
    async function fetchData() {
      if (!localBodyId) return;
      
      try {
        // Fetch local body
        const lb = await getLocalBodyData(localBodyId);
        //AI- display lb contents
        devLog('Local Body Data:', lb);
        if (!lb) {
          setLocalBody(null);
          setAssembly(null);
          setDistrict(null);
          return;
        }
        setLocalBody(lb);

        // Fetch assembly
        const asm = await getAssemblyData(assemblyId || lb[FIELDS.LOCAL_BODY.ASSEMBLY_ID]);
        if (!asm) {
          setAssembly(null);
          setDistrict(null);
          return;
        }
        setAssembly(asm);

        // Fetch district
        const dist = await getDistrictData(districtId || asm[FIELDS.ASSEMBLY.DISTRICT_ID]);
        if (!dist) {
          setDistrict(null);
          return;
        }
        setDistrict(dist);
      } catch (error) {
  devError('Error fetching data:', error);
        setLocalBody(null);
        setAssembly(null);
        setDistrict(null);
      }
    }
    fetchData();
  }, [localBodyId, assemblyId, districtId]);

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
    async function fetchHKSRates() {
      if (!localBody?.[FIELDS.LOCAL_BODY.ID]) return;
      setLoadingHKSRates(true);
      
      try {
        // 1. Get all ward_ids for the local body
        const wards = await getWardsForLocalBody(localBody[FIELDS.LOCAL_BODY.ID]);
        if (!wards) return;

        const wardIds = wards.map(w => w[FIELDS.WARD.ID]);

        // 2. Get all collections for those wards
        const collections = await getWardCollectionRates(localBody[FIELDS.LOCAL_BODY.ID], wardIds);

        // 3. Merge with ward info and pick latest per ward
        const wardMap = {};
        wards.forEach(w => { wardMap[w[FIELDS.WARD.ID]] = w; });

        const latestByWard = {};
        (collections || []).forEach(item => {
          if (!item[FIELDS.WARD_COLLECTION.WARD_ID]) return;
          if (!latestByWard[item[FIELDS.WARD_COLLECTION.WARD_ID]] || new Date(item[FIELDS.WARD_COLLECTION.YEAR_MONTH]) > new Date(latestByWard[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD_COLLECTION.YEAR_MONTH])) {
            latestByWard[item[FIELDS.WARD_COLLECTION.WARD_ID]] = item;
          }
        });

        const wardLabel = LABELS.ward[lang];
        const mapped = Object.values(latestByWard)
          .map(item => ({
            name:
              lang === 'ml'
                ? `${wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.NAME_ML] || wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.NAME_EN]} (${wardLabel} ${wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.WARD_NO]})`
                : `${wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.NAME_EN] || wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.NAME_ML]} (${wardLabel} ${wardMap[item[FIELDS.WARD_COLLECTION.WARD_ID]][FIELDS.WARD.WARD_NO]})`,
            rate: item[FIELDS.WARD_COLLECTION.RATE]
          }))
          .sort((a, b) => a.rate - b.rate);
        setHksCollectionRates(mapped);
      } catch (error) {
  devError('Error fetching HKS rates:', error);
        setHksCollectionRates([]);
      } finally {
        setLoadingHKSRates(false);
      }
    }
    fetchHKSRates();
  }, [localBody?.[FIELDS.LOCAL_BODY.ID], lang]);

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
  devError(`Failed to fetch issues for ${sectionTitle}:`, error);
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
        localBodyName: localBody?.[FIELDS.LOCAL_BODY.NAME_EN],
        localBodyType: localBody?.[TABLES.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.NAME_EN],
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
    // Only open if there are real issues in the section
    if (issues[sectionTitle] && issues[sectionTitle].length > 0) {
      setSeeAllModal({
        isOpen: true,
        sectionTitle: sectionTitle,
        sectionIssues: issues[sectionTitle]
      });
    }
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
      .map(([ward_id, rate]) => ({ [FIELDS.WARD_COLLECTION.WARD_ID]: ward_id, [FIELDS.WARD_COLLECTION.YEAR_MONTH]: yearMonth, [FIELDS.WARD_COLLECTION.RATE]: Number(rate) }));
    
    if (inserts.length > 0) {
      try {
        const data = await updateWardCollectionRates(inserts);
  devLog('supa message:', data);
      } catch (error) {
  devLog('supa message:', error.message);
        alert('Error updating rates: ' + error.message);
        setHksLoading(false);
        return;
      }
    }
    setHksLoading(false);
    setShowHKSModal(false);
    // Optionally, refresh HKS rates
  };

  // Fetch wards for the local body (shared for sidebar and modal)
  useEffect(() => {
    async function fetchWards() {
      if (!localBody?.[FIELDS.LOCAL_BODY.ID]) return;
      
      try {
        const wardsData = await getWardsForLocalBody(localBody[FIELDS.LOCAL_BODY.ID]);
        setWards(wardsData || []);
      } catch (error) {
  devError('Error fetching wards:', error);
        setWards([]);
      }
    }
    fetchWards();
  }, [localBody?.[FIELDS.LOCAL_BODY.ID]]);

  // Fetch issues from the issues table, group by type, and display as cards under each section. If no issues exist, use placeholder tiles for all sections and log fallback. If at least one issue exists, show only real issues and log 'issues found'.
  useEffect(() => {
    async function fetchIssuesFromTable() {
      if (!localBodyId) return;
      
      try {
        const issuesData = await getIssuesForLocalBody(localBodyId);
        if (!issuesData || issuesData.length === 0) {
          devLog('no issue found, fallback to placeholder');
          // fallback to placeholder for all sections
          setIssues({});
        } else {
          // Group issues by type (section)
          const grouped = {};
          issuesData.forEach(issue => {
            const section = issue.type;
            if (!grouped[section]) grouped[section] = [];
            grouped[section].push(issue);
          });
          setIssues(grouped);
        }
      } catch (error) {
  devError('Error fetching issues:', error);
        setIssues({});
      }
    }
    fetchIssuesFromTable();
  }, [localBodyId]);

  // Log all towns in the local body (English and Malayalam)
  useEffect(() => {
    if (!localBodyId) {
  devLog('No localBodyId available for fetching towns.');
      return;
    }
    async function fetchTowns() {
      try {
        const towns = await getTownsForLocalBody(localBodyId);
      } catch (error) {
  devError('Error fetching towns for logging:', error);
      }
    }
    fetchTowns();
  }, [localBodyId]);

  // State to manage towns map and modal
  const [townsMap, setTownsMap] = useState({});
  const [townModal, setTownModal] = useState({ isOpen: false, townId: null, issues: [] });

  // Fetch all towns for the local body and store in a map for quick lookup
  useEffect(() => {
    async function fetchTowns() {
      if (!localBodyId) return;
      
      try {
        const towns = await getTownsForLocalBody(localBodyId);
        console.log('towns ',towns);
        if (towns && towns.length > 0) {
          const map = {};
          console.log('FIELDS.TOWN.ID:', FIELDS.TOWN.ID);
          towns.forEach(town => { map[town[FIELDS.TOWN.ID]] = town; });
          setTownsMap(map);
          devLog('townsMap:', map);
          console.log('townsMap:', map);
        } else {
          setTownsMap({});
        }
      } catch (error) {
  devError('Error fetching towns:', error);
        setTownsMap({});
      }
    }
    fetchTowns();
  }, [localBodyId]);

  // Group town issues by FIELDS.ISSUES.TOWN_ID
  const townIssues = (issues['town'] || []);
  const issuesByTown = {};
  townIssues.forEach(issue => {
    if (issue[FIELDS.ISSUES.TOWN_ID]) {
      if (!issuesByTown[issue[FIELDS.ISSUES.TOWN_ID]]) issuesByTown[issue[FIELDS.ISSUES.TOWN_ID]] = [];
      issuesByTown[issue[FIELDS.ISSUES.TOWN_ID]].push(issue);
    }
  });
  // Combine all non-town issues into 'others'
  const otherTypes = Object.keys(issues).filter(type => type !== 'town');
  const otherIssues = otherTypes.flatMap(type => issues[type] || []);

  return (
    <div className="dashboard-container">
      {/* Universal Top Navigation Bar */}
      <TopNav />

      <div className="dashboard-content-wrapper">
        {/* Left Sidebar */}
        <div className="dashboard-sidebar">
          {/* Local Body Name Header */}
          <div className="sidebar-section">
            <div className="local-body-header">
              <h2 className="local-body-name malayalam-text">
                {lang === 'ml'
                  ? (localBody?.[FIELDS.LOCAL_BODY.NAME_ML] || localBody?.[FIELDS.LOCAL_BODY.NAME_EN] || 'Unknown Local Body')
                  : (localBody?.[FIELDS.LOCAL_BODY.NAME_EN] || localBody?.[FIELDS.LOCAL_BODY.NAME_ML] || 'Unknown Local Body')}
              </h2>
              <div className="local-body-type malayalam-text">
                {lang === 'ml'
                  ? (localBody?.[TABLES.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.NAME_ML] || localBody?.[TABLES.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.NAME_EN] || '')
                  : (localBody?.[TABLES.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.NAME_EN] || localBody?.[TABLES.LOCAL_BODY_TYPE]?.[FIELDS.LOCAL_BODY_TYPE.NAME_ML] || '')}
              </div>
              <div className="local-body-assembly-district-row" style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 8, paddingLeft: 12 }}>
                {assembly && (
                  <span style={{ color: '#000', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', minWidth: 90 }}>
                      <span style={{ textAlign: 'right', flex: 1 }}>{LABELS.assembly[lang]}</span>
                      <span style={{ width: 10, textAlign: 'center' }}>:</span>
                    </span>
                    <span
                      className="clickable-link"
                      style={{ textDecoration: 'underline', color: '#1976d2', cursor: 'pointer' }}
                      onClick={() => navigate(`/assembly/${assembly.id}`)}
                      title="Go to Assembly"
                    >
                      #{assembly.id} {lang === 'ml' ? (assembly[FIELDS.ASSEMBLY.NAME_ML] || assembly[FIELDS.ASSEMBLY.NAME_EN]) : (assembly[FIELDS.ASSEMBLY.NAME_EN] || assembly[FIELDS.ASSEMBLY.NAME_ML])}
                    </span>
                  </span>
                )}
                {district && (
                  <span style={{ color: '#000', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'flex', alignItems: 'center', minWidth: 90 }}>
                      <span style={{ textAlign: 'right', flex: 1 }}>{LABELS.district[lang]}</span>
                      <span style={{ width: 10, textAlign: 'center' }}>:</span>
                    </span>
                    <span
                      className="clickable-link"
                      style={{ textDecoration: 'underline', color: '#1976d2', cursor: 'pointer' }}
                      onClick={() => navigate(`/district/${district[FIELDS.DISTRICT.ID]}`)}
                      title="Go to District"
                    >
                      {lang === 'ml' ? (district[FIELDS.DISTRICT.NAME_ML] || district[FIELDS.DISTRICT.NAME_EN]) : (district[FIELDS.DISTRICT.NAME_EN] || district[FIELDS.DISTRICT.NAME_ML])}
                    </span>
                  </span>
                )}
                <span style={{ color: '#000', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', minWidth: 90 }}>
                    <span style={{ textAlign: 'right', flex: 1 }}>{LABELS.state[lang]}</span>
                    <span style={{ width: 10, textAlign: 'center' }}>:</span>
                  </span>
                  <span
                    className="clickable-link"
                    style={{ textDecoration: 'underline', color: '#1976d2', cursor: 'pointer' }}
                    onClick={() => navigate('/state')}
                    title="Go to State"
                  >
                    {lang === 'ml' ? 'കേരളം' : 'Kerala'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* HKS Collection Rate Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">HKS Collection Rate</div>
            <div className="hks-rates-container">
              <div
                className="hks-rates-list"
                style={{
                  maxHeight: showAllHKSRates ? 400 : 200,
                  overflowY: 'auto',
                  marginBottom: 8,
                }}
              >
                {loadingHKSRates ? (
                  <div>Loading...</div>
                ) : (
                  displayedHKSRates.map((item, index) => (
                    <div key={index} className="hks-rate-item">
                      <span className="hks-name malayalam-text">{item.name}</span>
                      <span
                        className="hks-rate"
                        style={{ color: getRateColor(item.rate) }}
                      >
                        {item.rate}%
                      </span>
                    </div>
                  ))
                )}
              </div>
              <span
                className="see-more-hks-btn"
                onClick={toggleHKSRatesView}
                style={{ display: 'block', marginBottom: 8 }}
              >
                {showAllHKSRates ? 'Show Less' : 'See More'}
              </span>
            </div>
            <button
              className="sidebar-btn"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setShowHKSModal(true)}
            >
              Update HKS Collection Rate
            </button>
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
            {sections.map((section) => {
              // Determine if 'See all' should be enabled (content overflows)
              const containerId = `scroll-${section.title.replace(/\s+/g, '-')}`;
              let canSeeAll = false;
              if (typeof window !== 'undefined') {
                const el = document.getElementById(containerId);
                if (el && el.scrollWidth > el.clientWidth) {
                  canSeeAll = true;
                }
              }
              return (
                <div className="dashboard-section" key={section.title}>
                  <div className="dashboard-section-header">
                    <span>{section.title}</span>
                    <button 
                      className="see-all-issues-btn"
                      onClick={() => handleSeeAllIssues(section.title)}
                      type="button"
                      disabled={!canSeeAll || !(issues[section.title] && issues[section.title].length > 0)}
                      style={{ opacity: (!canSeeAll || !(issues[section.title] && issues[section.title].length > 0)) ? 0.5 : 1, cursor: (!canSeeAll || !(issues[section.title] && issues[section.title].length > 0)) ? 'not-allowed' : 'pointer' }}
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
                        {/* Render grouped town cards for Towns section */}
                        {section.title === 'Towns' && Object.keys(issuesByTown).length > 0 ? (
                          Object.entries(issuesByTown).map(([townId, townIssuesArr]) => (
                            <div 
                              className="dashboard-tile" 
                              key={townId}
                              style={{ minHeight: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid #ccc', borderRadius: 8 }}
                              onClick={() => setTownModal({ isOpen: true, townId, issues: townIssuesArr })}
                            >
                              <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Empty rect for now */}
                              </div>
                              <div style={{ marginTop: 12, fontWeight: 600, fontSize: 16, textAlign: 'center' }}>
                                {townsMap[townId]?.[FIELDS.TOWN.NAME_EN] || 'Unknown Town'}
                              </div>
                            </div>
                          ))
                        ) : section.title === 'Others' && otherIssues.length > 0 ? (
                          otherIssues.map((issue) => (
                            <div className="dashboard-tile" key={`issue-${issue.id}`}> 
                              <div className="dashboard-tile-img">
                                <img 
                                  src={issue.image_url || 'https://via.placeholder.com/200x150/f0f0f0/999999?text=No+Image'} 
                                  alt={issue.title || issue.description}
                                  onError={handleImageError}
                                />
                              </div>
                              <div className="dashboard-tile-info">
                                <div className="dashboard-tile-name">{issue.title || issue.type}</div>
                                <div className="dashboard-tile-desc">{issue.description}</div>
                                <div className="dashboard-tile-number">
                                  {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : ''}
                                </div>
                                {issue.location_url && (
                                  <div className="dashboard-tile-location">
                                    <a href={issue.location_url} target="_blank" rel="noopener noreferrer">View Location</a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          tiles.map((tile, idx) => (
                            <div className="dashboard-tile" key={`sample-${idx}`}> 
                              <div className="dashboard-tile-img">
                                <img src={tile.image} alt={tile.name} />
                              </div>
                              <div className="dashboard-tile-info">
                                <div className="dashboard-tile-name">{tile.name}</div>
                                <div className="dashboard-tile-desc">{tile.description}</div>
                                <div className="dashboard-tile-number">{tile.number}</div>
                                {tile.location_url && (
                                  <div className="dashboard-tile-location">
                                    <a href={tile.location_url} target="_blank" rel="noopener noreferrer">View Location</a>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
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
              );
            })}
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
                      {item.location_url && (
                        <div className="modal-tile-location">
                          <a href={item.location_url} target="_blank" rel="noopener noreferrer">View Location</a>
                        </div>
                      )}
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
        localBodyId={localBody?.[FIELDS.LOCAL_BODY.ID]}
      />

      {/* Town Issues Modal */}
      <TownIssuesModal
        isOpen={townModal.isOpen}
        onClose={() => setTownModal({ isOpen: false, townId: null, issues: [] })}
        town={townModal.townId}
        issues={townModal.issues}
        townsMap={townsMap}
      />
    </div>
  );
}



export default LocalBodyDashboard;
