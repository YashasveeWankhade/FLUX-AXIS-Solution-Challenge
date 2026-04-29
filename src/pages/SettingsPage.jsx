import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Shield, Palette, Globe2, Save, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const SECTIONS = ['Profile', 'Notifications', 'Security', 'Appearance', 'Regional', 'API Keys'];
const SECTION_ICONS = { Profile: User, Notifications: Bell, Security: Shield, Appearance: Palette, Regional: Globe2, 'API Keys': Shield };

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: '11px',
        background: value ? 'var(--accent-1)' : 'var(--border-strong)',
        cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
      <div style={{
        position: 'absolute', top: '3px', left: value ? '21px' : '3px',
        width: 16, height: 16, borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex-between" style={{ padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
      <div style={{ flex: 1, paddingRight: '20px' }}>
        <div style={{ fontWeight: 600, fontSize: '13px' }}>{label}</div>
        {description && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { addNotification, settings: prefs, updateSettings } = useAppStore();
  const [activeSection, setActiveSection] = useState('Profile');
  const [saved, setSaved] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  const set = (k, v) => updateSettings({ [k]: v });

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', prefs.accentColor);
    document.documentElement.style.setProperty('--accent-1', prefs.accentColor);
    document.documentElement.style.setProperty('--border-active', prefs.accentColor);
  }, [prefs.accentColor]);

  const handleSave = () => {
    setSaved(true);
    addNotification('Settings saved locally', 'success');
    setTimeout(() => setSaved(false), 2500);
  };

  const regenerateApiKey = () => {
    const token = Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18);
    set('apiKey', `flx_sk_live_${token}`);
    addNotification('API key regenerated', 'warning');
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'Profile': return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: '#fff' }}>{prefs.avatarInitial}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>{prefs.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{prefs.role}</div>
              <button className="btn btn-sm" style={{ marginTop: '8px' }} onClick={() => {
                set('avatarInitial', prefs.name.trim().charAt(0).toUpperCase() || 'D');
                addNotification('Avatar initials updated', 'success');
              }}>Change Avatar</button>
            </div>
          </div>
          <SettingRow label="Full Name">
            <input className="input" value={prefs.name} onChange={e => set('name', e.target.value)} style={{ width: '220px' }} />
          </SettingRow>
          <SettingRow label="Email Address">
            <input className="input" value={prefs.email} onChange={e => set('email', e.target.value)} style={{ width: '220px' }} />
          </SettingRow>
          <SettingRow label="Role / Title">
            <input className="input" value={prefs.role} onChange={e => set('role', e.target.value)} style={{ width: '220px' }} />
          </SettingRow>
          <SettingRow label="Operator ID" description="Read-only system identifier">
            <div className="mono" style={{ fontSize: '12px', color: 'var(--text-dim)' }}>OPERATOR_082</div>
          </SettingRow>
        </div>
      );

      case 'Notifications': return (
        <div>
          <SettingRow label="Critical Alert Sound" description="Play audio when a CRITICAL alert is received">
            <Toggle value={prefs.alertSound} onChange={v => set('alertSound', v)} />
          </SettingRow>
          <SettingRow label="Email Notifications" description="Receive daily digest and alert emails">
            <Toggle value={prefs.emailAlerts} onChange={v => set('emailAlerts', v)} />
          </SettingRow>
          <SettingRow label="SMS Alerts" description="Text message for critical disruptions only">
            <Toggle value={prefs.smsAlerts} onChange={v => set('smsAlerts', v)} />
          </SettingRow>
          <SettingRow label="Critical Alerts Only" description="Suppress WARNING and INFO level notifications">
            <Toggle value={prefs.criticalOnly} onChange={v => set('criticalOnly', v)} />
          </SettingRow>
        </div>
      );

      case 'Security': return (
        <div>
          <SettingRow label="Two-Factor Authentication" description="Require OTP on every login">
            <Toggle value={prefs.twoFactor} onChange={v => set('twoFactor', v)} />
          </SettingRow>
          <SettingRow label="Session Timeout" description="Auto-logout after inactivity">
            <select className="input" value={prefs.sessionTimeout} onChange={e => set('sessionTimeout', e.target.value)} style={{ width: '120px' }}>
              {['15', '30', '60', '120'].map(v => <option key={v} value={v}>{v} min</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Change Password">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {passwordUpdated && <span className="badge badge-green">UPDATED</span>}
              <button className="btn btn-sm" onClick={() => { setPasswordUpdated(true); addNotification('Password update link sent', 'success'); }}>Update Password</button>
            </div>
          </SettingRow>
          <SettingRow label="Active Sessions" description="2 sessions currently active">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {sessionsRevoked && <span className="badge badge-green">REVOKED</span>}
              <button className="btn btn-sm btn-danger" onClick={() => { setSessionsRevoked(true); addNotification('All other sessions revoked', 'warning'); }}>Revoke All</button>
            </div>
          </SettingRow>
        </div>
      );

      case 'Appearance': return (
        <div>
          <SettingRow label="Light Theme" description="Use the minimal light interface">
            <Toggle value={prefs.lightTheme} onChange={v => set('lightTheme', v)} />
          </SettingRow>
          <SettingRow label="Compact View" description="Reduce padding and spacing">
            <Toggle value={prefs.compactView} onChange={v => set('compactView', v)} />
          </SettingRow>
          <SettingRow label="Enable Animations" description="Page transitions and micro-animations">
            <Toggle value={prefs.animations} onChange={v => set('animations', v)} />
          </SettingRow>
          <SettingRow label="Accent Color" description="Primary UI accent color">
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#3F6C8F', '#7A6670', '#4F7F94', '#B7791F', '#C2414B'].map(c => (
                <div key={c} onClick={() => set('accentColor', c)} style={{ width: 20, height: 20, borderRadius: '50%', background: c, cursor: 'pointer', border: c === prefs.accentColor ? '2px solid var(--text-main)' : '1px solid var(--border-subtle)' }} />
              ))}
            </div>
          </SettingRow>
        </div>
      );

      case 'Regional': return (
        <div>
          <SettingRow label="Timezone">
            <select className="input" value={prefs.timezone} onChange={e => set('timezone', e.target.value)} style={{ width: '160px' }}>
              {['UTC', 'UTC+1', 'UTC+5:30', 'UTC+8', 'UTC-5', 'UTC-8'].map(t => <option key={t}>{t}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Default Currency">
            <select className="input" value={prefs.currency} onChange={e => set('currency', e.target.value)} style={{ width: '120px' }}>
              {['USD', 'EUR', 'GBP', 'CNY', 'INR', 'AED'].map(c => <option key={c}>{c}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Language">
            <select className="input" value={prefs.language} onChange={e => set('language', e.target.value)} style={{ width: '160px' }}>
              {['English', 'Deutsch', 'Francais', 'Mandarin', 'Arabic'].map(l => <option key={l}>{l}</option>)}
            </select>
          </SettingRow>
        </div>
      );

      case 'API Keys': return (
        <div>
          <SettingRow label="Live API Key" description="Use this key to integrate FLUXAXIS with external systems">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {showApiKey ? prefs.apiKey : '*'.repeat(40)}
              </div>
              <button className="btn btn-icon btn-sm" onClick={() => setShowApiKey(v => !v)}>
                {showApiKey ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </SettingRow>
          <SettingRow label="Regenerate API Key" description="Invalidates the current key immediately">
            <button className="btn btn-sm btn-danger" onClick={regenerateApiKey}>Regenerate</button>
          </SettingRow>
          <SettingRow label="Webhook URL" description="POST endpoint for real-time event delivery">
            <input className="input" value={prefs.webhookUrl} onChange={e => set('webhookUrl', e.target.value)} placeholder="https://your-server.com/webhook" style={{ width: '260px' }} />
          </SettingRow>
        </div>
      );

      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '220px 1fr', overflowY: 'auto' }}>

      {/* Left: Nav */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', padding: '24px 12px', gap: '2px' }}>
        <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '0 8px 12px' }}>SETTINGS</div>
        {SECTIONS.map(s => {
          const Icon = SECTION_ICONS[s] || Settings;
          return (
            <div key={s} onClick={() => setActiveSection(s)}
              style={{
                padding: '9px 12px', borderRadius: '6px', cursor: 'pointer',
                background: activeSection === s ? 'var(--bg-accent)' : 'transparent',
                color: activeSection === s ? 'var(--text-main)' : 'var(--text-muted)',
                borderLeft: activeSection === s ? '2px solid var(--accent-1)' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px',
                fontWeight: activeSection === s ? 600 : 400, transition: 'all 0.1s',
              }}>
              <Icon size={14} />
              {s}
            </div>
          );
        })}
      </div>

      {/* Right: Content */}
      <div style={{ padding: '28px 36px', overflowY: 'auto' }}>
        <div className="flex-between" style={{ marginBottom: '24px' }}>
          <div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '4px' }}>SYSTEM_SETTINGS</div>
            <h1 style={{ fontSize: '22px' }}>{activeSection}</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {saved && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--stable-muted)', fontSize: '12px', fontWeight: 600 }}>
                <CheckCircle2 size={15} /> Saved
              </motion.div>
            )}
            <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Save Changes</button>
          </div>
        </div>
        {renderSection()}
      </div>
    </motion.div>
  );
}
