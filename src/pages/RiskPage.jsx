import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { AlertOctagon, CheckCircle2, X, MessageSquare, Route, ExternalLink, Filter, ChevronDown } from 'lucide-react';

const ROUTE_ALTS = {
  default: [
    { id: 'R1', label: 'RECOMMENDED', via: 'Port of Oakland', carrier: 'COSCO Shipping', etaDelta: '+6h', costDelta: '+$8,400', slaOk: true, co2Delta: '+2.1%', confidence: 91, capacity: 'Available' },
    { id: 'R2', label: 'ALTERNATIVE', via: 'Port of Seattle', carrier: 'ONE Ocean', etaDelta: '+30h', costDelta: '+$3,100', slaOk: false, co2Delta: '+4.8%', confidence: 76, capacity: 'Limited' },
    { id: 'R3', label: 'AIR FREIGHT', via: 'LAX Air Cargo', carrier: 'FedEx Custom', etaDelta: '-48h', costDelta: '+$94,200', slaOk: true, co2Delta: '+380%', confidence: 99, capacity: 'Available' },
  ]
};

function RouteOption({ opt, onSelect }) {
  return (
    <div className="panel-2" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
      <div className="flex-between">
        <span className="badge badge-blue">{opt.label}</span>
        <span className="mono" style={{ fontSize: '11px', color: 'var(--stable-muted)' }}>{opt.confidence}% CONF.</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600 }}>{opt.via}</div>
      <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{opt.carrier}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[['ETA Delta', opt.etaDelta, opt.etaDelta.startsWith('+') ? 'var(--warning-muted)' : 'var(--stable-muted)'],
          ['Cost Delta', opt.costDelta, 'var(--warning-muted)'],
          ['CO2 Delta', opt.co2Delta, 'var(--text-muted)'],
          ['Capacity', opt.capacity, opt.capacity === 'Available' ? 'var(--stable-muted)' : 'var(--warning-muted)']
        ].map(([k, v, c]) => (
          <div key={k}>
            <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{k}</div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ flex: 1, height: '3px', background: 'var(--border-subtle)', borderRadius: '2px' }}>
          <div style={{ height: '100%', width: `${opt.confidence}%`, background: opt.confidence > 85 ? 'var(--stable-muted)' : 'var(--warning-muted)', borderRadius: '2px' }} />
        </div>
        {opt.slaOk ? <CheckCircle2 size={12} color="var(--stable-muted)" /> : <X size={12} color="var(--critical-muted)" />}
        <span className="mono" style={{ fontSize: '9px', color: opt.slaOk ? 'var(--stable-muted)' : 'var(--critical-muted)' }}>SLA</span>
      </div>
      <button className="btn btn-primary btn-sm" onClick={() => onSelect(opt)}>EXECUTE REROUTE</button>
    </div>
  );
}

export default function RiskPage() {
  const { alerts, resolveAlert, openChat, executeReroute, shipments } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const [filterSev, setFilterSev] = useState('ALL');
  const [resolved, setResolved] = useState([]);

  const filtered = alerts.filter(a => filterSev === 'ALL' || a.severity === filterSev);
  const selected = alerts.find(a => a.id === selectedId);
  const shipmentForAlert = selected ? shipments.find(s => s.id === selected.shipmentId) : null;

  const handleResolve = (id) => {
    setResolved(r => [...r, id]);
    setTimeout(() => { resolveAlert(id); if (selectedId === id) setSelectedId(null); }, 400);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '380px 1fr' }}>

      {/* Left: Alert list */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div className="flex-between" style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '14px' }}>SIGNAL DISPATCH</h2>
            <span className="badge badge-red">{alerts.filter(a => a.severity === 'CRITICAL').length} CRITICAL</span>
          </div>
          {/* Filter */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CRITICAL', 'WARNING'].map(f => (
              <button key={f} className={`btn btn-sm ${filterSev === f ? 'btn-primary' : ''}`} onClick={() => setFilterSev(f)}
                style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="scroll-area" style={{ flex: 1 }}>
          <AnimatePresence>
            {filtered.map(a => (
              <motion.div key={a.id} layout
                initial={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                animate={{ opacity: resolved.includes(a.id) ? 0.3 : 1 }}
                onClick={() => setSelectedId(a.id)}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: selectedId === a.id ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: selectedId === a.id ? '3px solid var(--accent-1)' : '3px solid transparent',
                  transition: 'all 0.12s',
                }}>
                <div className="flex-between" style={{ marginBottom: '6px' }}>
                  <div className={`status-pill status-${a.severity.toLowerCase()}`}>{a.severity}</div>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '3px' }}>{a.shipmentId}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.message}</div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="flex-center" style={{ height: '200px', color: 'var(--text-dim)' }}>
              <div className="mono" style={{ fontSize: '11px' }}>NO SIGNALS</div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Detail panel */}
      <div style={{ padding: '32px', overflowY: 'auto' }}>
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px', letterSpacing: '0.1em' }}>ALERT TRIAGE</div>
              <div className="flex-between">
                <div>
                  <h1 style={{ fontSize: '24px' }}>{selected.shipmentId}</h1>
                  <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '13px' }}>{selected.message}</p>
                </div>
                <div className={`status-pill status-${selected.severity.toLowerCase()}`} style={{ fontSize: '13px', padding: '6px 16px' }}>
                  {selected.severity}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {[
                { label: 'RISK SCORE', value: shipmentForAlert ? `${shipmentForAlert.drs}/100` : ' - ', color: 'var(--critical-muted)' },
                { label: 'CARGO VALUE', value: shipmentForAlert?.value || '$ - ', color: 'var(--text-main)' },
                { label: 'CARRIER', value: shipmentForAlert?.carrier || ' - ', color: 'var(--text-main)' },
                { label: 'ORIGIN', value: shipmentForAlert?.origin.name || ' - ', color: 'var(--accent-3)' },
                { label: 'DESTINATION', value: shipmentForAlert?.destination.name || ' - ', color: 'var(--accent-3)' },
                { label: 'ETA', value: shipmentForAlert?.etaFormatted || ' - ', color: 'var(--warning-muted)' },
              ].map(({ label, value, color }) => (
                <div key={label} className="panel-2" style={{ padding: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Causal analysis */}
            <div className="panel-2" style={{ padding: '20px', borderLeft: '3px solid var(--critical-muted)' }}>
              <h3 style={{ fontSize: '12px', marginBottom: '10px', color: 'var(--text-muted)' }}>CAUSAL_ANALYSIS</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                AI confidence: <strong style={{ color: 'var(--stable-muted)' }}>94.2%</strong>. Root cause identified as port congestion combined with severe weather front. Cascading delay probability: <strong style={{ color: 'var(--critical-muted)' }}>78%</strong>. Recommended intervention window: <strong>next 6h</strong>.
              </p>
            </div>

            {/* Reroute options */}
            <div>
              <h3 style={{ fontSize: '12px', marginBottom: '12px', color: 'var(--text-muted)' }}>AI_REROUTE_OPTIONS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {ROUTE_ALTS.default.map(opt => (
                  <RouteOption key={opt.id} opt={opt}
                    onSelect={() => { executeReroute(selected.shipmentId, opt.id); handleResolve(selected.id); }} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" onClick={() => openChat(selected.shipmentId)}>
                <MessageSquare size={14} /> Message Carrier
              </button>
              <button className="btn btn-danger" onClick={() => handleResolve(selected.id)}>
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-dim)' }}>
            <AlertOctagon size={40} strokeWidth={1} />
            <div className="mono" style={{ fontSize: '12px' }}>SELECT_SIGNAL_FOR_TRIAGE</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
