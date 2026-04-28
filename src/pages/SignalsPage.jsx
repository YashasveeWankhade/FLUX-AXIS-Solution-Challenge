import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Line } from '@react-three/drei';
import * as THREE from 'three';

export default function SignalsPage() {
  const points = [];
  for (let i = 0; i < 20; i++) {
    for (let j = 0; j < 20; j++) {
      points.push(new THREE.Vector3((i-10)*0.5, Math.sin(i*0.5)*Math.cos(j*0.5), (j-10)*0.5));
    }
  }

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 400px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 10 }}>
          <div className="mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>NEURAL_RISK_PROJECTION</div>
          <h1 style={{ fontSize: '32px' }}>Risk Topology</h1>
        </div>
        <Canvas camera={{ position: [8, 8, 8] }}>
          <OrbitControls autoRotate />
          <Grid infiniteGrid />
          {points.slice(0, 380).map((p, i) => (
             i % 20 !== 19 && <Line key={i} points={[p, points[i+1]]} color="#000" lineWidth={0.5} transparent opacity={0.2} />
          ))}
        </Canvas>
      </div>
      <div className="panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '24px' }}>THREAT_PROJECTION</h2>
        <div className="panel" style={{ padding: '24px', background: 'black', color: 'white' }}>
          <div style={{ fontWeight: 700, marginBottom: '8px' }}>AUTONOMOUS_ADVISORY</div>
          <p style={{ fontSize: '12px', opacity: 0.8 }}>Shift Pacific allocation by 14% to avoid projected congestion.</p>
        </div>
      </div>
    </div>
  );
}
