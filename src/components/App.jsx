import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import '../styles/globals.css'

import Navbar          from './Navbar'
import HeroSection     from './HeroSection'
import FeaturesSection from './FeaturesSection'
import DashboardSection from './DashboardSection'
import MetricsSection  from './MetricsSection'
import Footer          from './Footer'

// -- Cursor glow that follows the mouse ---------------------------------------
function CursorGlow() {
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 120, damping: 18 })
  const sy = useSpring(y, { stiffness: 120, damping: 18 })

  useEffect(() => {
    const onMove = (e) => { x.set(e.clientX); y.set(e.clientY) }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <motion.div
      style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 0,
        width: 480, height: 480, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(63,108,143,0.045) 0%, transparent 70%)',
        translateX: '-50%', translateY: '-50%',
        left: sx, top: sy,
      }}
    />
  )
}

// -- Page transition wrapper ---------------------------------------------------
function PageReveal({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// -- Scroll-to-top button ------------------------------------------------------
function ScrollTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0 }}
      whileHover={{ scale: 1.1, boxShadow: 'var(--accent-glow)' }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 90,
        width: 44, height: 44, borderRadius: '50%',
        background: 'var(--accent)', border: 'none',
        color: '#030A10', fontSize: '1.1rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 16px rgba(63,108,143,0.3)',
      }}
    >
      up
    </motion.button>
  )
}

// -- Vertical section divider -------------------------------------------------
function SectionDivider() {
  return (
    <div style={{
      width: '100%', height: '1px',
      background: 'linear-gradient(90deg, transparent, var(--border-subtle), transparent)',
      margin: '0 auto', maxWidth: 1200,
    }}/>
  )
}

// -- App -----------------------------------------------------------------------
export default function App() {
  return (
    <PageReveal>
      {/* Ambient cursor glow  -  desktop only */}
      <CursorGlow />

      {/* Fixed nav */}
      <Navbar />

      {/* Main content */}
      <main>
        <HeroSection />
        <SectionDivider />
        <DashboardSection />
        <SectionDivider />
        <FeaturesSection />
        <SectionDivider />
        <MetricsSection />
      </main>

      {/* Footer */}
      <SectionDivider />
      <Footer />

      {/* Scroll to top */}
      <ScrollTop />
    </PageReveal>
  )
}
