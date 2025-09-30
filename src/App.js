import React from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LocalBodyDashboard from './pages/LocalBodyDashboard';
import MapPage from './pages/MapPage';
import AssemblyPage from './pages/AssemblyPage';
import DistrictPage from './pages/DistrictPage';
import TopNav from './components/TopNav'; // Make sure this import exists
import LocalBodyChecklist from './pages/LocalBodyChecklist';
import Signup from './pages/Signup';
import StatePage from './pages/StatePage';
import AssemblyListPage from './pages/AssemblyListPage';
import './App.css';


function App() {
  return (
    <LanguageProvider>
      const basename = window.location.hostname.includes('github.io') 
  ? '/OPJaya' 
  : '';
      <Router basename={basename}>
        <div className="App">
          <TopNav /> {/* Universal/global top bar */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<LocalBodyDashboard />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/assembly/:assemblyName" element={<AssemblyPage />} />
            <Route path="/district/:districtName" element={<DistrictPage />} />
            <Route path="/localbody-checklist" element={<LocalBodyChecklist />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/state" element={<StatePage />} />
            <Route path="/assembly-list" element={<AssemblyListPage />} />
            <Route path="/localbody/:localBodyId" element={<LocalBodyDashboard />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>

  );
}

export default App;
