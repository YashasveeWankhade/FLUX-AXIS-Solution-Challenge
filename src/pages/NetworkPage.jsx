import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { WorldMap } from '../components/ui/WorldMap';
import { X, Search, Filter } from 'lucide-react';

export default function NetworkPage() {
  const { shipments } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const selected = shipments.find(s => s.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ height: '100%', display: 'grid', gridTemplateColumns: '360px 1fr' }}>
      <div className="panel" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px', marginBottom: '16px' }}>NODE_INVENTORY</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} />
              <input placeholder="Search..." style={{ width: '100%', padding: '8px 8px 8px 32px', border: '1px solid var(--border-subtle)', fontSize: '12px' }} />
            </div>
            <button className="btn" style={{ padding: '8px' }}><Filter size={14} /></button>
          </div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {shipments.map(s => (
            <div key={s.id} onClick={() => setSelectedId(s.id)} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: selectedId === s.id ? 'var(--bg-accent)' : 'transparent' }}>
              <div className="flex-between">
                <span className="mono" style={{ fontWeight: 700 }}>{s.id}</span>
                <div className={`status-pill status-${s.status.toLowerCase()}`}>{s.status}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.origin.id} → {s.destination.id}</div>
              <div style={{ height: '2px', background: 'var(--border-subtle)', marginTop: '8px' }}>
                <div style={{ height: '100%', width: `${s.progress * 100}%`, background: 'black' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <WorldMap dots={shipments.map(s => ({ start: s.origin.coords, end: s.destination.coords }))} />
        <AnimatePresence>
          {selected && (
            <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} className="panel" style={{ position: 'absolute', top: 20, right: 20, bottom: 20, width: '320px', padding: '24px' }}>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px' }}>{selected.id}</h3>
                <X size={20} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(null)} />
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div className="panel" style={{ padding: '12px', background: '#F8F9FA' }}>
                  <div className="mono" style={{ fontSize: '10px' }}>RISK_LEVEL</div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: 700 }}>{(selected.riskScore * 100).toFixed(0)}%</div>
                </div>
                <div className="mono" style={{ fontSize: '11px' }}>
                  <div className="flex-between"><span>CARRIER</span><span>{selected.carrier}</span></div>
                  <div className="flex-between"><span>ORIGIN</span><span>{selected.origin.name}</span></div>
                  <div className="flex-between"><span>DEST</span><span>{selected.destination.name}</span></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '20px' }}>VIEW FULL TELEMETRY</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
