import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Puzzle, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Plus, Activity, Clock } from 'lucide-react';

const TYPE_COLORS = {
  MARITIME: 'var(--accent-3)', WEATHER: 'var(--accent-2)', CUSTOMS: 'var(--warning-muted)',
  ERP: 'var(--accent-1)', CARRIER: 'var(--stable-muted)', PORT: 'var(--accent-3)',
  AI: 'var(--accent-2)', FINANCE: 'var(--text-dim)', CUSTOM: 'var(--accent-1)',
};

function StatusIcon({ status }) {
  if (status === 'ACTIVE') return <CheckCircle2 size={14} color="var(--stable-muted)" />;
  if (status === 'DEGRADED') return <AlertTriangle size={14} color="var(--warning-muted)" />;
  return <XCircle size={14} color="var(--critical-muted)" />;
}

function LatencyBar({ latency }) {
  const max = 500;
  const color = latency === 0 ? 'var(--text-dim)' : latency < 100 ? 'var(--stable-muted)' : latency < 250 ? 'var(--warning-muted)' : 'var(--critical-muted)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '4px', background: 'var(--border-subtle)', borderRadius: '2px' }}>
        <div style={{ height: '100%', width: `${Math.min(100, (latency / max) * 100)}%`, background: color, borderRadius: '2px', transition: 'width 0.5s' }} />
      </div>
      <span className="mono" style={{ fontSize: '10px', color, minWidth: '50px', textAlign: 'right' }}>{latency === 0 ? ' - ' : `${latency}ms`}</span>
    </div>
  );
}

export default function IntegrationsPage() {
  const { integrations, addIntegration, enableIntegration } = useAppStore();
  const [selected, setSelected] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [logsOpen, setLogsOpen] = useState({});

  const activeCount = integrations.filter(i => i.status === 'ACTIVE').length;
  const degradedCount = integrations.filter(i => i.status === 'DEGRADED').length;
  const inactiveCount = integrations.filter(i => i.status === 'INACTIVE').length;

  const runTest = (id) => {
    setTestResults(r => ({ ...r, [id]: 'TESTING' }));
    setTimeout(() => {
      const intg = integrations.find(i => i.id === id);
      setTestResults(r => ({ ...r, [id]: intg?.status === 'INACTIVE' ? 'FAILED' : 'PASSED' }));
    }, 1500);
  };

  const handleAddIntegration = () => {
    const id = addIntegration();
    setSelected(id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
        <div className="flex-between">
          <div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>INTEGRATION_HUB</div>
            <h1 style={{ fontSize: '22px', marginTop: '2px' }}>System Integrations</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="badge badge-green">{activeCount} ACTIVE</div>
            {degradedCount > 0 && <div className="badge badge-orange">{degradedCount} DEGRADED</div>}
            {inactiveCount > 0 && <div className="badge" style={{ background: 'var(--bg-accent)', color: 'var(--text-dim)' }}>{inactiveCount} INACTIVE</div>}
            <button className="btn" onClick={handleAddIntegration}><Plus size={14} /> Add Integration</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {integrations.map(intg => {
          const typeColor = TYPE_COLORS[intg.type] || 'var(--text-dim)';
          const testResult = testResults[intg.id];
          return (
            <motion.div key={intg.id} layout
              className="panel-2"
              style={{ padding: '20px', cursor: 'pointer', borderLeft: `3px solid ${intg.status === 'ACTIVE' ? typeColor : intg.status === 'DEGRADED' ? 'var(--warning-muted)' : 'var(--border-subtle)'}` }}
              onClick={() => setSelected(selected === intg.id ? null : intg.id)}>
              <div className="flex-between" style={{ marginBottom: selected === intg.id ? '16px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <StatusIcon status={intg.status} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{intg.name}</div>
                    <div className="mono" style={{ fontSize: '10px', color: typeColor, marginTop: '2px' }}>{intg.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>LAST PING</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-main)' }}>{intg.lastPing}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>RECORDS</div>
                    <div className="mono" style={{ fontSize: '11px', color: 'var(--text-main)' }}>{intg.records}</div>
                  </div>
                  <div style={{ width: '120px' }}>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '3px' }}>LATENCY</div>
                    <LatencyBar latency={intg.latency} />
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {selected === intg.id && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {[
                      { label: 'UPTIME', value: `${intg.uptime}%`, color: intg.uptime > 99 ? 'var(--stable-muted)' : 'var(--warning-muted)' },
                      { label: 'LATENCY', value: intg.latency === 0 ? ' - ' : `${intg.latency}ms`, color: intg.latency < 100 ? 'var(--stable-muted)' : 'var(--warning-muted)' },
                      { label: 'STATUS', value: intg.status, color: intg.status === 'ACTIVE' ? 'var(--stable-muted)' : intg.status === 'DEGRADED' ? 'var(--warning-muted)' : 'var(--text-dim)' },
                      { label: 'RECORDS', value: intg.records, color: 'var(--accent-1)' },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '3px' }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color }}>{value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button className="btn btn-sm" disabled={testResult === 'TESTING'} onClick={e => { e.stopPropagation(); runTest(intg.id); }}>
                      <RefreshCw size={13} /> Run Health Test
                    </button>
                    <button className="btn btn-sm" onClick={e => { e.stopPropagation(); setLogsOpen(state => ({ ...state, [intg.id]: !state[intg.id] })); }}>
                      {logsOpen[intg.id] ? 'Hide Logs' : 'View Logs'}
                    </button>
                    {intg.status === 'INACTIVE' && (
                      <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); enableIntegration(intg.id); }}>
                        Enable Integration
                      </button>
                    )}
                    {testResult && (
                      <span className={`badge ${testResult === 'PASSED' ? 'badge-green' : testResult === 'TESTING' ? 'badge-blue' : 'badge-red'}`}>
                        {testResult === 'TESTING' ? ' TESTING...' : testResult === 'PASSED' ? 'OK PASSED' : 'X FAILED'}
                      </span>
                    )}
                  </div>
                  {logsOpen[intg.id] && (
                    <div className="panel" style={{ padding: '12px', background: 'var(--bg-elevated)' }}>
                      {[
                        `${new Date().toLocaleTimeString()} handshake ${intg.status.toLowerCase()}`,
                        `${intg.records} records indexed`,
                        `latency ${intg.latency || 'pending'}ms`,
                      ].map(line => (
                        <div key={line} className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '3px 0' }}>{line}</div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
