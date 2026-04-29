import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import {
  LayoutDashboard, Globe, AlertCircle, Route, Anchor,
  Container, Zap, BrainCircuit, BarChart4, History,
  Puzzle, Settings, Activity, Search, ChevronDown,
  User, LogOut, Bell, X, CheckCircle2, Clock
} from 'lucide-react';

// -- Nav Link ----------------------------------------------------------------
const NavLink = ({ to, icon: Icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 16px', margin: '1px 8px',
        borderRadius: '6px',
        background: isActive ? 'var(--bg-accent)' : 'transparent',
        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
        borderLeft: isActive ? '2px solid var(--accent-1)' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 400,
      }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-accent)'; e.currentTarget.style.color = 'var(--text-main)'; }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
      >
        <Icon size={15} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1 }}>{label}</span>
        {badge > 0 && (
          <span style={{
            background: 'var(--critical-muted)', color: 'white',
            fontSize: '9px', fontWeight: 800, padding: '1px 5px',
            borderRadius: '8px', fontFamily: 'var(--font-mono)',
          }}>{badge}</span>
        )}
      </div>
    </Link>
  );
};

// -- Chat Modal ---------------------------------------------------------------
function ChatModal() {
  const { activeChatShipmentId, chatMessages, closeChat, sendChatMessage } = useAppStore();
  const [draft, setDraft] = useState('');
  const bottom = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  if (!activeChatShipmentId) return null;

  const submit = () => {
    if (!draft.trim()) return;
    sendChatMessage(draft.trim());
    setDraft('');
  };

  return (
    <div className="modal-overlay" onClick={closeChat}>
      <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ width: 520, height: 480, display: 'flex', flexDirection: 'column', padding: 0 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>Shipment Chat  -  {activeChatShipmentId}</div>
            <div className="mono" style={{ color: 'var(--stable-muted)', fontSize: '10px', marginTop: '2px' }}>* FLUXAXIS AI ONLINE</div>
          </div>
          <button className="btn btn-icon" onClick={closeChat}><X size={16} /></button>
        </div>
        <div className="scroll-area" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {chatMessages.length === 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: '12px', textAlign: 'center', marginTop: '40px' }}>
              Send a message to FLUXAXIS AI about this shipment
            </div>
          )}
          {chatMessages.map(m => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.author === 'OPERATOR_082' ? 'flex-end' : 'flex-start' }}>
              <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '3px' }}>{m.author}  -  {m.ts}</div>
              <div style={{
                background: m.author === 'OPERATOR_082' ? 'var(--accent-1)' : 'var(--bg-accent)',
                color: m.author === 'OPERATOR_082' ? '#fff' : 'var(--text-main)',
                padding: '10px 14px', borderRadius: '8px', fontSize: '13px',
                maxWidth: '80%',
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
          <input className="input" value={draft} onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ask about this shipment..." style={{ flex: 1 }} />
          <button className="btn btn-primary btn-sm" onClick={submit}>Send</button>
        </div>
      </motion.div>
    </div>
  );
}

// -- Main Layout --------------------------------------------------------------
function ToastItem({ note }) {
  const { dismissNotification } = useAppStore();

  useEffect(() => {
    const timeout = setTimeout(() => dismissNotification(note.id), 4200);
    return () => clearTimeout(timeout);
  }, [note.id, dismissNotification]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      className={`toast ${note.type || ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <CheckCircle2 size={16} style={{ color: note.type === 'danger' ? 'var(--critical-muted)' : note.type === 'warning' ? 'var(--warning-muted)' : 'var(--accent-1)', flexShrink: 0, marginTop: 1 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Operation updated</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{note.message}</div>
        </div>
        <button className="btn btn-icon btn-sm" onClick={() => dismissNotification(note.id)} aria-label="Dismiss notification">
          <X size={13} />
        </button>
      </div>
    </motion.div>
  );
}

function ToastStack() {
  const { notifications } = useAppStore();

  return (
    <div className="toast-stack">
      <AnimatePresence mode="popLayout">
        {notifications.map(note => <ToastItem key={note.id} note={note} />)}
      </AnimatePresence>
    </div>
  );
}

export default function Layout({ children }) {
  const { initializeSystem, triggerSimulation, systemStatus, alerts, profileOpen, toggleProfile, closeProfile, searchQuery, setSearchQuery, addNotification } = useAppStore();
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    initializeSystem();
    const interval = setInterval(triggerSimulation, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close profile when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) closeProfile();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) navigate('/network');
  };

  const navItems = [
    { to: '/overview',            icon: LayoutDashboard, label: 'Overview' },
    { to: '/network',     icon: Globe,           label: 'Live Network' },
    { to: '/alerts',      icon: AlertCircle,     label: 'Alert Command', badge: criticalCount },
    { to: '/routes',      icon: Route,           label: 'Route Intelligence' },
    { to: '/ports',       icon: Anchor,          label: 'Port Intelligence' },
    { to: '/carriers',    icon: Container,       label: 'Carrier Analytics' },
    { to: '/events',      icon: Zap,             label: 'Event Monitor' },
    { to: '/predictive',  icon: BrainCircuit,    label: 'Predictive Engine' },
    { to: '/analytics',   icon: BarChart4,       label: 'Analytics Hub' },
    { to: '/feedback',    icon: History,         label: 'Decision Loop' },
    { to: '/integrations',icon: Puzzle,          label: 'Integrations' },
    { to: '/settings',    icon: Settings,        label: 'Settings' },
  ];

  return (
    <div className="grid-main">
      {/* -- Sidebar -- */}
      <aside style={{
        background: 'var(--bg-panel)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" alt="FluxAxis Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </div>

        {/* Nav */}
        <nav className="scroll-area" style={{ flex: 1, paddingTop: '8px', paddingBottom: '8px' }}>
          <div className="mono" style={{ padding: '8px 16px 4px', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>OPERATIONS</div>
          {navItems.slice(0, 7).map(item => <NavLink key={item.to} {...item} />)}
          <div className="divider" style={{ margin: '8px 16px' }} />
          <div className="mono" style={{ padding: '8px 16px 4px', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>INTELLIGENCE</div>
          {navItems.slice(7, 11).map(item => <NavLink key={item.to} {...item} />)}
          <div className="divider" style={{ margin: '8px 16px' }} />
          <div className="mono" style={{ padding: '8px 16px 4px', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>SYSTEM</div>
          {navItems.slice(11).map(item => <NavLink key={item.to} {...item} />)}
        </nav>

        {/* System Health + Profile */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          {/* System status */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: systemStatus === 'NOMINAL' ? 'var(--stable-muted)' : 'var(--critical-muted)', boxShadow: systemStatus === 'NOMINAL' ? '0 0 6px var(--stable-muted)' : '0 0 6px var(--critical-muted)' }} />
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SYS: {systemStatus}</span>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginLeft: 'auto' }}>99.97% UP</span>
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <div
              onClick={toggleProfile}
              style={{
                padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                background: profileOpen ? 'var(--bg-accent)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>D</div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>D. Devi Singh</div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>OPERATOR_082</div>
              </div>
              <ChevronDown size={14} style={{ color: 'var(--text-dim)', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </div>
            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  style={{
                    position: 'absolute', bottom: '100%', left: '8px', right: '8px',
                    background: 'var(--bg-panel-2)', border: '1px solid var(--border-strong)',
                    borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-soft)',
                    zIndex: 50,
                  }}>
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>D. Devi Singh</div>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>devi.singh@fluxaxis.io</div>
                  </div>
                  <div
                    onClick={() => { closeProfile(); navigate('/settings'); }}
                    style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '13px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-accent)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={14} /> View Full Profile
                  </div>
                  <div
                    onClick={() => { closeProfile(); addNotification('Signed out of the operator session', 'success'); navigate('/'); }}
                    style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--critical-muted)', fontSize: '13px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--critical-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={14} /> Logout
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* -- Main Content -- */}
      <main className="content-area">
        {/* Header */}
        <header className="top-bar">
          {/* Search */}
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              className="input"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Find shipments, carriers, ports..."
              style={{ paddingLeft: '32px', height: '36px' }}
            />
          </div>
          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
              EMEA_WEST - {clock.toLocaleTimeString()}
            </div>
            {/* Alert bell */}
            <div style={{ position: 'relative' }}>
              <button className="btn btn-icon" onClick={() => navigate('/alerts')}>
                <Bell size={16} />
              </button>
              {criticalCount > 0 && (
                <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '14px', height: '14px', background: 'var(--critical-muted)', borderRadius: '50%', fontSize: '8px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-mono)' }}>{criticalCount}</div>
              )}
            </div>
            {/* Avatar */}
            <div
              onClick={toggleProfile}
              style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', cursor: 'pointer' }}>
              D
            </div>
          </div>
        </header>

        {/* Page content */}
        <section style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {children}
        </section>
      </main>

      {/* Chat modal */}
      <ChatModal />
      <ToastStack />
    </div>
  );
}
