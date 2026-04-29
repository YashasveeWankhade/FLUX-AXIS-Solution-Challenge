import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FEATURES } from '../data/mockData'

// -- 3D tilt card --------------------------------------------------------------
function TiltCard({ feature, index }) {
  const cardRef = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]),  { stiffness: 200, damping: 25 })

  const handleMouse = (e) => {
    const rect = cardRef.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const resetTilt = () => { x.set(0); y.set(0) }

  const isInView = useInView(cardRef, { once: true, margin: '0px 0px -80px 0px' })

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouse}
      onMouseLeave={resetTilt}
      initial={{ opacity: 0, y: 50, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.8, delay: index * 0.18, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ perspective: '800px', flex: '1 1 280px' }}
    >
      <motion.div
        style={{
          rotateX, rotateY,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          position: 'relative', overflow: 'hidden',
          transformStyle: 'preserve-3d',
          cursor: 'default',
        }}
        whileHover={{ borderColor: 'var(--border-default)' }}
        transition={{ duration: 0.2 }}
      >
        {/* Hover glow */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit',
            background: 'radial-gradient(circle at 50% 0%, rgba(63,108,143,0.06), transparent 60%)',
            opacity: 0, pointerEvents: 'none',
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        {/* Icon */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 15 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          style={{
            display: 'inline-flex', marginBottom: '1.25rem',
            width: 48, height: 48, alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-default)',
            fontSize: '1.4rem', color: 'var(--accent)',
          }}
        >
          {feature.icon}
        </motion.div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: '1.25rem',
          color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.01em',
        }}>
          {feature.title}
        </h3>

        {/* Body */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {feature.body}
        </p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 + index * 0.18, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: '1px', background: 'var(--border-subtle)', transformOrigin: 'left', marginBottom: '1.5rem' }}
        />

        {/* Stat */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.18, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--accent)', lineHeight: 1 }}
          >
            {feature.stat}
          </motion.div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.63rem', color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginTop: 6, textTransform: 'uppercase' }}>
            {feature.statLabel}
          </div>
        </div>

        {/* Bottom corner accent */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: 60, height: 60,
          background: 'radial-gradient(circle at bottom right, var(--accent-dim), transparent)',
          borderRadius: 'inherit',
        }}/>
      </motion.div>
    </motion.div>
  )
}

// -- Section title word stagger ------------------------------------------------
function SectionTitle({ children }) {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })
  const words = children.split(' ')
  return (
    <h2 ref={ref} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: i * 0.09, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'inline-block', marginRight: '0.3em', color: i === words.length - 1 ? 'var(--accent)' : 'var(--text-primary)' }}
        >
          {w}
        </motion.span>
      ))}
    </h2>
  )
}

export default function FeaturesSection() {
  const subtitleRef = useRef()
  const isSubInView = useInView(subtitleRef, { once: true })

  return (
    <section id="features" style={{ padding: '8rem 2rem', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '4rem', maxWidth: 620 }}>
        <motion.div
          ref={subtitleRef}
          initial={{ opacity: 0, x: -20 }}
          animate={isSubInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.2rem' }}
        >
          <span style={{ display: 'block', width: 28, height: '1px', background: 'var(--accent)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Core capabilities
          </span>
        </motion.div>
        <SectionTitle>Detect. Route. Learn.</SectionTitle>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isSubInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '1rem', lineHeight: 1.7 }}
        >
          Three tightly coupled engines that take the supply chain from reactive disruption management
          to proactive, continuously improving logistics intelligence.
        </motion.p>
      </div>

      {/* Feature cards */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {FEATURES.map((f, i) => <TiltCard key={f.id} feature={f} index={i} />)}
      </div>

      {/* Architecture bridge */}
      <ArchBridge />
    </section>
  )
}

// -- Architecture bridge (animated SVG connecting features  to  dashboard) ---------
function ArchBridge() {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{
        marginTop: '5rem',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        background: 'var(--bg-elevated)',
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(63,108,143,0.04), transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ flex: '1 1 260px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Data pipeline
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          From raw event to ranked recommendation in under 5 minutes.
        </p>
      </div>

      {/* Flow diagram */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', flex: '2 1 400px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {['Carrier APIs', 'Event Bus', 'DRS Engine', 'Route Optimizer', 'Operator UI'].map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.12, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                background: i === 4 ? 'var(--accent-dim)' : 'var(--bg-surface)',
                border: `1px solid ${i === 4 ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)', padding: '6px 12px',
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                color: i === 4 ? 'var(--accent)' : 'var(--text-secondary)',
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
              }}
            >
              {step}
            </motion.div>
            {i < 4 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.12 }}
                style={{ width: 20, height: '1px', background: 'var(--border-default)', transformOrigin: 'left', margin: '0 2px' }}
              />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
