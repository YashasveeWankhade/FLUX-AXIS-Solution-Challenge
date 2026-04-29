import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { BarChart4, TrendingUp, TrendingDown, Package, Clock, DollarSign, Globe2, RefreshCw } from 'lucide-react';

function BarChartSimple({ data, color, height = 120 }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.6, delay: i * 0.04 }}
            style={{ width: '100%', background: color, borderRadius: '2px 2px 0 0', minHeight: 2 }} />
          <div className="mono" style={{ fontSize: '8px', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function LineChartSimple({ data, color, height = 80 }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100 / (data.length - 1);
  const pts = data.map((v, i) => `${i * w},${height - ((v - min) / range) * (height - 8)}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
      <polygon points={`${pts} 100,${height} 0,${height}`} fill={color} opacity={0.08} />
    </svg>
  );
}

const LANE_PERF = [
  { label: 'SHA to LAX', value: 78 }, { label: 'SHA to RTM', value: 91 }, { label: 'SIN to DXB', value: 88 },
  { label: 'DXB to RTM', value: 67 }, { label: 'NYC to RTM', value: 94 }, { label: 'TYO to SHA', value: 96 },
  { label: 'LAX to SYD', value: 82 }, { label: 'SYD to TYO', value: 89 },
];

const THROUGHPUT_DATA = [38, 42, 39, 45, 48, 44, 51, 47, 53, 49, 56, 52];
const DELAY_DATA = [14, 12, 16, 11, 13, 15, 10, 12, 9, 11, 8, 10];
const COST_DATA = [2.1, 2.3, 2.0, 2.4, 2.2, 2.5, 2.3, 2.6, 2.4, 2.7, 2.5, 2.8];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsPage() {
  const { shipments, carriers } = useAppStore();
  const [timeframe, setTimeframe] = useState('30D');
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const totalValue = useMemo(() =>
    shipments.reduce((a, s) => a + parseFloat(s.value.replace(/[$M]/g, '') || 0), 0).toFixed(1),
    [shipments]);

  const avgOnTime = useMemo(() =>
    carriers.length ? Math.round(carriers.reduce((a, c) => a + c.onTime, 0) / carriers.length) : 0,
    [carriers]);

  const monthlyData = MONTHS.map((label, i) => ({
    label: label.slice(0, 1),
    value: (THROUGHPUT_DATA[i] || 0) + ((refreshTick + i) % 3),
  }));

  const refreshAnalytics = () => {
    setRefreshTick(tick => tick + 1);
    setLastRefreshed(new Date());
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>MACRO_INSIGHTS</div>
          <h1 style={{ fontSize: '22px', marginTop: '2px' }}>Analytics Hub</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {['7D', '30D', '90D', '1Y'].map(t => (
            <button key={t} className={`btn btn-sm ${timeframe === t ? 'btn-primary' : ''}`} onClick={() => setTimeframe(t)}>{t}</button>
          ))}
          <button className="btn btn-sm" onClick={refreshAnalytics} title={`Last refreshed ${lastRefreshed.toLocaleTimeString()}`}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          {[
            { icon: Package, label: 'THROUGHPUT', value: '1.4M', sub: 'TEU / month', color: 'var(--accent-1)', trend: '+4.2%', up: true },
            { icon: DollarSign, label: 'TOTAL VALUE IN TRANSIT', value: `$${totalValue}M`, sub: 'across all lanes', color: 'var(--accent-3)', trend: '+2.1%', up: true },
            { icon: Clock, label: 'AVG DELAY', value: '11.2h', sub: 'vs 14.2h last period', color: 'var(--warning-muted)', trend: '-21%', up: false },
            { icon: TrendingUp, label: 'SLA COMPLIANCE', value: `${avgOnTime}%`, sub: 'carrier avg', color: 'var(--stable-muted)', trend: '+1.4%', up: false },
          ].map(({ icon: Icon, label, value, sub, color, trend, up }) => (
            <div key={label} className="metric-card">
              <div className="flex-between">
                <Icon size={16} style={{ color }} />
                <span className="mono" style={{ fontSize: '10px', color: up ? 'var(--critical-muted)' : 'var(--stable-muted)' }}>
                  {up ? 'up' : 'down'} {trend}
                </span>
              </div>
              <div className="metric-value" style={{ color, fontSize: '24px' }}>{value}</div>
              <div className="metric-label">{label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
          {/* Throughput chart */}
          <div className="panel-2" style={{ padding: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>THROUGHPUT TREND (K TEU)</div>
              <span className="badge badge-green">up 47% YoY</span>
            </div>
            <BarChartSimple data={monthlyData} color="var(--accent-1)" height={140} />
          </div>

          {/* Delay trend */}
          <div className="panel-2" style={{ padding: '20px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>AVG DELAY (hours)</div>
            <LineChartSimple data={DELAY_DATA} color="var(--warning-muted)" height={140} />
            <div className="flex-between" style={{ marginTop: '8px' }}>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>12-MONTH ROLLING</span>
              <span className="mono" style={{ fontSize: '10px', color: 'var(--stable-muted)' }}>down 21% vs prior</span>
            </div>
          </div>
        </div>

        {/* Lane performance */}
        <div className="panel-2" style={{ padding: '20px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px' }}>LANE_PERFORMANCE_MATRIX</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LANE_PERF.map(lane => (
              <div key={lane.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 50px', alignItems: 'center', gap: '12px' }}>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{lane.label}</div>
                <div className="risk-bar-wrap">
                  <motion.div className="risk-bar-fill" initial={{ width: 0 }} animate={{ width: `${lane.value}%` }}
                    transition={{ duration: 0.7 }}
                    style={{ background: lane.value >= 90 ? 'var(--stable-muted)' : lane.value >= 80 ? 'var(--warning-muted)' : 'var(--critical-muted)' }} />
                </div>
                <div className="mono" style={{ fontSize: '11px', fontWeight: 700, color: lane.value >= 90 ? 'var(--stable-muted)' : lane.value >= 80 ? 'var(--warning-muted)' : 'var(--critical-muted)', textAlign: 'right' }}>{lane.value}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost trend */}
        <div className="panel-2" style={{ padding: '20px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>COST PER LANE ($/TEU avg)</div>
            <span className="badge badge-orange">up 8.4% vs baseline</span>
          </div>
          <LineChartSimple data={COST_DATA} color="var(--accent-2)" height={100} />
        </div>
      </div>
    </motion.div>
  );
}
