import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
  const navigate = useNavigate();
  const { lang, setLang } = useContext(LanguageContext);

  // Toggle language between 'ml' and 'en'
  const toggleLang = () => setLang(lang === 'ml' ? 'en' : 'ml');

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
        <span
          className="lang-toggle"
          style={{
            cursor: 'pointer',
            textDecoration: 'underline',
            marginRight: 24,
            fontWeight: 500
          }}
          onClick={toggleLang}
        >
          {lang === 'ml' ? 'English' : 'Malayalam'}
        </span>
      </div>
    </nav>
  );
}

export default TopNav;