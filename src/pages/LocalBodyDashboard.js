import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddIssueModal from '../components/AddIssueModal';
import Footer from '../components/Footer';
import TopNav from '../components/TopNav'; // Add this import
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
  
  // Extract data from navigation state with better fallbacks
  const localBodyData = state?.localBodyData || state || {};
  const lbName = localBodyData.name || state?.localBodyName || state?.name || 'Unknown Local Body';
  const lbType = localBodyData.type || state?.localBodyType || state?.type || 'GP';
  const lsgCode = localBodyData.lsgCode || state?.lsgCode || '';
  const district = localBodyData.district || state?.district || '';
  const assembly = localBodyData.assembly || state?.assembly || '';
  
  // Get Malayalam name and type
  const lbNameMalayalam = localBodyData.nameMalayalam || state?.nameMalayalam || state?.Name_std_ml || getMLNameFromEnglish(lbName) || lbName;
  
  // Malayalam type mapping
  const getTypeInMalayalam = (type) => {
    const typeMapping = {
      'GP': 'ഗ്രാമപഞ്ചായത്ത്',
      'Municipality': 'മുനിസിപ്പാലിറ്റി',
      'Corporation': 'കോർപ്പറേഷൻ',
      'Grama Panchayat': 'ഗ്രാമപഞ്ചായത്ത്',
      'municipality': 'മുനിസിപ്പാലിറ്റി',
      'corporation': 'കോർപ്പറേഷൻ'
    };
    return typeMapping[type] || type;
  };
  
  const lbTypeMalayalam = getTypeInMalayalam(lbType);

  // Compose the KML file URL for the boundary
  const kmlFileName = encodeURIComponent(lbName) + '.kml';
  const kmlUrl = `${process.env.PUBLIC_URL}/Local_Body_Outline/${kmlFileName}`;

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
  const [showAllHKSRates, setShowAllHKSRates] = useState(false);

  // HKS Collection Rate data (hardcoded for now)
  const hksCollectionRates = [
    { name: 'മുടവന്നൂര്‍ (വാർഡ് 12)', rate: 59 },
    { name: 'തലയണപ്പറമ്പ് (വാർഡ് 6)', rate: 62 },
    { name: 'തുരുത്ത് (വാർഡ് 16)', rate: 63 },
    { name: 'മാട്ടായ (വാർഡ് 10)', rate: 67 },
    { name: 'കര്യേയില്‍ (വാർഡ് 14)', rate: 72 },
    { name: 'ഞാങ്ങാട്ടിരി (വാർഡ് 8)', rate: 74 },
    { name: 'തച്ചറംക്കുന്ന് (വാർഡ് 3)', rate: 77 },
    { name: 'മേഴത്തൂര്‍ (വാർഡ് 15)', rate: 81 },
    { name: 'വെള്ളിയാങ്കല്ല് (വാർഡ് 1)', rate: 83 },
    { name: 'തോട്ടപ്പായ (വാർഡ് 7)', rate: 86 },
    { name: 'വരണ്ടുകുറ്റിക്കടവ് (വാർഡ് 4)', rate: 88 },
    { name: 'കണ്ണന്നൂര്‍ (വാർഡ് 11)', rate: 89 },
    { name: 'തൃത്താല (വാർഡ് 2)', rate: 91 },
    { name: 'കൊഴിക്കോട്ടിരി (വാർഡ് 9)', rate: 92 },
    { name: 'കോടനാട് (വാർഡ് 13)', rate: 94 },
    { name: 'ഉള്ളന്നൂര്‍ (വാർഡ് 5)', rate: 95 },
    { name: 'കുന്നത്തുകാവ് (വാർഡ് 17)', rate: 96 }
  ];

  // Sort in ascending order and get first 5
  const sortedHKSRates = [...hksCollectionRates].sort((a, b) => a.rate - b.rate);
  const displayedHKSRates = showAllHKSRates ? sortedHKSRates : sortedHKSRates.slice(0, 5);

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
    if (!lsgCode) return;
    
    const folderName = sectionToFolder(sectionTitle);
    if (!folderName) return;

    setLoadingIssues(prev => ({ ...prev, [sectionTitle]: true }));

    try {
      const basePath = `https://pub-1560e47becfe44d3abc923d667d603c2.r2.dev/issues/${lsgCode}/${folderName}`;
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
    navigate('/map', {
      state: {
        localBodyName: lbName,
        localBodyType: lbType,
        localBodyData: localBodyData,
        kmlUrl: kmlUrl
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

  useEffect(() => {
    // Load mini map after component mounts
    const timer = setTimeout(() => {
      if (window.L && !window.miniMapInitialized) {
        initMiniMap();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [lbName, district]);

  const initMiniMap = () => {
    const miniMapElement = document.getElementById('mini-map');
    if (!miniMapElement) return;

    // Remove any previous map instance
    if (miniMapElement._leaflet_id) {
      miniMapElement._leaflet_id = null;
      miniMapElement.innerHTML = '';
    }

    try {
      // Default Kerala center (will fit to boundary after loading)
      const lat = 10.8505;
      const lng = 76.2711;

      // Initialize Leaflet map
      const miniMap = window.L.map('mini-map', {
        center: [lat, lng],
        zoom: 10,
        zoomControl: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        dragging: false,
        touchZoom: false,
        attributionControl: false
      });

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '',
      }).addTo(miniMap);

      // --- Add KML boundary ---
      if (window.omnivore && typeof kmlUrl === 'string' && kmlUrl.endsWith('.kml')) {
        const boundaryLayer = window.omnivore.kml(kmlUrl)
          .on('ready', function() {
            // Style the boundary
            this.eachLayer(function(layer) {
              layer.setStyle({
                color: '#1976d2',
                weight: 2,
                fillColor: '#1976d2',
                fillOpacity: 0.15
              });
            });
            // Fit map to boundary
            miniMap.fitBounds(this.getBounds(), { padding: [5, 5] });
          })
          .addTo(miniMap);
      }

      window.miniMapInitialized = true;
    } catch (error) {
      console.log('Mini map initialization failed:', error);
    }
  };

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      window.miniMapInitialized = false;
    };
  }, []);

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
              <h2 className="local-body-name malayalam-text">{lbNameMalayalam}</h2>
              <div className="local-body-type malayalam-text">{lbTypeMalayalam}</div>
              <div className="local-body-assembly malayalam-text">
                {localBodyData['Assembly(s)']}
              </div>
              <div className="local-body-district">
                {localBodyData['District']}
              </div>
            </div>
          </div>

          {/* HKS Collection Rate Section */}
          <div className="sidebar-section">
            <div className="sidebar-title">HKS Collection Rate</div>
            <div className="hks-rates-container">
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
                <span className="stat-value" style={{ fontSize: '0.8rem' }}>{lbType}</span>
              </div>
              {district && (
                <div className="stat-item">
                  <span className="stat-label">District</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/district/${district}`)}
                  >
                    {district}
                  </span>
                </div>
              )}
              {assembly && (
                <div className="stat-item">
                  <span className="stat-label">Assembly</span>
                  <span
                    className="stat-value clickable-link"
                    style={{ fontSize: '0.8rem' }}
                    onClick={() => navigate(`/assembly/${assembly}`)}
                  >
                    {assembly}
                  </span>
                </div>
              )}
              {lsgCode && (
                <div className="stat-item">
                  <span className="stat-label">LSG Code</span>
                  <span className="stat-value" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{lsgCode}</span>
                </div>
              )}
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
        localBodyData={localBodyData}
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
