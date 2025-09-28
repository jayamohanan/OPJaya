import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
  const navigate = useNavigate();
  const { lang, setLang } = useContext(LanguageContext);

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