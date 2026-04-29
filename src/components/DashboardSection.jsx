import { useState, useRef, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import ShipmentMap from './ShipmentMap'
import AlertQueue from './AlertQueue'
import RoutePanel from './RoutePanel'
import { ROUTE_ALTERNATIVES } from '../data/mockData'

// -- Tab pill ------------------------------------------------------------------
function Tab({ label, active, count, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: active ? 'var(--accent-dim)' : 'transparent',
        border: `1px solid ${active ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-sm)', padding: '6px 16px',
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
        color: active ? 'var(--accent)' : 'var(--text-tertiary)',
        letterSpacing: '0.1em', cursor: 'pointer',
        textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8,
        transition: 'all 0.2s',
      }}
    >
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? 'var(--accent)' : 'var(--bg-elevated)',
          color: active ? '#030A10' : 'var(--text-secondary)',
          borderRadius: 10, padding: '1px 7px', fontSize: '0.58rem',
          fontWeight: 700, transition: 'all 0.2s',
        }}>
          {count}
        </span>
      )}
    </motion.button>
  )
}

// -- Status LED row ------------------------------------------------------------
function StatusLEDs() {
  const items = [
    { label: 'Ingestion',  status: 'ok'   },
    { label: 'DRS Engine', status: 'ok'   },
    { label: 'Optimizer',  status: 'ok'   },
    { label: 'Alerts',     status: 'warn' },
    { label: 'API',        status: 'ok'   },
  ]
  const color = { ok: 'var(--status-ok)', warn: 'var(--status-watch)', err: 'var(--status-critical)' }

  return (
    <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <motion.span
            animate={item.status !== 'ok' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: color[item.status], display: 'block', flexShrink: 0 }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// -- Dashboard section ---------------------------------------------------------
export default function DashboardSection() {
  const [activeTab, setActiveTab] = useState('alerts')
  const [selectedAlert, setSelectedAlert] = useState(null)
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert)
    setActiveTab('routes')
  }

  return (
    <section id="dashboard" style={{ padding: '8rem 2rem', maxWidth: 1200, margin: '0 auto' }}>

      {/* Section header */}
      <div ref={ref} style={{ marginBottom: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}
        >
          <span style={{ display: 'block', width: 28, height: '1px', background: 'var(--accent)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Live operator dashboard
          </span>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Command <span style={{ color: 'var(--accent)' }}>center</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            <StatusLEDs />
          </motion.div>
        </div>
      </div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2 }}
        style={{ marginBottom: '2rem' }}
      >
        <ShipmentMap />
      </motion.div>

      {/* Tabs + panels */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
        }}
      >
        {/* Tab bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}>
          <Tab label="Alert queue"   active={activeTab === 'alerts'} count={4} onClick={() => setActiveTab('alerts')} />
          <Tab label="Route options" active={activeTab === 'routes'} count={selectedAlert ? ROUTE_COUNT(selectedAlert) : undefined} onClick={() => setActiveTab('routes')} />

          {/* Right side clock */}
          <div style={{ marginLeft: 'auto' }}>
            <LiveClock />
          </div>
        </div>

        {/* Panel body */}
        <div style={{ padding: '1.5rem' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'alerts' ? (
              <motion.div
                key="alerts"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.3 }}
              >
                <AlertQueue onSelectAlert={handleSelectAlert} selectedAlert={selectedAlert} />
              </motion.div>
            ) : (
              <motion.div
                key="routes"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
              >
                {/* Back button */}
                <motion.button
                  whileHover={{ x: -3 }}
                  onClick={() => setActiveTab('alerts')}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                    color: 'var(--text-tertiary)', letterSpacing: '0.1em',
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginBottom: '1.25rem', padding: 0,
                    transition: 'color 0.15s',
                  }}
                >
                  <- BACK TO ALERTS
                </motion.button>
                <RoutePanel alert={selectedAlert} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

// -- Helpers -------------------------------------------------------------------
function ROUTE_COUNT(alert) {
  return ROUTE_ALTERNATIVES[alert?.id]?.length ?? 0
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block',
        animation: 'blink 1s steps(1) infinite' }}/>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
        {time.toUTCString().slice(17, 25)} UTC
      </span>
    </div>
  )
}
