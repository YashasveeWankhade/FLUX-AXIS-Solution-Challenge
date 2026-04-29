import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { WorldMap } from '../components/ui/WorldMap';
import {
  ShieldAlert, TrendingUp, Clock, Box, Globe2,
  ArrowUpRight, ArrowDownRight, Zap, RefreshCw,
  AlertCircle, CheckCircle2, Activity
} from 'lucide-react';

// -- Sparkline ---------------------------------------------------------------
function Sparkline({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className="sparkline">
      {data.map((v, i) => (
        <div key={i} className="sparkline-bar" style={{ height: `${(v / max) * 100}%`, background: color, opacity: 0.6 + (i / data.length) * 0.4 }} />
      ))}
    </div>
  );
}

// -- Stat Card ---------------------------------------------------------------
function StatCard({ label, value, trend, icon: Icon, color, sparkData }) {
  const up = trend > 0;
  return (
    <motion.div className="metric-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ cursor: 'default' }}>
      <div className="flex-between">
        <Icon size={18} style={{ color: color || 'var(--text-dim)' }} />
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: up ? 'var(--critical-muted)' : 'var(--stable-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(trend)}%
        </span>
      </div>
      <div className="metric-value" style={{ color: color || 'var(--text-main)' }}>{value}</div>
      <div className="metric-label">{label}</div>
      {sparkData && <Sparkline data={sparkData} color={color || 'var(--accent-1)'} />}
    </motion.div>
  );
}

// -- Mini Alert Row -----------------------------------------------------------
function AlertRow({ alert }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div className="flex-between">
        <div className={`status-pill status-${alert.severity.toLowerCase()}`}>{alert.severity}</div>
        <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div style={{ fontSize: '12px', fontWeight: 600 }}>{alert.shipmentId}</div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{alert.message}</div>
    </div>
  );
}

// -- Shipment Progress Row ----------------------------------------------------
function ShipmentRow({ s }) {
  const risk = Math.round(s.riskScore * 100);
  const riskColor = risk > 75 ? 'var(--critical-muted)' : risk > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)';
  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '12px' }}>
      <div>
        <div className="mono" style={{ fontWeight: 700, fontSize: '12px' }}>{s.id}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.origin.name}  to  {s.destination.name}</div>
      </div>
      <div style={{ width: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{Math.round(s.progress * 100)}%</span>
          <span className="mono" style={{ fontSize: '9px', color: riskColor }}>DRS:{risk}</span>
        </div>
        <div className="risk-bar-wrap">
          <div className="risk-bar-fill" style={{ width: `${s.progress * 100}%`, background: riskColor }} />
        </div>
      </div>
      <div className={`status-pill status-${s.status}`} style={{ fontSize: '9px' }}>{s.status}</div>
    </div>
  );
}

// -- Main Page ----------------------------------------------------------------
export default function LandingPage() {
  const { shipments, alerts, lastSync, events } = useAppStore();
  const [now, setNow] = useState(new Date());
  const [tab, setTab] = useState('critical');

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const criticalShipments = shipments.filter(s => s.status === 'CRITICAL');
  const warnShipments = shipments.filter(s => s.status === 'WARNING');
  const stableShipments = shipments.filter(s => s.status === 'STABLE');
  const mapDots = shipments.slice(0, 20).map(s => ({ start: s.origin.coords, end: s.destination.coords }));

  const activeEvents = (events || []).filter(e => e.status === 'ACTIVE');

  const displayShipments = tab === 'critical' ? criticalShipments : tab === 'warning' ? warnShipments : stableShipments;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '24px', gap: '20px' }}>

      {/* Header bar */}
      <div className="flex-between" style={{ flexShrink: 0 }}>
        <div>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>COMMAND OVERVIEW</div>
          <h1 style={{ fontSize: '22px', marginTop: '2px' }}>Global Operations Center</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
            SYNC: {lastSync ? new Date(lastSync).toLocaleTimeString() : ' - '}
          </div>
          {activeEvents.length > 0 && (
            <div className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Zap size={9} /> {activeEvents.length} ACTIVE EVENTS
            </div>
          )}
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', flexShrink: 0 }}>
        <StatCard label="ACTIVE SHIPMENTS" value={shipments.length} trend={2.4} icon={Box} color="var(--accent-1)"
          sparkData={[28, 35, 31, 40, 38, 42, 45, 40, 48, 52]} />
        <StatCard label="CRITICAL ALERTS" value={criticalShipments.length} trend={criticalShipments.length > 3 ? 12 : -8} icon={ShieldAlert} color="var(--critical-muted)"
          sparkData={[4, 6, 3, 8, 5, 7, 9, 6, criticalShipments.length]} />
        <StatCard label="SLA COMPLIANCE" value="97.2%" trend={0.4} icon={CheckCircle2} color="var(--stable-muted)"
          sparkData={[95, 96, 97, 96.5, 97, 97.2, 97.1, 97.4, 97.2]} />
        <StatCard label="AVG RISK SCORE" value={`${Math.round(shipments.reduce((a, s) => a + s.riskScore, 0) / Math.max(1, shipments.length) * 100)}%`} trend={-3.1} icon={Activity} color="var(--accent-3)"
          sparkData={[22, 25, 19, 28, 24, 20, 18, 22, 21]} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, minHeight: '360px' }}>
        {/* World map */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>GLOBAL OPERATIONAL NETWORK</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--stable-muted)', boxShadow: '0 0 6px var(--stable-muted)' }} />
              <span className="mono" style={{ fontSize: '10px', color: 'var(--stable-muted)' }}>LIVE</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <WorldMap dots={mapDots} lineColor="var(--accent-1)" />
          </div>
        </div>

        {/* Alert feed */}
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '12px' }}>SIGNAL FEED</span>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{alerts.length} OPEN</span>
          </div>
          <div className="scroll-area" style={{ flex: 1 }}>
            {alerts.slice(0, 15).map(a => <AlertRow key={a.id} alert={a} />)}
            {alerts.length === 0 && (
              <div className="flex-center" style={{ height: '100%', color: 'var(--text-dim)' }}>
                <div className="mono" style={{ fontSize: '11px' }}>NO ACTIVE SIGNALS</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shipment status table */}
      <div className="panel" style={{ flexShrink: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '12px' }}>SHIPMENT STATUS MATRIX</span>
          <div className="tab-bar" style={{ border: 'none' }}>
            {[['critical', `CRITICAL (${criticalShipments.length})`], ['warning', `WARNING (${warnShipments.length})`], ['stable', `STABLE (${stableShipments.length})`]].map(([t, l]) => (
              <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
          {displayShipments.slice(0, 15).map(s => <ShipmentRow key={s.id} s={s} />)}
          {displayShipments.length === 0 && (
            <div className="flex-center" style={{ height: '80px', color: 'var(--text-dim)' }}>
              <div className="mono" style={{ fontSize: '11px' }}>NO {tab.toUpperCase()} SHIPMENTS</div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
