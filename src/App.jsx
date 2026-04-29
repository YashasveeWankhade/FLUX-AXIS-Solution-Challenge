import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';

import Layout from './components/Layout';
import HomePage           from './pages/HomePage';
import LandingPage        from './pages/LandingPage';
import NetworkPage        from './pages/NetworkPage';
import RiskPage           from './pages/RiskPage';
import RoutesPage         from './pages/RoutesPage';
import PortsPage          from './pages/PortsPage';
import CarriersPage       from './pages/CarriersPage';
import EventsPage         from './pages/EventsPage';
import SignalsPage        from './pages/SignalsPage';
import AnalyticsPage      from './pages/AnalyticsPage';
import FeedbackPage       from './pages/FeedbackPage';
import IntegrationsPage   from './pages/IntegrationsPage';
import SettingsPage       from './pages/SettingsPage';

export default function App() {
  const location = useLocation();
  const { settings } = useAppStore();

  useEffect(() => {
    // Apply global appearance settings
    const root = document.documentElement;
    root.style.setProperty('--accent', settings.accentColor);
    root.style.setProperty('--accent-1', settings.accentColor);
    root.style.setProperty('--border-active', settings.accentColor);

    if (settings.lightTheme) {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
    }

    if (settings.compactView) {
      document.body.classList.add('compact-view');
    } else {
      document.body.classList.remove('compact-view');
    }
  }, [settings.accentColor, settings.lightTheme, settings.compactView]);

  if (location.pathname === '/') {
    return <HomePage />;
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/overview"     element={<LandingPage />} />
          <Route path="/network"      element={<NetworkPage />} />
          <Route path="/alerts"       element={<RiskPage />} />
          <Route path="/routes"       element={<RoutesPage />} />
          <Route path="/ports"        element={<PortsPage />} />
          <Route path="/carriers"     element={<CarriersPage />} />
          <Route path="/events"       element={<EventsPage />} />
          <Route path="/predictive"   element={<SignalsPage />} />
          <Route path="/analytics"    element={<AnalyticsPage />} />
          <Route path="/feedback"     element={<FeedbackPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings"     element={<SettingsPage />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}
