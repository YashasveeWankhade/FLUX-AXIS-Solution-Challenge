import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { AlertOctagon, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function RiskPage() {
  const { alerts, resolveAlert } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const selected = alerts.find(a => a.id === selectedId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'grid', gridTemplateColumns: '400px 1fr' }}>
      <div className="panel" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '15px' }}>SIGNAL_DISPATCH</h2>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          <AnimatePresence>
            {alerts.map(a => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => setSelectedId(a.id)} style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: selectedId === a.id ? 'white' : 'transparent', borderLeft: selectedId === a.id ? '4px solid var(--critical-muted)' : '4px solid transparent' }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <div className={`status-pill status-${a.severity.toLowerCase()}`}>{a.severity}</div>
                  <span className="mono" style={{ fontSize: '10px' }}>{a.timestamp.split('T')[1].split('.')[0]}</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{a.shipmentId}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{a.message}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ padding: '40px' }}>
        {selected ? (
          <div style={{ maxWidth: '800px' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>{selected.shipmentId}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>{selected.message}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '13px', marginBottom: '16px' }}>CAUSAL_ANALYSIS</h3>
                <div className="mono" style={{ fontSize: '12px' }}>PROBABILITY: 94.2%</div>
              </div>
              <div className="panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '13px', marginBottom: '16px' }}>EXPOSURE</h3>
                <div className="mono" style={{ fontSize: '20px', fontWeight: 800 }}>$12,400.00</div>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '32px' }} onClick={() => { resolveAlert(selected.id); setSelectedId(null); }}>RESOLVE_SIGNAL</button>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            <div className="mono">SELECT_SIGNAL_FOR_TRIAGE</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
