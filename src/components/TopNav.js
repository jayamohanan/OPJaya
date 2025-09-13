import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TopNav.css';

function TopNav() {
  const navigate = useNavigate();

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
    </nav>
  );
}

export default TopNav;