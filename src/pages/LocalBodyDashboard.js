import React, { useState, useEffect } from 'react';
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


function LocalBodyDashboard() {
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

  // Fetch HKS Collection Rates from Supabase for the current local body
  useEffect(() => {
    console.log('Fetching HKS Collection Rates...');
    async function fetchHKSRates() {
      if (!localBody?.local_body_id) return;
      setLoadingHKSRates(true);
      // 1. Get all ward_ids for the local body
      const { data: wards, error: wardError } = await supabase
        .from('ward')
        .select('ward_id, ward_name_ml, ward_no')
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
          name: `${wardMap[item.ward_id].ward_name_ml} (വാർഡ് ${wardMap[item.ward_id].ward_no})`,
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
              <h2 className="local-body-name malayalam-text">{localBody?.local_body_name_ml || getMLNameFromEnglish(localBody?.local_body_name_en) || localBody?.local_body_name_en || 'Unknown Local Body'}</h2>
              <div className="local-body-type malayalam-text">{getTypeInMalayalam(localBody?.local_body_type_en)}</div>
              <div className="local-body-assembly malayalam-text">
                {assembly?.assembly_name_ml || assembly?.assembly_name_en || ''}
              </div>
              <div className="local-body-district">
                {district?.district_name_ml || district?.district_name_en || ''}
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
                <span className="stat-value" style={{ fontSize: '0.8rem' }}>{localBody?.local_body_type_en}</span>
              </div>
              {district && (
                <div className="stat-item">
                  <span className="stat-label">District</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/district/${district.district_name_en}`)}
                  >
                    {district.district_name_en}
                  </span>
                </div>
              )}
              {assembly && (
                <div className="stat-item">
                  <span className="stat-label">Assembly</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/assembly/${assembly.assembly_name_en}`)}
                  >
                    {assembly.assembly_name_en}
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
    </div>
  );
}

// Add this function before the main component
const getMLNameFromEnglish = (englishName) => {
  const nameMapping = {
    'thrithala': 'തൃത്താല',
    'Thrithala': 'തൃത്താല',
    'trithala': 'തൃത്താല',
    'yeroor': 'ഏരൂര്‍',
    'Yeroor': 'ഏരൂര്‍',
    'anchal': 'ആഞ്ചല്‍',
    'Anchal': 'ആഞ്ചല്‍',
    'kollam': 'കൊല്ലം',
    'Kollam': 'കൊല്ലം',
    'thiruvananthapuram': 'തിരുവനന്തപുരം',
    'Thiruvananthapuram': 'തിരുവനന്തപുരം',
    'kochi': 'കൊച്ചി',
    'Kochi': 'കൊച്ചി',
    'kozhikode': 'കോഴിക്കോട്',
    'Kozhikode': 'കോഴിക്കോട്'
  };
  return nameMapping[englishName] || null;
};

export default LocalBodyDashboard;
