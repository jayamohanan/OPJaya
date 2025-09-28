import React, { useState, useEffect } from 'react';

function TownIssuesModal({ isOpen, onClose, town, issues, townsMap }) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  useEffect(() => { setSelectedImageIdx(0); }, [isOpen, issues]);
  if (!isOpen || !town || !issues || issues.length === 0) return null;
  const images = issues.map(issue => issue.image_url).filter(Boolean);
  const selectedImage = images[selectedImageIdx] || '';
  const selectedIssue = issues[selectedImageIdx] || {};
  const townName = townsMap[town]?.town_name_en || 'Unknown Town';
  const canGoLeft = selectedImageIdx > 0;
  const canGoRight = selectedImageIdx < images.length - 1;
  return (
    <div className="see-more-modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
      <div className="see-more-modal" onClick={e => e.stopPropagation()} style={{
        maxWidth: 'calc(100vw - 64px)',
        width: 'calc(100vw - 64px)',
        maxHeight: 'calc(100vh - 64px)',
        height: 'calc(100vh - 64px)',
        margin: 32,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
        boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div className="see-more-modal-header" style={{ flex: '0 0 auto', borderBottom: '1px solid #eee', padding: '20px 24px 10px 24px' }}>
          <h2 style={{ margin: 0, fontSize: 26 }}>{townName} - Issues</h2>
          <button className="close-modal-btn" onClick={onClose} style={{ top: 18, right: 18 }}>×</button>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'stretch', justifyContent: 'center', padding: 0, overflow: 'hidden' }}>
          {/* Left: Carousel/Issues (2/3) */}
          <div style={{ flex: 2, minWidth: 0, padding: 24, overflow: 'auto', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {/* Carousel */}
            <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: 24, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Carousel image with arrows inside */}
              <div style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto' }}>
                {selectedImage && (
                  <img src={selectedImage} alt="Issue" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 10, display: 'block', margin: '0 auto' }} />
                )}
                {/* Left chevron arrow inside image */}
                <button
                  onClick={() => canGoLeft && setSelectedImageIdx(selectedImageIdx - 1)}
                  disabled={!canGoLeft}
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(25,118,210,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: canGoLeft ? 'pointer' : 'default',
                    color: '#fff',
                    fontSize: 20,
                    zIndex: 2,
                    opacity: canGoLeft ? 1 : 0.4
                  }}
                  aria-label="Previous image"
                >
                  <span style={{ display: 'inline-block' }}>&#x2039;</span>
                </button>
                {/* Right chevron arrow inside image */}
                <button
                  onClick={() => canGoRight && setSelectedImageIdx(selectedImageIdx + 1)}
                  disabled={!canGoRight}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(25,118,210,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: canGoRight ? 'pointer' : 'default',
                    color: '#fff',
                    fontSize: 20,
                    zIndex: 2,
                    opacity: canGoRight ? 1 : 0.4
                  }}
                  aria-label="Next image"
                >
                  <span style={{ display: 'inline-block' }}>&#x203A;</span>
                </button>
              </div>
              {/* Thumbnails below image */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    style={{ width: 64, height: 64, objectFit: 'cover', border: idx === selectedImageIdx ? '2px solid #1976d2' : '1px solid #ccc', borderRadius: 6, cursor: 'pointer' }}
                    onClick={() => setSelectedImageIdx(idx)}
                  />
                ))}
              </div>
            </div>
            {/* Metadata for selected issue only */}
            <div style={{ width: '100%', maxWidth: 700, margin: '0 auto', background: '#f9f9f9', borderRadius: 8, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ marginBottom: 10 }}><b>Description:</b> {selectedIssue.description}</div>
              <div style={{ marginBottom: 10 }}><b>Date:</b> {selectedIssue.created_at ? new Date(selectedIssue.created_at).toLocaleDateString() : 'N/A'}</div>
              {selectedIssue.location_url && <div style={{ marginBottom: 10 }}><b>Location:</b> <a href={selectedIssue.location_url} target="_blank" rel="noopener noreferrer">View on Map</a></div>}
              {selectedIssue.resolved && <div style={{ color: 'green', marginBottom: 10 }}><b>Resolved</b></div>}
            </div>
          </div>
          {/* Right: Town Summary (1/3) */}
          <div style={{ flex: 1, minWidth: 0, padding: 32, background: '#f8fafd', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
            <h3 style={{ color: '#1976d2', fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Town Summary</h3>
            <ul style={{ color: '#333', fontSize: 16, paddingLeft: 18, margin: 0, listStyle: 'disc' }}>
              <li>Total Population: 12,345</li>
              <li>Area: 23.5 sq.km</li>
              <li>Number of Wards: 18</li>
              <li>Major Landmarks: School, Market, Temple</li>
              <li>Recent Development: New park opened</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TownIssuesModal;
