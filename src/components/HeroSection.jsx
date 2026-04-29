import { useEffect, useRef } from 'react'
import {
  motion, useMotionValue, useSpring, useTransform, animate,
} from 'framer-motion'

// -- Animated counter hook -----------------------------------------------------
function useCounter(target, duration = 2.4) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, v => {
    if (target < 10) return v.toFixed(1)
    return Math.round(v).toLocaleString()
  })
  useEffect(() => {
    const ctrl = animate(count, target, { duration, ease: [0.16, 1, 0.3, 1] })
    return ctrl.stop
  }, [target])
  return rounded
}

// -- DRS Gauge Ring ------------------------------------------------------------
function DRSGauge({ value = 18 }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const progress = useMotionValue(0)
  const dashOffset = useTransform(progress, v => circ - (v / 100) * circ * 0.75)

  useEffect(() => {
    const ctrl = animate(progress, value, { duration: 2.2, delay: 1.2, ease: [0.16, 1, 0.3, 1] })
    return ctrl.stop
  }, [value])

  const displayVal = useCounter(value, 2)
  const color = value < 45 ? 'var(--status-ok)' : value < 70 ? 'var(--status-watch)' : 'var(--status-critical)'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ position: 'relative', width: 160, height: 160 }}
    >
      <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(135deg)' }}>
        {/* Track */}
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)"
          strokeWidth="8" strokeDasharray={`${circ * 0.75} ${circ * 0.25}`} strokeLinecap="round"/>
        {/* Fill */}
        <motion.circle cx="80" cy="80" r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
          style={{ strokeDashoffset: dashOffset }}
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.span style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color, lineHeight: 1 }}>
          {displayVal}
        </motion.span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'var(--text-tertiary)', letterSpacing: '0.14em', marginTop: 4 }}>
          GLOBAL DRS
        </span>
      </div>
    </motion.div>
  )
}

// -- Ticker --------------------------------------------------------------------
const TICKER_ITEMS = [
  'SHA to LAX  ▲ DRS 84  CRITICAL',
  'DXB to RTM  ▲ DRS 71  HIGH RISK',
  '2,847 active shipments monitored',
  'RTM  congestion index 0.42  NOMINAL',
  'SIN to SYD  DRS 47  WATCH',
  'SLA compliance  97.2%',
  'Last model refresh  06:14 UTC',
  'SHA to TYO  DRS 12  NOMINAL',
]

function LiveTicker() {
  const text = TICKER_ITEMS.join('    -  -    ')
  return (
    <div style={{
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden', height: '32px', display: 'flex', alignItems: 'center',
      background: 'rgba(63,108,143,0.02)',
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
        color: 'var(--accent)', letterSpacing: '0.08em',
        padding: '0 16px', flexShrink: 0, opacity: 0.7,
        borderRight: '1px solid var(--border-subtle)',
      }}>
        LIVE
        <span style={{ display: 'inline-block', marginLeft: 6, width: 6, height: 6,
          borderRadius: '50%', background: 'var(--accent)',
          animation: 'blink 1s steps(1) infinite' }}/>
      </span>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ display: 'flex', whiteSpace: 'nowrap' }}
        >
          {[text, text].map((t, i) => (
            <span key={i} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
              color: 'var(--text-secondary)', letterSpacing: '0.06em',
              padding: '0 40px',
            }}>{t}</span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

// -- Background grid SVG -------------------------------------------------------
function GridBg() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="var(--accent)" strokeWidth="0.5"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)"/>
    </svg>
  )
}

// -- Word stagger helper -------------------------------------------------------
function AnimatedWords({ text, style, delay = 0 }) {
  const words = text.split(' ')
  return (
    <span style={{ display: 'inline', ...style }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: delay + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}

// -- Hero Section --------------------------------------------------------------
export default function HeroSection() {
  const counter1 = useCounter(2847)
  const counter2 = useCounter(97.2, 2.8)
  const counter3 = useCounter(14)

  return (
    <section id="overview" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '60px', overflow: 'hidden' }}>
      <GridBg />

      {/* Radial glow behind content */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '60vw', height: '50vh', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(63,108,143,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Scanline sweep */}
      <motion.div
        animate={{ y: ['-8%', '108%'] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 6, ease: 'linear' }}
        style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          opacity: 0.2, pointerEvents: 'none', zIndex: 2,
        }}
      />

      {/* Main hero content */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 2rem 2rem',
        gap: '4rem', flexWrap: 'wrap',
      }}>
        {/* Left: text block */}
        <div style={{ maxWidth: 580, flex: '1 1 320px' }}>
          {/* System label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.5rem' }}
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', display: 'block' }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              Supply Chain Intelligence  -  MVP v0.1
            </span>
          </motion.div>

          {/* Main headline */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 6vw, 5.2rem)', lineHeight: 1.0, marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            <AnimatedWords text="Resilient" style={{ color: 'var(--text-primary)' }} delay={0.3} />
            <br />
            <AnimatedWords text="Logistics" style={{ color: 'var(--accent)' }} delay={0.55} />
            <br />
            <AnimatedWords text="Intelligence" style={{ color: 'var(--text-primary)' }} delay={0.75} />
          </h1>

          {/* Subhead */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: 480, marginBottom: '2.5rem' }}
          >
            Continuously scoring 2,800+ active shipments for disruption risk.
            Flagging critical events before ETA is compromised, and generating optimized
            re-routing options in under 90 seconds.
          </motion.p>

          {/* Stat row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}
          >
            {[
              { val: counter1, suffix: '', label: 'Active shipments' },
              { val: counter2, suffix: '%', label: 'SLA compliance' },
              { val: counter3, suffix: '', label: 'Open alerts' },
            ].map(({ val, suffix, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.12 }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--text-primary)', lineHeight: 1 }}>
                  <motion.span>{val}</motion.span>{suffix}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-tertiary)', letterSpacing: '0.14em', marginTop: 4, textTransform: 'uppercase' }}>
                  {label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: 'var(--accent-glow)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'var(--accent)', color: '#030A10',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '12px 28px', fontFamily: 'var(--font-display)',
                fontSize: '0.9rem', letterSpacing: '0.06em', cursor: 'pointer', fontWeight: 700,
              }}
            >
              Open Dashboard  to 
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, borderColor: 'var(--accent)', color: 'var(--text-primary)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
                padding: '12px 28px', fontFamily: 'var(--font-display)',
                fontSize: '0.9rem', letterSpacing: '0.06em', cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
            >
              See Features
            </motion.button>
          </motion.div>
        </div>

        {/* Right: DRS gauge + info panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xl)', padding: '2rem',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
            minWidth: 260, flex: '0 0 auto',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Corner accent lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 24,
            borderTop: '1px solid var(--accent)', borderLeft: '1px solid var(--accent)', borderRadius: '4px 0 0 0' }}/>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24,
            borderBottom: '1px solid var(--accent)', borderRight: '1px solid var(--accent)', borderRadius: '0 0 4px 0' }}/>

          <DRSGauge value={18} />

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Critical alerts', val: 2,   color: 'var(--status-critical)' },
              { label: 'Watch alerts',    val: 5,   color: 'var(--status-watch)'    },
              { label: 'Nominal lanes',   val: 91,  color: 'var(--status-ok)'       },
            ].map(({ label, val, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.6 + i * 0.1 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>
                  {label}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color }}>{val}</span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', height: '1px', background: 'var(--border-subtle)', transformOrigin: 'left' }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', textAlign: 'center' }}
          >
            REFRESHED&nbsp;&nbsp;{'<'}&nbsp;5MIN AGO
          </motion.div>
        </motion.div>
      </div>

      {/* Live Ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <LiveTicker />
      </motion.div>
    </section>
  )
}
