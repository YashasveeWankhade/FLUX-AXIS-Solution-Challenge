import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Zap, Cloud, Globe, Anchor, Users, Wrench, X, CheckCircle2, Eye, Filter } from 'lucide-react';

const TYPE_ICONS = {
  WEATHER: Cloud, GEOPOLITICAL: Globe, PORT: Anchor, LABOUR: Users,
  CUSTOMS: Wrench, MECHANICAL: Wrench, INFO: Zap
};

const TYPE_COLORS = {
  WEATHER: 'var(--accent-3)', GEOPOLITICAL: 'var(--critical-muted)',
  PORT: 'var(--warning-muted)', LABOUR: 'var(--accent-2)',
  CUSTOMS: 'var(--text-muted)', MECHANICAL: 'var(--critical-muted)', INFO: 'var(--text-dim)'
};

function EventCard({ event, isSelected, onClick }) {
  const Icon = TYPE_ICONS[event.type] || Zap;
  const typeColor = TYPE_COLORS[event.type] || 'var(--text-dim)';
  return (
    <div onClick={onClick}
      style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer', background: isSelected ? 'var(--bg-accent)' : 'transparent',
        borderLeft: isSelected ? `3px solid ${typeColor}` : '3px solid transparent',
        transition: 'all 0.1s',
      }}>
      <div className="flex-between" style={{ marginBottom: '5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon size={14} style={{ color: typeColor }} />
          <span style={{ fontSize: '12px', fontWeight: 700 }}>{event.title}</span>
        </div>
        <div className={`status-pill status-${event.severity.toLowerCase()}`} style={{ fontSize: '9px' }}>{event.severity}</div>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{event.region}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{event.impact}</div>
      <div className="flex-between" style={{ marginTop: '6px' }}>
        <span className="mono" style={{ fontSize: '9px', color: typeColor }}>{event.type}</span>
        <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{event.ts}</span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { events, shipments, addNotification } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [plans, setPlans] = useState({});
  const [showAffected, setShowAffected] = useState({});

  const filtered = events.filter(e =>
    (filterStatus === 'ALL' || e.status === filterStatus) &&
    (filterType === 'ALL' || e.type === filterType)
  );

  const selected = events.find(e => e.id === selectedId);
  const Icon = selected ? (TYPE_ICONS[selected.type] || Zap) : Zap;
  const typeColor = selected ? (TYPE_COLORS[selected.type] || 'var(--text-dim)') : 'var(--text-dim)';
  const affectedShipments = selected ? shipments.slice(0, Math.min(selected.affectedShipments, shipments.length)) : [];

  const types = ['ALL', ...new Set(events.map(e => e.type))];

  const triggerPlan = () => {
    if (!selected) return;
    const summary = selected.severity === 'CRITICAL'
      ? 'Immediate reroute review, carrier confirmation, and customer ETA notice queued.'
      : 'Monitoring cadence increased and standby capacity reserved.';
    setPlans(state => ({ ...state, [selected.id]: summary }));
    addNotification(`Contingency plan started for ${selected.title}`, selected.severity === 'CRITICAL' ? 'warning' : 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '360px 1fr' }}>

      {/* Left: Event list */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '14px' }}>EVENT_MONITOR</h2>
            <span className="badge badge-red">{events.filter(e => e.status === 'ACTIVE').length} ACTIVE</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'ACTIVE', 'MONITORING', 'RESOLVED'].map(f => (
              <button key={f} className={`btn btn-sm ${filterStatus === f ? 'btn-primary' : ''}`}
                style={{ flex: 1, justifyContent: 'center', fontSize: '8px', padding: '4px 2px' }}
                onClick={() => setFilterStatus(f)}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {types.map(t => (
              <button key={t} className={`btn btn-sm ${filterType === t ? 'btn-primary' : ''}`}
                style={{ fontSize: '9px', padding: '3px 6px' }}
                onClick={() => setFilterType(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {filtered.map(e => (
            <EventCard key={e.id} event={e} isSelected={selectedId === e.id} onClick={() => setSelectedId(e.id)} />
          ))}
          {filtered.length === 0 && (
            <div className="flex-center" style={{ height: '200px', color: 'var(--text-dim)' }}>
              <div className="mono" style={{ fontSize: '11px' }}>NO EVENTS</div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail */}
      <div style={{ padding: '32px', overflowY: 'auto' }}>
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: 40, height: 40, borderRadius: '8px', background: `${typeColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={20} style={{ color: typeColor }} />
                </div>
                <div>
                  <div className="mono" style={{ fontSize: '10px', color: typeColor, letterSpacing: '0.1em' }}>{selected.type}</div>
                  <h1 style={{ fontSize: '22px' }}>{selected.title}</h1>
                </div>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{selected.region}</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className={`status-pill status-${selected.severity.toLowerCase()}`}>{selected.severity}</div>
                  <div className={`badge ${selected.status === 'ACTIVE' ? 'badge-red' : selected.status === 'MONITORING' ? 'badge-orange' : 'badge-green'}`}>{selected.status}</div>
                </div>
              </div>
            </div>

            {/* Key facts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'IMPACT', value: selected.impact, color: 'var(--text-main)' },
                { label: 'AFFECTED SHIPMENTS', value: selected.affectedShipments, color: 'var(--critical-muted)' },
                { label: 'DETECTED AT', value: selected.ts, color: 'var(--text-muted)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel-2" style={{ padding: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* AI Impact Assessment */}
            <div className="panel-2" style={{ padding: '20px', borderLeft: `3px solid ${typeColor}` }}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>AI_IMPACT_ASSESSMENT</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                This {selected.type.toLowerCase()} event has been assessed as <strong style={{ color: typeColor }}>{selected.severity}</strong> severity.
                {selected.affectedShipments} shipments are in the impact zone. Recommended action: <strong style={{ color: 'var(--accent-1)' }}>
                  {selected.severity === 'CRITICAL' ? 'Immediate reroute evaluation' : selected.status === 'ACTIVE' ? 'Monitor + prepare contingency' : 'Continue standard monitoring'}
                </strong>.
                Estimated resolution: <strong>{selected.status === 'RESOLVED' ? 'Complete' : '12 - 48h'}</strong>.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {selected.status !== 'RESOLVED' && (
                <>
                  <button className="btn btn-primary" onClick={triggerPlan}>
                    {plans[selected.id] ? 'CONTINGENCY ACTIVE' : 'TRIGGER CONTINGENCY PLAN'}
                  </button>
                  <button className="btn" onClick={() => setShowAffected(state => ({ ...state, [selected.id]: !state[selected.id] }))}>
                    <Eye size={14} /> {showAffected[selected.id] ? 'Hide Affected Shipments' : 'View Affected Shipments'}
                  </button>
                </>
              )}
              {selected.status === 'RESOLVED' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--stable-muted)' }}>
                  <CheckCircle2 size={18} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Event Resolved</span>
                </div>
              )}
            </div>

            {(plans[selected.id] || showAffected[selected.id]) && (
              <div className="panel-2" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {plans[selected.id] && (
                  <div>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>CONTINGENCY STATUS</div>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>{plans[selected.id]}</div>
                  </div>
                )}
                {showAffected[selected.id] && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {affectedShipments.slice(0, 6).map(shipment => (
                      <div key={shipment.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px', background: 'var(--bg-elevated)' }}>
                        <div className="mono" style={{ fontSize: '10px', fontWeight: 700 }}>{shipment.id}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{shipment.origin.id} to {shipment.destination.id}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-dim)' }}>
            <Zap size={40} strokeWidth={1} />
            <div className="mono" style={{ fontSize: '12px' }}>SELECT_EVENT_FOR_ANALYSIS</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
