import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Star, TrendingUp, TrendingDown, Package, Clock, MessageSquare, Plus, Search } from 'lucide-react';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={11} fill={i <= Math.round(rating) ? 'var(--warning-muted)' : 'transparent'} color="var(--warning-muted)" />
      ))}
    </div>
  );
}

function CarrierRow({ carrier, isSelected, onClick }) {
  const onTimeColor = carrier.onTime >= 95 ? 'var(--stable-muted)' : carrier.onTime >= 88 ? 'var(--warning-muted)' : 'var(--critical-muted)';
  return (
    <div onClick={onClick}
      style={{
        padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
        cursor: 'pointer', background: isSelected ? 'var(--bg-accent)' : 'transparent',
        borderLeft: isSelected ? '2px solid var(--accent-1)' : '2px solid transparent',
        transition: 'all 0.1s',
      }}>
      <div className="flex-between" style={{ marginBottom: '4px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px' }}>{carrier.name}</span>
        <span className={`badge ${carrier.tier === 'PREFERRED' ? 'badge-green' : 'badge-blue'}`}>{carrier.tier}</span>
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{carrier.region}</div>
      <div className="flex-between">
        <span className="mono" style={{ fontSize: '10px', color: onTimeColor }}>ON-TIME: {carrier.onTime}%</span>
        <StarRating rating={carrier.rating} />
      </div>
    </div>
  );
}

export default function CarriersPage() {
  const { carriers, openChat, addNotification } = useAppStore();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('onTime');
  const [scheduled, setScheduled] = useState({});
  const [contractOpen, setContractOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...carriers]
      .filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [carriers, search, sortBy]);

  const selected = carriers.find(c => c.id === selectedId);

  const scheduleShipment = () => {
    if (!selected) return;
    setScheduled(state => ({ ...state, [selected.id]: `Pickup window reserved for ${new Date(Date.now() + 86400000).toLocaleDateString()}` }));
    addNotification(`Shipment scheduled with ${selected.name}`, 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '340px 1fr' }}>

      {/* Left: List */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between">
            <h2 style={{ fontSize: '14px' }}>CARRIER_REGISTRY</h2>
            <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{carriers.length} carriers</span>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search carriers..." style={{ paddingLeft: '32px' }} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[['onTime', 'ON-TIME'], ['rating', 'RATING'], ['activeShipments', 'ACTIVE']].map(([k, l]) => (
              <button key={k} className={`btn btn-sm ${sortBy === k ? 'btn-primary' : ''}`}
                style={{ flex: 1, justifyContent: 'center', fontSize: '9px' }}
                onClick={() => setSortBy(k)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {filtered.map(c => (
            <CarrierRow key={c.id} carrier={c} isSelected={selectedId === c.id} onClick={() => setSelectedId(c.id)} />
          ))}
        </div>
      </div>

      {/* Right: Detail */}
      <div style={{ padding: '28px', overflowY: 'auto' }}>
        {selected ? (
          <motion.div key={selected.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: '6px' }}>CARRIER_PROFILE</div>
              <div className="flex-between">
                <div>
                  <h1 style={{ fontSize: '26px' }}>{selected.name}</h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                    <StarRating rating={selected.rating} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selected.rating}/5.0</span>
                    <span className={`badge ${selected.tier === 'PREFERRED' ? 'badge-green' : 'badge-blue'}`}>{selected.tier}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { icon: Clock, label: 'ON-TIME RATE', value: `${selected.onTime}%`, color: selected.onTime >= 95 ? 'var(--stable-muted)' : 'var(--warning-muted)' },
                { icon: TrendingUp, label: 'FLEET SIZE', value: selected.fleet, color: 'var(--accent-3)' },
                { icon: Package, label: 'ACTIVE LOADS', value: selected.activeShipments, color: 'var(--accent-1)' },
                { icon: TrendingDown, label: 'AVG DELAY', value: `${selected.avgDelay}h`, color: selected.avgDelay > 15 ? 'var(--critical-muted)' : 'var(--warning-muted)' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="metric-card">
                  <Icon size={16} style={{ color }} />
                  <div className="metric-value" style={{ color, fontSize: '22px' }}>{value}</div>
                  <div className="metric-label">{label}</div>
                </div>
              ))}
            </div>

            {/* Performance bars */}
            <div className="panel-2" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>PERFORMANCE BENCHMARKS</div>
              {[
                ['On-Time Delivery', selected.onTime, 100, selected.onTime >= 95 ? 'var(--stable-muted)' : 'var(--warning-muted)'],
                ['Documentation Accuracy', Math.round(85 + selected.rating * 2), 100, 'var(--accent-1)'],
                ['Claims Rate (inv)', Math.round(100 - selected.avgDelay * 1.5), 100, 'var(--accent-3)'],
                ['SLA Compliance', Math.round(selected.onTime * 0.98), 100, 'var(--accent-2)'],
              ].map(([label, value, max, color]) => (
                <div key={label}>
                  <div className="flex-between" style={{ marginBottom: '4px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{label}</span>
                    <span style={{ fontWeight: 700, fontSize: '12px', color }}>{value}%</span>
                  </div>
                  <div className="risk-bar-wrap">
                    <motion.div className="risk-bar-fill" initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
                      transition={{ duration: 0.8 }} style={{ background: color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Region + Contract */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[['REGION', selected.region], ['CONTRACT TYPE', 'Preferred Partner'], ['ANNUAL VOLUME', `${Math.round(selected.activeShipments * 12)} loads/yr`], ['NEXT REVIEW', '2026-07-01']].map(([k, v]) => (
                <div key={k} className="panel-2" style={{ padding: '14px' }}>
                  <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Actions */}
            {scheduled[selected.id] && (
              <div className="panel-2" style={{ padding: '14px', borderLeft: '3px solid var(--stable-muted)' }}>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>SCHEDULING STATUS</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{scheduled[selected.id]}</div>
              </div>
            )}

            {contractOpen && (
              <div className="panel-2" style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  ['Rate Card', selected.tier === 'PREFERRED' ? 'Preferred lane pricing' : 'Standard lane pricing'],
                  ['SLA Target', `${Math.round(selected.onTime)}% on-time`],
                  ['Renewal', '2026-07-01'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{value}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={() => openChat(selected.id)}>
                <MessageSquare size={14} /> Message Carrier
              </button>
              <button className="btn" onClick={scheduleShipment}><Plus size={14} /> Schedule Shipment</button>
              <button className="btn" onClick={() => setContractOpen(open => !open)}>{contractOpen ? 'Hide Contract' : 'View Contract'}</button>
            </div>
          </motion.div>
        ) : (
          <div className="flex-center" style={{ height: '100%', flexDirection: 'column', gap: '16px', color: 'var(--text-dim)' }}>
            <Package size={40} strokeWidth={1} />
            <div className="mono" style={{ fontSize: '12px' }}>SELECT_CARRIER_FOR_PROFILE</div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
