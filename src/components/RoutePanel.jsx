import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion'
import { useEffect } from 'react'
import { ROUTE_ALTERNATIVES } from '../data/mockData'

// -- Animated number -----------------------------------------------------------
function AnimNum({ value, duration = 0.6 }) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const ctrl = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setDisplay(Math.round(v)),
    })
    return ctrl.stop
  }, [value])
  return <span>{display}</span>
}

// -- Confidence ring -----------------------------------------------------------
function ConfidenceRing({ value, delay = 0 }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const offset = useMotionValue(circ)
  useEffect(() => {
    const ctrl = animate(offset, circ - (value / 100) * circ, {
      duration: 0.9, delay, ease: [0.16, 1, 0.3, 1],
    })
    return ctrl.stop
  }, [value, delay])

  const color = value >= 85 ? 'var(--status-ok)' : value >= 65 ? 'var(--status-watch)' : 'var(--status-critical)'

  return (
    <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
        <motion.circle cx="22" cy="22" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={circ}
          style={{ strokeDashoffset: offset }}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: '0.7rem', color,
      }}>
        {value}
      </div>
    </div>
  )
}

// -- Route option card ---------------------------------------------------------
function RouteCard({ option, index, onApprove, approved }) {
  const isRecommended = option.label === 'Recommended'
  const isAir = option.label === 'Air freight'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        border: `1px solid ${isRecommended ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        background: isRecommended ? 'rgba(63,108,143,0.04)' : 'var(--bg-elevated)',
        position: 'relative', overflow: 'hidden',
        flex: '1 1 180px',
        opacity: approved && !approved.includes(option.id) ? 0.5 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 12 }}
          style={{
            position: 'absolute', top: 10, right: 10,
            background: 'var(--accent)', color: '#030A10',
            fontFamily: 'var(--font-mono)', fontSize: '0.55rem',
            letterSpacing: '0.14em', padding: '2px 8px',
            borderRadius: 'var(--radius-sm)', fontWeight: 700,
          }}
        >
          BEST MATCH
        </motion.div>
      )}

      {/* Top: label + confidence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
        <ConfidenceRing value={option.confidence} delay={0.2 + index * 0.1} />
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {option.label}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', marginTop: 2 }}>
            CONFIDENCE
          </div>
        </div>
      </div>

      {/* Via + carrier */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-secondary)', marginBottom: 3 }}>
          Via {option.via}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
          {option.carrier}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', marginBottom: '1.25rem' }}>
        {[
          { label: 'ETA delta',  val: option.etaDelta,  warn: option.etaDelta.startsWith('+') },
          { label: 'Cost delta', val: option.costDelta, warn: option.costDelta.startsWith('+') },
          { label: 'SLA',        val: option.slaOk ? 'OK Met' : 'X Breach', warn: !option.slaOk },
          { label: 'Capacity',   val: option.capacity,  warn: option.capacity === 'Limited' },
        ].map(({ label, val, warn }) => (
          <div key={label}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 2 }}>
              {label}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
              color: warn
                ? (label === 'SLA' && !option.slaOk ? 'var(--status-critical)' : 'var(--status-watch)')
                : 'var(--status-ok)',
              letterSpacing: '0.04em',
            }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* CO2 */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)',
        marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ opacity: 0.5 }}>CO2</span>
        <span style={{ color: isAir ? 'var(--status-critical)' : 'var(--text-secondary)' }}>
          {option.co2Delta}
        </span>
        {isAir && <span style={{ opacity: 0.4 }}> -  air premium</span>}
      </div>

      {/* Action button */}
      <AnimatePresence mode="wait">
        {approved?.includes(option.id) ? (
          <motion.div
            key="approved"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '8px',
              background: 'var(--status-ok-dim)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--status-ok)', letterSpacing: '0.1em',
            }}
          >
            OK APPROVED
          </motion.div>
        ) : (
          <motion.button
            key="approve"
            whileHover={{ scale: 1.03, boxShadow: isRecommended ? 'var(--accent-glow)' : 'none' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onApprove(option.id)}
            style={{
              width: '100%', padding: '8px',
              background: isRecommended ? 'var(--accent)' : 'var(--bg-surface)',
              border: `1px solid ${isRecommended ? 'transparent' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: isRecommended ? '#030A10' : 'var(--text-secondary)',
              letterSpacing: '0.1em', cursor: 'pointer',
              textTransform: 'uppercase', fontWeight: isRecommended ? 700 : 400,
              transition: 'background 0.15s',
            }}
          >
            Approve route
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// -- Route recommendation panel ------------------------------------------------
export default function RoutePanel({ alert }) {
  const [approved, setApproved] = useState([])
  const [dismissed, setDismissed] = useState(false)

  const options = alert ? (ROUTE_ALTERNATIVES[alert.id] ?? []) : []

  const handleApprove = (optId) => {
    setApproved([optId]) // single select for now
  }

  if (!alert) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: 240,
          border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)',
          gap: 12,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
          style={{ opacity: 0.2 }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <polygon points="20,3 37,12 37,28 20,37 3,28 3,12" stroke="var(--accent)" strokeWidth="1"/>
            <circle cx="20" cy="20" r="5" fill="none" stroke="var(--accent)" strokeWidth="1"/>
          </svg>
        </motion.div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)', letterSpacing: '0.12em', textAlign: 'center' }}>
          SELECT AN ALERT TO VIEW<br/>ROUTE ALTERNATIVES
        </p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={alert.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Alert summary bar */}
        <motion.div
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderLeft: `3px solid ${alert.severity === 'critical' ? 'var(--status-critical)' : 'var(--status-watch)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 16px',
            marginBottom: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 3 }}>
              {alert.route}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-secondary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360,
            }}>
              {alert.trigger}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>DRS</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: alert.drs >= 70 ? 'var(--status-critical)' : 'var(--status-watch)' }}>
                {alert.drs}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>ETA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--status-watch)' }}>
                {alert.etaDelta}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>VALUE</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {alert.value}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section label */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-tertiary)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          {options.length > 0 ? `${options.length} alternative routes ranked` : 'No alternatives available'}
        </div>

        {/* Option cards */}
        {options.length > 0 ? (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {options.map((opt, i) => (
              <RouteCard
                key={opt.id}
                option={opt}
                index={i}
                onApprove={handleApprove}
                approved={approved}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)',
              padding: '2rem', textAlign: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-tertiary)',
              letterSpacing: '0.1em',
            }}
          >
            Route optimization engine is processing alternatives...
          </motion.div>
        )}

        {/* Dismiss action */}
        {options.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: 10 }}
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)', padding: '6px 16px',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: 'var(--text-tertiary)', letterSpacing: '0.1em',
                cursor: 'pointer', textTransform: 'uppercase',
              }}
            >
              Dismiss alert
            </motion.button>
            {approved.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                  color: 'var(--status-ok)', letterSpacing: '0.1em',
                }}
              >
                OK Route change submitted to carrier
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
