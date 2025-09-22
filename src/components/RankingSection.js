import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function RankingSection({ title, items, categories, minWidth = 520, maxWidth = 960, itemType, parentAssembly, parentDistrict }) {
  const navigate = useNavigate();
  // itemType: 'local_body' or 'assembly' (for link routing)
  // parentAssembly, parentDistrict: pass from AssemblyPage if available
  return (
    <div className="ranking-section" style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', width: maxWidth, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 28, color: '#1976d2', fontWeight: 700, fontSize: 26, letterSpacing: 0.5, textAlign: 'center' }}>{title}</h3>
      {categories.map(({ key, label, color, bg }) => {
        const filtered = items.filter(item => (item.category || 'Normal') === key);
        return (
          <div key={key} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: 22, color, marginBottom: 10, display: 'flex', alignItems: 'center', letterSpacing: 0.2 }}>
              <span style={{ fontSize: 28, marginRight: 10 }}>{label.split(' ')[0]}</span>
              <span>{label.split(' ').slice(1).join(' ')}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'left', minWidth, width: '100%', maxWidth }}>
              {filtered.length > 0 ? filtered.map((item, idx) => {
                let linkTo = '#';
                let linkState = undefined;
                if (itemType === 'local_body') {
                  linkTo = `/localbody/${item.id}`;
                  linkState = {
                    localBodyId: item.id,
                    localBodyName: item.name,
                    localBodyType: item.type,
                    assemblyId: parentAssembly?.id,
                    assemblyName: parentAssembly?.name,
                    districtId: parentDistrict?.id,
                    districtName: parentDistrict?.name
                  };
                }
                if (itemType === 'assembly') {
                  linkTo = `/assembly/${item.id}`;
                  linkState = undefined;
                }
                // Use a more robust key: prefer item.id, fallback to item.assembly_id, item.local_body_id, or item.name+idx
                const uniqueKey = item.id || item.assembly_id || item.local_body_id || (item.name ? item.name + '-' + idx : idx);
                return (
                  <li
                    key={uniqueKey}
                    style={{
                      marginBottom: 0,
                      fontSize: 16,
                      color: '#222',
                      fontWeight: 500,
                      paddingLeft: 32,
                      textAlign: 'left',
                      padding: '14px 12px',
                      background: idx % 2 === 0 ? '#f5f7fa' : '#e3e8ef',
                      borderRadius: 4,
                      borderBottom: idx !== filtered.length - 1 ? '1px solid #e0e7ef' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{item.name}</span>
                    <span
                      style={{ cursor: 'pointer', padding: '4px 8px', marginLeft: 12, display: 'flex', alignItems: 'center' }}
                      onClick={() => navigate(linkTo, { state: linkState })}
                      title="Go to details"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                  </li>
                );
              }) : (
                <li style={{ fontSize: 16, color: '#aaa', fontWeight: 400, paddingLeft: 32, textAlign: 'left', padding: '14px 12px', background: '#f5f7fa', borderRadius: 4 }}>-----</li>
              )}
            </ul>
          </div>
        );
      })}
      {items.length === 0 && 'None'}
    </div>
  );
}

export default RankingSection;
