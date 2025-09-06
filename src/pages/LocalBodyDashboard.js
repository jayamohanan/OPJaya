import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './LocalBodyDashboard.css';

const sections = [
  { title: 'HKS Collection Data' },
  { title: 'Towns' },
  { title: 'Roads' },
  { title: 'Bus Stands/Bus Stops' },
  { title: 'Water Bodies' },
  { title: 'Bin Install and Upkeep' },
  { title: 'Bin Usage' },
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
];

function LocalBodyDashboard() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const lbName = state?.localBodyName || 'Unknown';
  const lbType = state?.localBodyType || '';

  // Compose the KML file URL for the boundary
  const kmlFileName = encodeURIComponent(lbName) + '.kml';
  const kmlUrl = `${process.env.PUBLIC_URL}/Local_Body_Outline/${kmlFileName}`;

  const [openSections, setOpenSections] = useState(
    sections.reduce((acc, section) => ({ ...acc, [section.title]: false }), {})
  );

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMapClick = () => {
    navigate('/map', {
      state: {
        localBodyName: lbName,
        localBodyType: lbType,
        kmlUrl: kmlUrl
      }
    });
  };

  const toggleSection = (title) => {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="dashboard-container"> {/* Remove any inline width/margin/padding styles */}
      <div className="dashboard-header" style={{ position: 'relative' }}>
        {/* Top bar with home button and map button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '16px 0',
          marginBottom: '16px'
        }}>
          <button
            className="home-icon-btn"
            onClick={handleHomeClick}
            aria-label="Home"
          >
            <img
              src="/home.png"
              alt="Home"
              style={{ width: 24, height: 24, display: 'block' }}
            />
          </button>
          
          <button
            onClick={handleMapClick}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            🗺️ View Map
          </button>
        </div>
        
        {/* Profile section with photo and name */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: '32px 20px',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Profile Photo */}
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #1976d2',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            flexShrink: 0          // Keep this
          }}>
            <img
              src={`${process.env.PUBLIC_URL}/lb_profile_photo.jpg`}
              alt={`${lbName} Profile`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* Name and Type */}
          <div style={{
            textAlign: 'left',
            flex: 1          // Keep this
          }}>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#333'
            }}>
              {lbName}
            </h1>
            <p style={{
              margin: 0,
              fontSize: '1.2rem',
              color: '#666',
              fontWeight: '500'
            }}>
              {lbType}
            </p>
          </div>
        </div>
      </div>

      {/* All dashboard sections */}
      <div className="dashboard-sections"> {/* Remove any inline width/margin styles */}
        {sections.map((section) => (
          <div className="dashboard-section" key={section.title}>
            <div
              className="dashboard-section-header"
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              <span className="dashboard-section-toggle">
                {openSections[section.title] ? '▼' : '▶'}
              </span>
            </div>
            {openSections[section.title] && (
              <div className="dashboard-tiles-grid">
                {tiles.map((tile, idx) => (
                  <div className="dashboard-tile" key={idx}>
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LocalBodyDashboard;
