import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import NetworkPage from './pages/NetworkPage';
import RiskPage from './pages/RiskPage';
import RoutesPage from './pages/RoutesPage';
import PortsPage from './pages/PortsPage';
import SignalsPage from './pages/SignalsPage';
import AnalyticsPage from './pages/AnalyticsPage';

// Placeholder components for the remaining pages to ensure they are "visible" and "dynamic"
const Placeholder = ({ title }) => (
  <div style={{ padding: '40px', background: 'var(--bg-app)', height: '100%' }}>
    <h1 style={{ fontSize: '32px' }}>{title}</h1>
    <div className="mono" style={{ marginTop: '16px', color: 'var(--text-dim)' }}>MODULE_UNDER_DEVELOPMENT</div>
  </div>
);

export default function App() {
  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/network" element={<NetworkPage />} />
          <Route path="/alerts" element={<RiskPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/ports" element={<PortsPage />} />
          <Route path="/carriers" element={<Placeholder title="Carrier Analytics" />} />
          <Route path="/events" element={<Placeholder title="Event Monitor" />} />
          <Route path="/predictive" element={<SignalsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/feedback" element={<Placeholder title="Decision Loop" />} />
          <Route path="/integrations" element={<Placeholder title="Integration Center" />} />
          <Route path="/settings" element={<Placeholder title="System Settings" />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
