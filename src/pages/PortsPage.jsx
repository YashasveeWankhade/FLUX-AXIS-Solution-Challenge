import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid } from '@react-three/drei';

export default function PortsPage() {
  const { ports } = useAppStore();
  const [pid, setPid] = useState(ports[0]?.id || 'SHA');
  const port = ports.find(p => p.id === pid) || ports[0];

  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '320px 1fr' }}>
      <div className="panel" style={{ borderTop: 'none', borderLeft: 'none', borderBottom: 'none' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px' }}>TERMINAL_INVENTORY</h2>
        </div>
        <div className="scroll-area" style={{ height: 'calc(100% - 64px)' }}>
          {ports.map(p => (
            <div key={p.id} onClick={() => setPid(p.id)} style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', background: pid === p.id ? 'white' : 'transparent', borderLeft: pid === p.id ? '4px solid black' : '4px solid transparent' }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div className="mono" style={{ fontSize: '10px' }}>CONGESTION: {(p.congestion * 100).toFixed(0)}%</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <h1 style={{ fontSize: '28px' }}>{port.name} Operational View</h1>
        <div className="panel" style={{ height: '400px', background: 'white' }}>
          <Canvas camera={{ position: [5, 5, 5] }}>
            <OrbitControls />
            <Grid infiniteGrid />
            <Box position={[0, 1, 0]} args={[2, 2, 2]}><meshBasicMaterial color="black" wireframe /></Box>
          </Canvas>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="panel" style={{ padding: '20px' }}>
            <div className="mono" style={{ fontSize: '10px' }}>UTILIZATION</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{(port.congestion * 100).toFixed(1)}%</div>
          </div>
          <div className="panel" style={{ padding: '20px' }}>
            <div className="mono" style={{ fontSize: '10px' }}>VESSELS</div>
            <div style={{ fontSize: '24px', fontWeight: 800 }}>{port.vessels}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
