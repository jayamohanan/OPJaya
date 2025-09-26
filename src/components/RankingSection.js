import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function RankingSection({ title, items, categories, minWidth = 520, maxWidth = 960, itemType, parentAssembly, parentDistrict }) {
  const navigate = useNavigate();
  // itemType: 'local_body' or 'assembly' (for link routing)
  // parentAssembly, parentDistrict: pass from AssemblyPage if available
  return (
    <div className="ranking-section" style={{ marginBottom: 12, marginTop: 0, paddingTop: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: maxWidth, margin: '0 auto' }}>
      {categories.map(({ key, label, color, bg }, catIdx) => {
        const filtered = items.filter(item => (item.category || 'Normal') === key);
        return (
          <div key={key} style={{ marginBottom: 14, marginTop: catIdx === 0 ? 0 : undefined, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: '17.6px', color, marginBottom: '0px', display: 'flex', alignItems: 'center', letterSpacing: 0.2 }}>
              <span style={{ fontSize: '22.4px', marginRight: '8px' }}>{label.split(' ')[0]}</span>
              <span>{label.split(' ').slice(1).join(' ')}</span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', textAlign: 'left', minWidth, width: '80%', maxWidth }}>
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
                      fontSize: 14,
                      color: '#222',
                      fontWeight: 500,
                      paddingLeft: 12,
                      textAlign: 'left',
                      padding: '7px 8px',
                      background: idx % 2 === 0 ? '#f5f7fa' : '#e3e8ef',
                      borderRadius: 4,
                      borderBottom: idx !== filtered.length - 1 ? '1px solid #e0e7ef' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: 0
                    }}
                  >
                    <span>{item.name}</span>
                    <span
                      style={{ cursor: 'pointer', padding: '2px 6px', marginLeft: 8, display: 'flex', alignItems: 'center' }}
                      onClick={() => navigate(linkTo, { state: linkState })}
                      title="Go to details"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                  </li>
                );
              }) : (
                <li style={{ fontSize: 14, color: '#aaa', fontWeight: 400, paddingLeft: 12, textAlign: 'left', padding: '7px 8px', background: '#f5f7fa', borderRadius: 4 }}>-----</li>
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
