import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { WorldMap } from '../components/ui/WorldMap';
import { ShieldAlert, TrendingUp, Clock, Box, Globe2 } from 'lucide-react';

const StatCard = ({ label, value, trend, icon: Icon }) => (
  <div className="panel" style={{ padding: '20px' }}>
    <div className="flex-between" style={{ marginBottom: '8px' }}>
      <Icon size={18} color="var(--text-dim)" />
      <span className="mono" style={{ color: trend > 0 ? 'var(--critical-muted)' : 'var(--stable-muted)', fontSize: '11px' }}>{trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

export default function LandingPage() {
  const { shipments, alerts } = useAppStore();
  const mapDots = shipments.filter(s => s.status !== 'STABLE').map(s => ({ start: s.origin.coords, end: s.destination.coords }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="ACTIVE_NODES" value={shipments.length} trend={2.4} icon={Box} />
        <StatCard label="BREACH_RISK" value={shipments.filter(s => s.status === 'CRITICAL').length} trend={12} icon={ShieldAlert} />
        <StatCard label="NETWORK_LATENCY" value="42ms" trend={-4} icon={Clock} />
        <StatCard label="EFFICIENCY" value="0.94" trend={0.5} icon={TrendingUp} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', flex: 1 }}>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>GLOBAL_OPERATIONAL_NETWORK</span>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>REALTIME_VIEW</span>
          </div>
          <div style={{ flex: 1 }}><WorldMap dots={mapDots} /></div>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontWeight: 700, fontSize: '13px' }}>SIGNAL_FEED</span>
          </div>
          <div className="scroll-area" style={{ flex: 1 }}>
            {alerts.map(a => (
              <div key={a.id} style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <div className={`status-pill status-${a.severity.toLowerCase()}`}>{a.severity}</div>
                  <span className="mono" style={{ fontSize: '9px' }}>{a.timestamp.split('T')[1].split('.')[0]}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>{a.shipmentId}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
