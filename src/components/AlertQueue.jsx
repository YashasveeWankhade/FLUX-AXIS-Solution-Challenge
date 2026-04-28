import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { INITIAL_ALERTS } from '../data/mockData'

// ── DRS animated bar ──────────────────────────────────────────────────────────
function DRSBar({ value }) {
  const width = useMotionValue('0%')
  useEffect(() => {
    const ctrl = animate(width, `${value}%`, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
    return ctrl.stop
  }, [value])

  const color =
    value >= 70 ? 'var(--status-critical)'
    : value >= 45 ? 'var(--status-watch)'
    : 'var(--status-ok)'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        flex: 1, height: 3, background: 'var(--bg-elevated)',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 2, width }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color, minWidth: 28 }}>
        {value}
      </span>
    </div>
  )
}

// ── Severity badge ────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const cfg = {
    critical: { color: 'var(--status-critical)', bg: 'var(--status-critical-dim)', label: '● CRITICAL' },
    watch:    { color: 'var(--status-watch)',    bg: 'var(--status-watch-dim)',    label: '◐ WATCH'    },
    nominal:  { color: 'var(--status-ok)',       bg: 'var(--status-ok-dim)',       label: '○ NOMINAL'  },
  }[severity] ?? { color: 'var(--text-tertiary)', bg: 'transparent', label: severity.toUpperCase() }

  return (
    <motion.span
      animate={severity === 'critical' ? { opacity: [1, 0.6, 1] } : {}}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
        letterSpacing: '0.14em', color: cfg.color,
        background: cfg.bg, borderRadius: 'var(--radius-sm)',
        padding: '2px 8px', display: 'inline-block',
      }}
    >
      {cfg.label}
    </motion.span>
  )
}

// ── Single alert row ──────────────────────────────────────────────────────────
function AlertRow({ alert, onDismiss, onSelect, selected }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -30, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => onSelect(alert)}
      style={{
        background: selected ? 'rgba(0,212,170,0.05)' : 'var(--bg-elevated)',
        border: `1px solid ${selected ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-watch)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        cursor: 'pointer',
        marginBottom: 8,
        transition: 'background 0.2s, border-color 0.2s',
        overflow: 'hidden',
        position: 'relative',
      }}
      whileHover={{ background: 'rgba(0,212,170,0.04)' }}
    >
      {/* Flash overlay on entry for critical */}
      {alert.severity === 'critical' && (
        <motion.div
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'rgba(239,68,68,0.15)', pointerEvents: 'none',
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <SeverityBadge severity={alert.severity} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
              {alert.shipmentId}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
              {alert.ts}
            </span>
          </div>

          {/* Route */}
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {alert.route}
          </div>

          {/* Trigger */}
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)',
            lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '90%',
          }}>
            {alert.trigger}
          </div>

          {/* DRS bar + meta */}
          <div style={{ marginTop: 10, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 140px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginBottom: 4 }}>
                DISRUPTION RISK SCORE
              </div>
              <DRSBar value={alert.drs} />
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'ETA', val: alert.etaDelta, warn: true },
                { label: 'Value', val: alert.value, warn: false },
                { label: 'Carrier', val: alert.carrier.split(' ')[0], warn: false },
              ].map(({ label, val, warn }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{label}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: warn ? 'var(--status-watch)' : 'var(--text-secondary)', marginTop: 1 }}>
                    {val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dismiss btn */}
        <motion.button
          whileHover={{ scale: 1.15, color: 'var(--status-critical)' }}
          whileTap={{ scale: 0.9 }}
          onClick={e => { e.stopPropagation(); onDismiss(alert.id) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-tertiary)', fontSize: '1rem', lineHeight: 1,
            padding: '0 4px', flexShrink: 0, transition: 'color 0.15s',
          }}
        >
          ×
        </motion.button>
      </div>
    </motion.div>
  )
}

// ── New alert ticker ──────────────────────────────────────────────────────────
const SIMULATED_ALERTS = [
  {
    id: 'A005',
    shipmentId: 'CS-88412',
    route: 'Tokyo → Los Angeles',
    carrier: 'MOL Marine',
    drs: 68,
    severity: 'watch',
    trigger: 'Japan port labor action warning — 48h notice issued',
    eta: '2026-05-08',
    etaDelta: '+9h',
    value: '$740K',
    priority: 'High',
    ts: 'LIVE',
  },
]

// ── Alert Queue component ─────────────────────────────────────────────────────
export default function AlertQueue({ onSelectAlert, selectedAlert }) {
  const [alerts, setAlerts]     = useState(INITIAL_ALERTS)
  const [filter, setFilter]     = useState('all')
  const [simulated, setSimulated] = useState(false)

  const dismiss = useCallback(id => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  // Simulate a new incoming alert after 8 seconds
  useEffect(() => {
    if (simulated) return
    const t = setTimeout(() => {
      setAlerts(prev => [SIMULATED_ALERTS[0], ...prev])
      setSimulated(true)
    }, 8000)
    return () => clearTimeout(t)
  }, [simulated])

  const filtered = alerts.filter(a =>
    filter === 'all' ? true : a.severity === filter
  )

  const critCount  = alerts.filter(a => a.severity === 'critical').length
  const watchCount = alerts.filter(a => a.severity === 'watch').length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Alert queue
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={alerts.length}
                initial={{ scale: 1.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                style={{
                  background: 'var(--status-critical-dim)', color: 'var(--status-critical)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  padding: '2px 8px', borderRadius: 'var(--radius-sm)', letterSpacing: '0.08em',
                }}
              >
                {alerts.length}
              </motion.span>
            </AnimatePresence>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginTop: 2 }}>
            {critCount} CRITICAL · {watchCount} WATCH
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
          {[
            { key: 'all',      label: 'All'      },
            { key: 'critical', label: 'Critical' },
            { key: 'watch',    label: 'Watch'    },
          ].map(tab => (
            <motion.button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: filter === tab.key ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${filter === tab.key ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)', padding: '4px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: filter === tab.key ? 'var(--accent)' : 'var(--text-tertiary)',
                letterSpacing: '0.1em', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ maxHeight: 480, overflowY: 'auto', paddingRight: 4 }}>
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                textAlign: 'center', padding: '3rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                color: 'var(--text-tertiary)', letterSpacing: '0.1em',
              }}
            >
              NO ALERTS IN THIS CATEGORY
            </motion.div>
          ) : (
            filtered.map(alert => (
              <AlertRow
                key={alert.id}
                alert={alert}
                onDismiss={dismiss}
                onSelect={onSelectAlert}
                selected={selectedAlert?.id === alert.id}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
