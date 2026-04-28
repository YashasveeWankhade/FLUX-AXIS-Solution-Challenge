import React from 'react';
import { useAppStore } from '../store/useAppStore';

export default function AnalyticsPage() {
  const { shipments } = useAppStore();

  return (
    <div style={{ height: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '40px', background: 'white', overflowY: 'auto' }}>
      <header>
        <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MACRO_INSIGHTS</div>
        <h1 style={{ fontSize: '32px' }}>Analytics Hub</h1>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { label: 'Throughput', value: '1.4M Units' },
          { label: 'Cost/Node', value: '$2,420' },
          { label: 'SLA Status', value: '96.4%' },
          { label: 'Avg Delay', value: '14.2h' }
        ].map((m, i) => (
          <div key={i} className="panel" style={{ padding: '24px' }}>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '8px' }}>{m.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="panel" style={{ flex: 1, minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ color: 'var(--text-dim)' }}>PERFORMANCE_MATRIX_ACTIVE</div>
      </div>
    </div>
  );
}
