import { useRef, useEffect, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { METRICS } from '../data/mockData'

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, suffix = '', decimals = 0, delay = 0 }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const ctrl = animate(0, target, {
      duration: 2.2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => setVal(decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString()),
    })
    return ctrl.stop
  }, [isInView, target])

  return <span ref={ref}>{val}{suffix}</span>
}

// ── Sparkline SVG ─────────────────────────────────────────────────────────────
const SPARK_DATA = [22, 19, 25, 30, 18, 22, 28, 35, 41, 25, 18, 21, 15, 18]

function Sparkline({ data = SPARK_DATA, color = 'var(--accent)', delay = 0 }) {
  const ref = useRef()
  const isInView = useInView(ref, { once: true })

  const max = Math.max(...data)
  const min = Math.min(...data)
  const W = 140, H = 36
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / (max - min)) * H
    return `${x},${y}`
  }).join(' ')

  return (
    <svg ref={ref} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Area fill */}
      <motion.polygon
        points={`0,${H} ${pts} ${W},${H}`}
        fill={`url(#sg-${color.replace(/[^a-z0-9]/gi, '')})`}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay }}
      />
      {/* Line */}
      <motion.polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 1.2, delay, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </svg>
  )
}

// ── Metric KPI card ───────────────────────────────────────────────────────────
function MetricCard({ metric, index }) {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const isPositive = metric.trend > 0
  const trendColor = metric.id === 'M3'
    ? (isPositive ? 'var(--status-critical)' : 'var(--status-ok)')
    : (isPositive ? 'var(--status-ok)' : 'var(--status-critical)')

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ borderColor: 'var(--border-default)', y: -3 }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem',
        flex: '1 1 180px', position: 'relative', overflow: 'hidden',
        transition: 'border-color 0.2s, transform 0.2s',
      }}
    >
      {/* Glow shard */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        background: 'radial-gradient(circle, rgba(0,212,170,0.07), transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }}/>

      {/* Label */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-tertiary)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        {metric.label}
      </div>

      {/* Value */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.75rem' }}>
        {isInView ? <Counter target={metric.value} suffix={metric.suffix} decimals={metric.suffix === '%' ? 1 : 0} delay={index * 0.1} /> : '0'}
      </div>

      {/* Trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '1rem' }}>
        <motion.span
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.6 + index * 0.1, type: 'spring', stiffness: 400, damping: 10 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: trendColor }}
        >
          {isPositive ? '↑' : '↓'} {Math.abs(metric.trend)}{metric.suffix || ''}
        </motion.span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)' }}>
          vs last 24h
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline delay={0.4 + index * 0.1} color={trendColor} />
    </motion.div>
  )
}

// ── DRS distribution bar chart ────────────────────────────────────────────────
const DRS_BINS = [
  { range: '0–15',  count: 1842, severity: 'nominal'  },
  { range: '16–30', count: 614,  severity: 'nominal'  },
  { range: '31–45', count: 218,  severity: 'nominal'  },
  { range: '46–60', count: 98,   severity: 'watch'    },
  { range: '61–75', count: 52,   severity: 'watch'    },
  { range: '76–100',count: 23,   severity: 'critical' },
]

const COLOR = { nominal: 'var(--status-ok)', watch: 'var(--status-watch)', critical: 'var(--status-critical)' }

function DRSDistribution() {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' })
  const total = DRS_BINS.reduce((s, b) => s + b.count, 0)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem', flex: '2 1 380px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        DRS distribution
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
        {total.toLocaleString()} ACTIVE SHIPMENTS
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {DRS_BINS.map((bin, i) => {
          const pct = (bin.count / total) * 100
          const color = COLOR[bin.severity]
          return (
            <div key={bin.range} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', width: 40, flexShrink: 0 }}>
                {bin.range}
              </span>
              <div style={{ flex: 1, height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    height: '100%', borderRadius: 3, background: color,
                    width: `${pct}%`, transformOrigin: 'left',
                  }}
                />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color, width: 42, textAlign: 'right', flexShrink: 0 }}>
                {bin.count.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Lane performance table ────────────────────────────────────────────────────
const LANE_DATA = [
  { lane: 'Asia → Americas',  shipments: 487, onTime: 94.2, alerts: 3, trend: '↑' },
  { lane: 'Asia → Europe',    shipments: 612, onTime: 97.8, alerts: 0, trend: '↑' },
  { lane: 'Middle East → EU', shipments: 218, onTime: 81.4, alerts: 2, trend: '↓' },
  { lane: 'Intra-Asia',       shipments: 344, onTime: 98.9, alerts: 0, trend: '→' },
  { lane: 'Trans-Atlantic',   shipments: 291, onTime: 96.1, alerts: 1, trend: '↑' },
]

function LaneTable() {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '1.5rem', flex: '2 1 380px',
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        Lane performance
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
        ROLLING 30 DAYS
      </div>

      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
        {['Lane', 'Ships', 'On-time', 'Alerts'].map(h => (
          <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.57rem', color: 'var(--text-tertiary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {LANE_DATA.map((row, i) => (
        <motion.div
          key={row.lane}
          initial={{ opacity: 0, x: -16 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
          style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 8, padding: '10px 0',
            borderBottom: i < LANE_DATA.length - 1 ? '1px solid var(--border-faint)' : 'none',
            alignItems: 'center',
          }}
        >
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {row.lane}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-primary)' }}>
            {row.shipments}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
            color: row.onTime >= 96 ? 'var(--status-ok)' : row.onTime >= 90 ? 'var(--status-watch)' : 'var(--status-critical)',
          }}>
            {row.onTime}%
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: row.alerts > 0 ? 'var(--status-watch)' : 'var(--text-tertiary)' }}>
              {row.alerts}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: row.trend === '↑' ? 'var(--status-ok)' : row.trend === '↓' ? 'var(--status-critical)' : 'var(--text-tertiary)',
            }}>
              {row.trend}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// ── Section export ────────────────────────────────────────────────────────────
export default function MetricsSection() {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <section id="metrics" style={{ padding: '8rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}
        >
          <span style={{ display: 'block', width: 28, height: '1px', background: 'var(--accent)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Analytics
          </span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Supply chain <span style={{ color: 'var(--accent)' }}>at a glance</span>
        </motion.h2>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {METRICS.map((m, i) => <MetricCard key={m.id} metric={m} index={i} />)}
      </div>

      {/* Charts row */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <DRSDistribution />
        <LaneTable />
      </div>
    </section>
  )
}
