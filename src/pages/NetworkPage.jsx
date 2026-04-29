import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import RotatingGlobe from '../components/ui/RotatingGlobe';
import { Search, X, MessageSquare, Eye, Navigation, Globe2 } from 'lucide-react';

/* ── Risk Gauge ─────────────────────────────────────────────────────────── */
function RiskGauge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct > 75 ? 'var(--critical-muted)' : pct > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="flex-between">
        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>DRS</span>
        <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color }}>{pct}</span>
      </div>
      <div className="risk-bar-wrap">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

/* ── Network Page ───────────────────────────────────────────────────────── */
export default function NetworkPage() {
  const { shipments, ports, searchQuery, openChat } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [telemetryOpen, setTelemetryOpen] = useState(false);

  /* ── filtered list ── */
  const filtered = useMemo(() => {
    const q = (localSearch || searchQuery || '').toLowerCase();
    return shipments
      .filter(s => statusFilter === 'ALL' || s.status === statusFilter)
      .filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.origin.name.toLowerCase().includes(q) ||
        s.destination.name.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
      );
  }, [shipments, localSearch, searchQuery, statusFilter]);

  const selected = shipments.find(s => s.id === selectedId);

  /* ── globe data: trade routes ── */
  const globeRoutes = useMemo(() =>
    shipments.slice(0, 30).map(s => ({
      start: s.origin.coords,
      end:   s.destination.coords,
      status: s.status,
    })),
  [shipments]);

  /* ── selected port id (origin of selected shipment) ── */
  const selectedPortId = selected ? selected.origin.id : null;

  /* ── port clicked on globe → find first shipment from that port ── */
  const handlePortClick = (portId) => {
    const match = shipments.find(s => s.origin.id === portId || s.destination.id === portId);
    if (match) {
      setSelectedId(match.id);
      setTelemetryOpen(false);
    }
  };

  /* ── stats ── */
  const critCount = shipments.filter(s => s.status === 'CRITICAL').length;
  const warnCount = shipments.filter(s => s.status === 'WARNING').length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '340px 1fr', overflow: 'hidden' }}>

      {/* ═══════════ Left: Shipment List ═══════════ */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'var(--bg-panel)', minHeight: 0, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '14px' }}>NODE_INVENTORY</h2>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{filtered.length} nodes</span>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, background: 'var(--critical-bg)', border: '1px solid rgba(255,71,87,0.15)', borderRadius: '4px', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--critical-muted)' }}>{critCount}</div>
              <div className="mono" style={{ fontSize: '8px', color: 'var(--critical-muted)', letterSpacing: '0.08em' }}>CRITICAL</div>
            </div>
            <div style={{ flex: 1, background: 'var(--warning-bg)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '4px', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--warning-muted)' }}>{warnCount}</div>
              <div className="mono" style={{ fontSize: '8px', color: 'var(--warning-muted)', letterSpacing: '0.08em' }}>WARNING</div>
            </div>
            <div style={{ flex: 1, background: 'var(--stable-bg)', border: '1px solid rgba(62,229,160,0.15)', borderRadius: '4px', padding: '6px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--stable-muted)' }}>{shipments.length - critCount - warnCount}</div>
              <div className="mono" style={{ fontSize: '8px', color: 'var(--stable-muted)', letterSpacing: '0.08em' }}>STABLE</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input className="input" value={localSearch} onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search shipments, carriers…" style={{ paddingLeft: '32px' }} />
          </div>

          {/* Status filters */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'CRITICAL', 'WARNING', 'STABLE'].map(f => (
              <button key={f} className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : ''}`}
                style={{ flex: 1, justifyContent: 'center', fontSize: '9px', padding: '4px' }}
                onClick={() => setStatusFilter(f)}>{f}</button>
            ))}
          </div>
        </div>

        {/* Shipment rows */}
        <div className="scroll-area" style={{ flex: 1 }}>
          {filtered.map(s => {
            const risk = Math.round(s.riskScore * 100);
            const riskColor = risk > 75 ? 'var(--critical-muted)' : risk > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)';
            return (
              <div key={s.id}
                onClick={() => { setSelectedId(s.id); setTelemetryOpen(false); }}
                style={{
                  padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: selectedId === s.id ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: selectedId === s.id ? '2px solid var(--accent-1)' : '2px solid transparent',
                  transition: 'all 0.1s',
                }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: '12px' }}>{s.id}</span>
                  <div className={`status-pill status-${s.status}`} style={{ fontSize: '9px' }}>{s.status}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {s.origin.name} → {s.destination.name}
                </div>
                <div className="risk-bar-wrap">
                  <div className="risk-bar-fill" style={{ width: `${s.progress * 100}%`, background: riskColor }} />
                </div>
                <div className="flex-between" style={{ marginTop: '4px' }}>
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{Math.round(s.progress * 100)}% complete</span>
                  <span className="mono" style={{ fontSize: '9px', color: riskColor }}>DRS:{risk}</span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex-center" style={{ height: '200px', color: 'var(--text-dim)' }}>
              <div className="mono" style={{ fontSize: '11px' }}>NO MATCHING SHIPMENTS</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ Right: Globe + Detail Panel ═══════════ */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--bg-surface)', minHeight: 0 }}>

        {/* Globe */}
        <RotatingGlobe
          ports={ports}
          routes={globeRoutes}
          selectedId={selectedPortId}
          onPortClick={handlePortClick}
        />

        {/* Port legend overlay */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 8,
          background: 'rgba(255,255,255,0.88)', border: '1px solid var(--border-subtle)',
          borderRadius: '4px', padding: '8px 12px', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', gap: '4px',
          boxShadow: 'var(--shadow-tight)',
        }}>
          {[
            ['Nominal', '#3EE5A0'],
            ['Elevated', '#FF8C00'],
            ['Critical', '#FF4757'],
          ].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 4px ${color}` }} />
              <span className="mono" style={{ fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>{label.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* ── Shipment Detail Slide-in ── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ x: 360, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 360, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'absolute', top: 12, right: 12, bottom: 12, width: '300px',
                background: 'rgba(255,255,255,0.94)', border: '1px solid var(--border-subtle)',
                borderRadius: '8px', padding: '20px',
                display: 'flex', flexDirection: 'column', gap: '14px',
                overflowY: 'auto', zIndex: 12,
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--shadow-soft)',
              }}>

              {/* Header */}
              <div className="flex-between">
                <h3 style={{ fontSize: '16px' }}>{selected.id}</h3>
                <button className="btn btn-icon" onClick={() => setSelectedId(null)}
                  style={{ background: 'transparent', border: 'none' }}>
                  <X size={15} />
                </button>
              </div>

              <div className={`status-pill status-${selected.status}`} style={{ alignSelf: 'flex-start' }}>{selected.status}</div>

              <RiskGauge score={selected.riskScore} />

              {/* Route visual */}
              <div style={{
                background: 'var(--bg-accent)', borderRadius: '6px', padding: '12px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-1)', margin: '0 auto 4px' }} />
                  <div className="mono" style={{ fontSize: '10px', fontWeight: 700 }}>{selected.origin.id}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{selected.origin.name}</div>
                </div>
                <div style={{ flex: 1, height: '2px', background: 'var(--border-subtle)', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', top: '-3px',
                    left: `${selected.progress * 100}%`,
                    width: 8, height: 8, borderRadius: '50%',
                    background: selected.status === 'CRITICAL' ? 'var(--critical-muted)' : 'var(--accent-1)',
                    boxShadow: `0 0 6px ${selected.status === 'CRITICAL' ? 'var(--critical-muted)' : 'var(--accent-1)'}`,
                    transition: 'left 0.5s ease',
                  }} />
                  <Navigation size={9} style={{
                    position: 'absolute', top: '-12px',
                    left: `calc(${selected.progress * 100}% - 4px)`,
                    color: selected.status === 'CRITICAL' ? 'var(--critical-muted)' : 'var(--accent-1)',
                    transition: 'left 0.5s ease',
                  }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-2)', margin: '0 auto 4px' }} />
                  <div className="mono" style={{ fontSize: '10px', fontWeight: 700 }}>{selected.destination.id}</div>
                  <div style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{selected.destination.name}</div>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  ['CARRIER',    selected.carrier],
                  ['CARGO TYPE', selected.cargoType],
                  ['VALUE',      selected.value],
                  ['ETA',        selected.etaFormatted],
                  ['CONTAINERS', selected.containers],
                  ['WEIGHT',     selected.weight],
                  ['PROGRESS',   `${Math.round(selected.progress * 100)}%`],
                ].map(([k, v]) => (
                  <div key={k} className="flex-between" style={{ fontSize: '12px' }}>
                    <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                <button className="btn btn-primary" onClick={() => openChat(selected.id)}
                  style={{ justifyContent: 'center' }}>
                  <MessageSquare size={14} /> Message Carrier
                </button>
                <button className="btn" onClick={() => setTelemetryOpen(v => !v)}
                  style={{ justifyContent: 'center' }}>
                  <Eye size={14} /> {telemetryOpen ? 'Hide Telemetry' : 'View Telemetry'}
                </button>
              </div>

              {/* Telemetry expandable */}
              <AnimatePresence>
                {telemetryOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    style={{
                      background: 'var(--bg-accent)', borderRadius: '6px', padding: '14px',
                      display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden',
                    }}>
                    <div style={{ fontWeight: 700, fontSize: '11px', marginBottom: '2px' }}>TELEMETRY SNAPSHOT</div>
                    {[
                      ['Origin Coord',    `${selected.origin.coords.lat.toFixed(1)}°, ${selected.origin.coords.lng.toFixed(1)}°`],
                      ['Dest Coord',      `${selected.destination.coords.lat.toFixed(1)}°, ${selected.destination.coords.lng.toFixed(1)}°`],
                      ['Path Samples',    selected.path?.length || 0],
                      ['Risk Class',      selected.riskScore > 0.75 ? 'CRITICAL' : selected.riskScore > 0.4 ? 'ELEVATED' : 'NOMINAL'],
                      ['DRS (raw)',       (selected.riskScore * 100).toFixed(1)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex-between" style={{ fontSize: '11px' }}>
                        <span className="mono" style={{ color: 'var(--text-dim)', fontSize: '9px' }}>{l}</span>
                        <span style={{ fontWeight: 600, fontSize: '11px' }}>{v}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
