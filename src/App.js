import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LocalBodyDashboard from './pages/LocalBodyDashboard';
import MapPage from './pages/MapPage';
import AssemblyPage from './pages/AssemblyPage';
import DistrictPage from './pages/DistrictPage';
import TopNav from './components/TopNav'; // Make sure this import exists
import LocalBodyChecklist from './pages/LocalBodyChecklist';
import './App.css';

function App() {
  return (
    <Router basename="/OPJaya"> {/* Add basename for GitHub Pages */}
      <div className="App">
        <TopNav /> {/* Universal/global top bar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<LocalBodyDashboard />} />
          <Route path="/localbody/:localBodyParams" element={<LocalBodyDashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/assembly/:assemblyName" element={<AssemblyPage />} />
          <Route path="/district/:districtName" element={<DistrictPage />} />
          <Route path="/localbody-checklist" element={<LocalBodyChecklist />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
