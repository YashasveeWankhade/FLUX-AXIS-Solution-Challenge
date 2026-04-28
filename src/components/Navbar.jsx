import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Overview',  href: '#overview'  },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Features',  href: '#features'  },
  { label: 'Data',      href: '#metrics'   },
]

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [activeId, setActiveId]       = useState('overview')
  const [menuOpen, setMenuOpen]       = useState(false)
  const scrollY = useMotionValue(0)

  // Track scroll for blur/border transition
  useEffect(() => {
    const onScroll = () => {
      scrollY.set(window.scrollY)
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver to highlight active section
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    sections.forEach(s => io.observe(s))
    return () => io.disconnect()
  }, [])

  const bgOpacity = useTransform(scrollY, [0, 80], [0, 1])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 2rem', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Backdrop */}
      <motion.div
        style={{
          position: 'absolute', inset: 0, zIndex: -1,
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(16px)',
          opacity: bgOpacity,
        }}
      />

      {/* Logo */}
      <motion.a
        href="#overview"
        whileHover={{ scale: 1.02 }}
        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
      >
        {/* Animated logo mark */}
        <motion.div
          animate={{ rotate: [0, 120, 240, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ width: 28, height: 28, position: 'relative' }}
        >
          <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
            <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
            <polygon points="14,7 21,11 21,18 14,22 7,18 7,11" fill="var(--accent)" opacity="0.2"/>
            <circle cx="14" cy="14" r="3" fill="var(--accent)"/>
          </svg>
        </motion.div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
          Chain<span style={{ color: 'var(--accent)' }}>Sight</span>
        </span>
      </motion.a>

      {/* Desktop nav links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {NAV_LINKS.map((link, i) => (
          <motion.a
            key={link.label}
            href={link.href}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
            style={{
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: activeId === link.href.slice(1) ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s',
              position: 'relative',
              padding: '4px 0',
            }}
          >
            {link.label}
            <AnimatePresence>
              {activeId === link.href.slice(1) && (
                <motion.span
                  layoutId="nav-underline"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  style={{
                    position: 'absolute', bottom: -2, left: 0, right: 0,
                    height: '1px', background: 'var(--accent)',
                    transformOrigin: 'left',
                  }}
                />
              )}
            </AnimatePresence>
          </motion.a>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.04, boxShadow: 'var(--accent-glow)' }}
        whileTap={{ scale: 0.97 }}
        onClick={() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' })}
        style={{
          background: 'var(--accent)', color: '#030A10',
          border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '7px 18px',
          fontFamily: 'var(--font-display)', fontSize: '0.8rem',
          letterSpacing: '0.06em', cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        Live Dashboard
      </motion.button>
    </motion.nav>
  )
}
