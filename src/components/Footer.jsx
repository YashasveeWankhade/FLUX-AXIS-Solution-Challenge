import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const FOOTER_LINKS = [
  {
    heading: 'System',
    links: ['Overview', 'Dashboard', 'Features', 'Analytics'],
  },
  {
    heading: 'Architecture',
    links: ['Ingestion layer', 'DRS Engine', 'Route optimizer', 'Feedback loop'],
  },
  {
    heading: 'Docs',
    links: ['API reference', 'Data schema', 'Alert spec', 'Build sequence'],
  },
]

export default function Footer() {
  const ref = useRef()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' })

  return (
    <footer
      ref={ref}
      style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '5rem 2rem 3rem',
        maxWidth: 1200, margin: '0 auto',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Faint dot-grid BG */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.03, pointerEvents: 'none' }}>
        <defs>
          <pattern id="fdots" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.8" fill="var(--accent)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#fdots)"/>
      </svg>

      <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', justifyContent: 'space-between', position: 'relative' }}>

        {/* Brand column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          style={{ flex: '1 1 220px', maxWidth: 280 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                <circle cx="14" cy="14" r="3" fill="var(--accent)"/>
              </svg>
            </motion.div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
              Chain<span style={{ color: 'var(--accent)' }}>Sight</span>
            </span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Proactive supply chain intelligence. Continuously scoring shipments, detecting disruptions before they cascade, and generating optimized routing alternatives in real time.
          </p>
          {/* Status pill */}
          <motion.div
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--status-ok-dim)',
              border: '1px solid rgba(63,108,143,0.2)',
              borderRadius: 20, padding: '5px 14px',
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-ok)', display: 'block' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--status-ok)', letterSpacing: '0.12em' }}>
              ALL SYSTEMS NOMINAL
            </span>
          </motion.div>
        </motion.div>

        {/* Link columns */}
        {FOOTER_LINKS.map((col, ci) => (
          <motion.div
            key={col.heading}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 + ci * 0.08 }}
            style={{ flex: '1 1 130px' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--accent)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1.1rem' }}>
              {col.heading}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {col.links.map((link, li) => (
                <motion.a
                  key={link}
                  href="#"
                  initial={{ opacity: 0, x: -8 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + ci * 0.08 + li * 0.05 }}
                  whileHover={{ color: 'var(--text-primary)', x: 3 }}
                  style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: 'var(--text-tertiary)', textDecoration: 'none',
                    transition: 'color 0.15s',
                    display: 'block',
                  }}
                >
                  {link}
                </motion.a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          marginTop: '4rem', paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-faint)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
          © 2026 CHAINSIGHT MVP  -  SUPPLY CHAIN INTELLIGENCE
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {['DRS v1.4.2', 'Model refresh 06:14 UTC', 'API healthy'].map(tag => (
            <span key={tag} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em' }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </footer>
  )
}
