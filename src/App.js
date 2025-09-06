import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LocalBodyDashboard from './pages/LocalBodyDashboard';
import MapPage from './pages/MapPage';
import './App.css';

function App() {
  return (
    <Router basename="/OPJaya"> {/* Add basename for GitHub Pages */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<LocalBodyDashboard />} />
          <Route path="/localbody/:localBodyParams" element={<LocalBodyDashboard />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
