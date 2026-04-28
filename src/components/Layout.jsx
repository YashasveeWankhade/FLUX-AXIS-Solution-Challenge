import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { 
  LayoutDashboard, Globe, AlertCircle, Route, Anchor, 
  Container, Zap, BrainCircuit, BarChart4, History, 
  Puzzle, Settings, Activity 
} from 'lucide-react';

const NavLink = ({ to, icon: Icon, label, status }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
        background: isActive ? 'var(--bg-accent)' : 'transparent',
        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
        borderRight: isActive ? '2px solid var(--text-main)' : 'none',
        cursor: 'pointer'
      }}>
        <Icon size={18} />
        <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
        {status && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--critical-muted)', marginLeft: 'auto' }} />}
      </div>
    </Link>
  );
};

export default function Layout({ children }) {
  const { initializeSystem, triggerSimulation, systemStatus, alerts } = useAppStore();
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  useEffect(() => {
    initializeSystem();
    const interval = setInterval(triggerSimulation, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/network', icon: Globe, label: 'Live Network' },
    { to: '/alerts', icon: AlertCircle, label: 'Alert Command', status: criticalCount > 0 },
    { to: '/routes', icon: Route, label: 'Route Intelligence' },
    { to: '/ports', icon: Anchor, label: 'Port Intelligence' },
    { to: '/carriers', icon: Container, label: 'Carrier Analytics' },
    { to: '/events', icon: Zap, label: 'Event Monitor' },
    { to: '/predictive', icon: BrainCircuit, label: 'Predictive Engine' },
    { to: '/analytics', icon: BarChart4, label: 'Analytics Hub' },
    { to: '/feedback', icon: History, label: 'Decision Loop' },
    { to: '/integrations', icon: Puzzle, label: 'Integrations' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="grid-main">
      <aside className="panel" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 12, height: 12, background: 'black' }} />
            <span style={{ fontWeight: 800, fontSize: '18px' }}>FLUXAXIS</span>
          </div>
        </div>
        <nav style={{ flex: 1, paddingTop: '16px' }} className="scroll-area">
          {navItems.map(item => <NavLink key={item.to} {...item} />)}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Activity size={14} color={systemStatus === 'NOMINAL' ? 'var(--stable-muted)' : 'var(--critical-muted)'} />
            <span className="mono" style={{ fontSize: '11px' }}>SYS_HEALTH: {systemStatus}</span>
          </div>
        </div>
      </aside>
      <main className="content-area">
        <header className="top-bar">
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>EMEA_WEST • {new Date().toLocaleTimeString()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 24, height: 24, background: 'var(--bg-accent)', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>OPERATOR_082</span>
          </div>
        </header>
        <section style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </section>
      </main>
    </div>
  );
}
