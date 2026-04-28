import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Grid } from '@react-three/drei';
import * as THREE from 'three';

export default function RoutesPage() {
  const { shipments } = useAppStore();
  const [idx, setIdx] = useState(0);
  const s = shipments[idx] || shipments[0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '100%', display: 'grid', gridTemplateColumns: '320px 1fr 340px' }}>
      <div className="panel" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px' }}>ROUTE_QUEUE</h2>
        </div>
        <div className="scroll-area" style={{ height: 'calc(100% - 64px)' }}>
          {shipments.slice(0, 10).map((sh, i) => (
            <div key={sh.id} onClick={() => setIdx(i)} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: idx === i ? 'var(--bg-accent)' : 'transparent' }}>
              <div className="mono" style={{ fontWeight: 700 }}>{sh.id}</div>
              <div className="mono" style={{ fontSize: '10px' }}>{sh.origin.id} → {sh.destination.id}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'white' }}>
        <Canvas camera={{ position: [5, 5, 5] }}>
          <OrbitControls />
          <Grid infiniteGrid sectionSize={1} fadeDistance={20} />
          <QuadraticBezierLine start={[-4, 0, 0]} end={[4, 0, 0]} mid={[0, 3, 0]} color="black" lineWidth={2} />
        </Canvas>
      </div>
      <div className="panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h3 style={{ fontSize: '13px' }}>AI_RECOMMENDATION</h3>
        <div className="panel" style={{ padding: '20px', background: '#F8F9FA' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>Alternative Route A</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Confidence: 94%. Optimal balance between cost and ETA.</p>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 'auto', padding: '16px' }}>EXECUTE_REROUTE</button>
      </div>
    </motion.div>
  );
}
