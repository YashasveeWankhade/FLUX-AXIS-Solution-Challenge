import { useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { PORTS, LANES } from '../data/mockData'

// ── Curved path between two ports ────────────────────────────────────────────
function lanePath(from, to, ports) {
  const a = ports.find(p => p.id === from)
  const b = ports.find(p => p.id === to)
  if (!a || !b) return ''
  // Quadratic bezier with control point above midpoint
  const mx = (a.x + b.x) / 2
  const my = Math.min(a.y, b.y) - Math.abs(b.x - a.x) * 0.22
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`
}

// ── Pulsing ring on port node ────────────────────────────────────────────────
function PulseRing({ x, y, color, delay = 0 }) {
  return (
    <>
      {[0, 1].map(i => (
        <motion.circle
          key={i}
          cx={x} cy={y} r={6}
          fill="none"
          stroke={color}
          strokeWidth={1}
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 3.2, opacity: 0 }}
          transition={{ duration: 2.2, delay: delay + i * 1.1, repeat: Infinity, ease: 'easeOut' }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      ))}
    </>
  )
}

// ── Port node ──────────────────────────────────────────────────────────────────
function PortNode({ port, index, onHover }) {
  const isInView = true
  const color = {
    critical: 'var(--status-critical)',
    watch:    'var(--status-watch)',
    nominal:  'var(--status-ok)',
  }[port.status]

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.8 + index * 0.07, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformOrigin: `${port.x}px ${port.y}px`, cursor: 'pointer' }}
      onMouseEnter={() => onHover(port)}
      onMouseLeave={() => onHover(null)}
    >
      <PulseRing x={port.x} y={port.y} color={color} delay={index * 0.2} />
      {/* Outer halo */}
      <circle cx={port.x} cy={port.y} r={9} fill={color} opacity={0.12} />
      {/* Core */}
      <motion.circle
        cx={port.x} cy={port.y} r={5}
        fill={color}
        whileHover={{ r: 7 }}
        transition={{ duration: 0.15 }}
      />
      {/* Center dot */}
      <circle cx={port.x} cy={port.y} r={2} fill="var(--bg-base)" />
      {/* Label */}
      <text
        x={port.x + 10} y={port.y + 4}
        fill={color}
        fontSize="8"
        fontFamily="var(--font-mono)"
        opacity={0.8}
      >
        {port.id}
      </text>
    </motion.g>
  )
}

// ── Animated lane path ────────────────────────────────────────────────────────
function LanePath({ lane, ports, index }) {
  const d = lanePath(lane.from, lane.to, ports)
  const color = lane.disrupted ? 'var(--status-critical)' : 'rgba(0,212,170,0.35)'
  const dashArray = lane.disrupted ? '4 4' : '0'

  return (
    <motion.path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={lane.disrupted ? 1.5 : 1}
      strokeDasharray={dashArray}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.8, delay: 0.3 + index * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
    />
  )
}

// ── Moving ship dot along path ────────────────────────────────────────────────
function ShipDot({ lane, ports, index }) {
  const from = ports.find(p => p.id === lane.from)
  const to   = ports.find(p => p.id === lane.to)
  if (!from || !to) return null

  const mx = (from.x + to.x) / 2
  const my = Math.min(from.y, to.y) - Math.abs(to.x - from.x) * 0.22
  const d = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`

  return (
    <motion.circle r={2.5} fill={lane.disrupted ? 'var(--status-critical)' : 'var(--accent)'} opacity={0.8}>
      <animateMotion
        dur={`${6 + index * 1.3}s`}
        repeatCount="indefinite"
        path={d}
        begin={`${index * 0.8}s`}
      />
    </motion.circle>
  )
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function PortTooltip({ port }) {
  if (!port) return null
  const color = { critical: 'var(--status-critical)', watch: 'var(--status-watch)', nominal: 'var(--status-ok)' }[port.status]
  return (
    <AnimatePresence>
      <motion.div
        key={port.id}
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute', top: 12, left: 12,
          background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
          pointerEvents: 'none', zIndex: 10,
          minWidth: 180,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block', flexShrink: 0 }}/>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{port.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{port.id}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          {port.status}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          {port.region}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Continent outlines (very simplified polygons) ──────────────────────────────
const CONTINENTS = [
  // North America
  { d: 'M 35,38 L 95,28 L 155,36 L 170,55 L 155,90 L 135,125 L 120,160 L 115,190 L 130,215 L 125,228 L 100,222 L 75,200 L 50,175 L 38,145 L 28,110 L 32,70 Z' },
  // South America
  { d: 'M 125,228 L 155,222 L 185,235 L 205,260 L 200,295 L 180,320 L 155,328 L 135,315 L 120,285 L 112,258 Z' },
  // Europe
  { d: 'M 295,38 L 340,32 L 370,40 L 385,58 L 375,72 L 350,78 L 325,75 L 305,62 Z' },
  // Africa
  { d: 'M 308,98 L 355,90 L 390,100 L 405,128 L 412,165 L 405,205 L 390,240 L 368,258 L 342,260 L 315,248 L 298,220 L 285,185 L 282,150 L 290,118 Z' },
  // Asia
  { d: 'M 385,35 L 460,22 L 540,28 L 605,38 L 648,58 L 650,90 L 630,105 L 595,108 L 555,100 L 510,108 L 470,100 L 440,90 L 415,75 L 392,55 Z' },
  // Oceania
  { d: 'M 558,208 L 600,202 L 635,215 L 645,238 L 632,260 L 605,268 L 572,258 L 552,240 L 548,220 Z' },
]

export default function ShipmentMap() {
  const [hoveredPort, setHoveredPort] = useState(null)
  const [filter, setFilter] = useState('all')
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' })

  const filteredLanes = useMemo(() => {
    if (filter === 'disrupted') return LANES.filter(l => l.disrupted)
    return LANES
  }, [filter])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            Global trade network
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginTop: 2 }}>
            {PORTS.length} PORTS · {LANES.length} ACTIVE LANES
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'disrupted'].map(f => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: filter === f ? 'var(--accent-dim)' : 'transparent',
                border: `1px solid ${filter === f ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)', padding: '4px 14px',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: filter === f ? 'var(--accent)' : 'var(--text-tertiary)',
                letterSpacing: '0.1em', cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {f === 'all' ? 'All lanes' : '⚠ Disrupted'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          position: 'relative',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        <PortTooltip port={hoveredPort} />

        <svg
          viewBox="0 0 680 340"
          style={{ width: '100%', display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dot grid background */}
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.7" fill="rgba(0,212,170,0.18)"/>
            </pattern>
          </defs>
          <rect width="680" height="340" fill="url(#dots)"/>

          {/* Continent fills */}
          {CONTINENTS.map((c, i) => (
            <motion.path
              key={i}
              d={c.d}
              fill="rgba(0,212,170,0.04)"
              stroke="rgba(0,212,170,0.09)"
              strokeWidth={0.5}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1, delay: 0.1 + i * 0.08 }}
            />
          ))}

          {/* Lane paths */}
          {filteredLanes.map((lane, i) => (
            <LanePath key={lane.id} lane={lane} ports={PORTS} index={i} />
          ))}

          {/* Moving ship dots */}
          {filteredLanes.map((lane, i) => (
            <ShipDot key={lane.id + '-dot'} lane={lane} ports={PORTS} index={i} />
          ))}

          {/* Port nodes */}
          {PORTS.map((port, i) => (
            <PortNode key={port.id} port={port} index={i} onHover={setHoveredPort} />
          ))}

          {/* Equator line */}
          <motion.line
            x1={40} y1={170} x2={640} y2={170}
            stroke="rgba(0,212,170,0.08)" strokeWidth={0.5}
            strokeDasharray="3 6"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          <text x={42} y={166} fill="rgba(0,212,170,0.2)" fontSize={7} fontFamily="var(--font-mono)">EQ</text>
        </svg>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.5 }}
          style={{
            position: 'absolute', bottom: 12, right: 12,
            display: 'flex', gap: 16, flexWrap: 'wrap',
          }}
        >
          {[
            { label: 'Nominal', color: 'var(--status-ok)' },
            { label: 'Watch',   color: 'var(--status-watch)' },
            { label: 'Critical',color: 'var(--status-critical)' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'block' }}/>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
