import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="website-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>OpJaya</h3>
          <p>Empowering local governance through digital innovation</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/help">Help</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Local Bodies</h4>
          <ul>
            <li><a href="#grama-panchayat">Grama Panchayat</a></li>
            <li><a href="#municipality">Municipality</a></li>
            <li><a href="#corporation">Corporation</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="LinkedIn">💼</a>
            <a href="#" aria-label="Email">📧</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 OpJaya. All rights reserved.</p>
          <p className="creator-credit">
            Created with ❤️ by <strong>Jai Mohanan</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;