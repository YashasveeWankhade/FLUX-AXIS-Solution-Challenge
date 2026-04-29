import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, Grid, Cylinder, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Anchor, TrendingUp, Wind, Ship, AlertTriangle } from 'lucide-react';

const TERMINAL_COLORS = ['#3f6c8f', '#7a6670', '#4f7f94', '#b7791f'];

function TouchTarget({ children, payload, onSelectZone }) {
  return (
    <group
      onPointerDown={event => {
        event.stopPropagation();
        onSelectZone(payload);
      }}
    >
      {children}
    </group>
  );
}

function ContainerStack({ stack, selected, onSelectZone }) {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = selected ? 1 + Math.sin(clock.elapsedTime * 4) * 0.035 : 1;
    groupRef.current.scale.setScalar(pulse);
  });

  return (
    <TouchTarget payload={stack} onSelectZone={onSelectZone}>
      <group ref={groupRef} position={stack.position}>
        {Array.from({ length: stack.height }).map((_, levelIndex) => (
          <Box key={levelIndex} args={[0.52, 0.22, 0.34]} position={[0, levelIndex * 0.24 + 0.12, 0]}>
            <meshStandardMaterial color={TERMINAL_COLORS[(stack.index + levelIndex) % TERMINAL_COLORS.length]} roughness={0.62} metalness={0.08} />
          </Box>
        ))}
        {selected && (
          <Box args={[0.64, stack.height * 0.25, 0.44]} position={[0, stack.height * 0.12, 0]}>
            <meshBasicMaterial color="#3f6c8f" transparent opacity={0.12} wireframe />
          </Box>
        )}
      </group>
    </TouchTarget>
  );
}

function BerthLane({ berth, selected, onSelectZone }) {
  return (
    <TouchTarget payload={berth} onSelectZone={onSelectZone}>
      <group position={berth.position}>
        <Box args={[0.72, 0.08, 0.42]}>
          <meshStandardMaterial color={berth.occupied ? '#b7791f' : '#cbd5e1'} roughness={0.75} />
        </Box>
        <Cylinder args={[0.04, 0.04, 0.8, 16]} rotation={[Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.08, 0]}>
          <meshStandardMaterial color={selected ? '#3f6c8f' : '#647084'} roughness={0.55} />
        </Cylinder>
      </group>
    </TouchTarget>
  );
}

function AnimatedVessel({ port, selected, onSelectZone }) {
  const vesselRef = useRef(null);

  useFrame(({ clock }) => {
    if (!vesselRef.current) return;
    vesselRef.current.position.x = -1.9 + Math.sin(clock.elapsedTime * 0.55) * 0.25;
    vesselRef.current.position.y = 0.16 + Math.sin(clock.elapsedTime * 1.8) * 0.025;
    vesselRef.current.rotation.z = Math.sin(clock.elapsedTime * 0.9) * 0.025;
  });

  const payload = {
    id: 'vessel-flow',
    label: 'Vessel Flow',
    value: `${Math.max(1, Math.round(port.vessels * port.congestion * 0.3))} queued vessels`,
    detail: `${port.vessels} active vessels around ${port.name}`,
  };

  return (
    <TouchTarget payload={payload} onSelectZone={onSelectZone}>
      <group ref={vesselRef} position={[-1.9, 0.16, 1.55]}>
        <Box args={[1.08, 0.18, 0.34]} position={[0, 0.08, 0]}>
          <meshStandardMaterial color={selected ? '#3f6c8f' : '#4f7f94'} roughness={0.48} />
        </Box>
        <Box args={[0.34, 0.22, 0.28]} position={[0.18, 0.27, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.42} />
        </Box>
      </group>
    </TouchTarget>
  );
}

function Crane({ selected, onSelectZone }) {
  const craneRef = useRef(null);

  useFrame(({ clock }) => {
    if (!craneRef.current) return;
    craneRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.4) * 0.08;
  });

  return (
    <TouchTarget
      payload={{ id: 'crane-cycle', label: 'Crane Cycle', value: 'Live lift path', detail: 'Tap yard stacks or berth lanes to inspect operating zones.' }}
      onSelectZone={onSelectZone}
    >
      <group ref={craneRef} position={[2.05, 0, -0.25]}>
        <Box args={[0.1, 1.9, 0.1]} position={[0, 0.95, 0]}>
          <meshStandardMaterial color={selected ? '#3f6c8f' : '#647084'} roughness={0.58} />
        </Box>
        <Box args={[1.45, 0.1, 0.1]} position={[-0.58, 1.85, 0]}>
          <meshStandardMaterial color="#647084" roughness={0.58} />
        </Box>
        <Box args={[0.08, 0.55, 0.08]} position={[-1.18, 1.55, 0]}>
          <meshStandardMaterial color="#b7791f" roughness={0.55} />
        </Box>
      </group>
    </TouchTarget>
  );
}

function PortScene({ port, selectedZone, onSelectZone }) {
  const congestion = port.congestion;
  const containerStacks = useMemo(() => {
    const stackCount = Math.max(5, Math.round(congestion * 10) + 4);
    return Array.from({ length: stackCount }).map((_, index) => {
      const rowIndex = Math.floor(index / 4);
      const columnIndex = index % 4;
      const height = 1 + ((index + Math.round(port.throughput / 1000)) % 4) + Math.round(congestion * 2);
      return {
        id: `yard-${index}`,
        index,
        label: `Yard Stack ${index + 1}`,
        value: `${height * 24} TEU active`,
        detail: `${Math.round(congestion * 100)}% congestion pressure at ${port.name}`,
        height,
        position: [columnIndex * 0.62 - 1.0, 0, rowIndex * -0.52 - 0.35],
      };
    });
  }, [congestion, port.name, port.throughput]);

  const berthLanes = useMemo(() => {
    const visibleBerths = Math.min(8, Math.max(4, Math.round(port.berths / 6)));
    const occupied = Math.round(visibleBerths * congestion);
    return Array.from({ length: visibleBerths }).map((_, index) => ({
      id: `berth-${index}`,
      label: `Berth ${index + 1}`,
      value: index < occupied ? 'Occupied' : 'Open window',
      detail: index < occupied ? 'Vessel operation in progress' : 'Available for allocation',
      occupied: index < occupied,
      position: [index * 0.82 - 2.8, 0.05, 1.05],
    }));
  }, [congestion, port.berths]);

  return (
    <>
      <ambientLight intensity={0.78} />
      <directionalLight position={[4, 7, 5]} intensity={1.1} />
      <OrbitControls
        makeDefault
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={0.35}
        minDistance={4}
        maxDistance={10}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <Grid infiniteGrid sectionSize={1} fadeDistance={15} sectionColor="#cbd5e1" cellColor="#e5eaf1" position={[0, -0.01, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 1.55]}>
        <planeGeometry args={[7, 1.4]} />
        <meshStandardMaterial color="#dfeaf2" roughness={0.92} />
      </mesh>
      {berthLanes.map(berth => (
        <BerthLane key={berth.id} berth={berth} selected={selectedZone?.id === berth.id} onSelectZone={onSelectZone} />
      ))}
      {containerStacks.map(stack => (
        <ContainerStack key={stack.id} stack={stack} selected={selectedZone?.id === stack.id} onSelectZone={onSelectZone} />
      ))}
      <AnimatedVessel port={port} selected={selectedZone?.id === 'vessel-flow'} onSelectZone={onSelectZone} />
      <Crane selected={selectedZone?.id === 'crane-cycle'} onSelectZone={onSelectZone} />
      <Text position={[0, 0.02, -2.55]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.16} color="#647084" anchorX="center">
        {port.id} terminal operating model
      </Text>
    </>
  );
}

function Meter({ label, value, max, color, suffix = '' }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '5px' }}>
        <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontWeight: 700, fontSize: '13px', color }}>{value}{suffix}</span>
      </div>
      <div className="risk-bar-wrap">
        <div className="risk-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function PortsPage() {
  const { ports, requestBerthAllocation, createAlert } = useAppStore();
  const [pid, setPid] = useState(ports[0]?.id || 'SHA');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [allocationStatus, setAllocationStatus] = useState({});
  const [alertedPorts, setAlertedPorts] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const port = ports.find(p => p.id === pid) || ports[0];

  if (!port) return null;

  const congPct = Math.round(port.congestion * 100);
  const congColor = congPct > 70 ? 'var(--critical-muted)' : congPct > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)';
  const vesselQueue = Math.round(port.vessels * port.congestion * 0.3);

  const handleBerthRequest = () => {
    requestBerthAllocation(port.id);
    setAllocationStatus(state => ({
      ...state,
      [port.id]: `Request queued for Berth ${Math.max(1, Math.round(port.berths * (1 - port.congestion)))} at ${new Date().toLocaleTimeString()}`,
    }));
  };

  const handleIssueAlert = () => {
    createAlert({
      shipmentId: `PORT-${port.id}`,
      severity: congPct > 70 ? 'CRITICAL' : 'WARNING',
      message: `${port.name} congestion alert - queue at ${vesselQueue} vessels and ${congPct}% utilization.`,
    });
    setAlertedPorts(state => ({ ...state, [port.id]: true }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '280px 1fr' }}>

      {/* Left: Port list */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px' }}>TERMINAL_INVENTORY</h2>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>{ports.length} global terminals</div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {ports.map(p => {
            const pct = Math.round(p.congestion * 100);
            const c = pct > 70 ? 'var(--critical-muted)' : pct > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)';
            return (
              <div key={p.id} onClick={() => { setPid(p.id); setSelectedZone(null); }}
                style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', background: pid === p.id ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: pid === p.id ? '2px solid var(--accent-1)' : '2px solid transparent',
                  transition: 'all 0.1s',
                }}>
                <div className="flex-between" style={{ marginBottom: '3px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{p.name}</span>
                  <span className="mono" style={{ fontSize: '10px', color: c }}>{pct}%</span>
                </div>
                <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '6px' }}>{p.region}</div>
                <div className="risk-bar-wrap">
                  <div className="risk-bar-fill" style={{ width: `${pct}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Detail */}
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginBottom: '4px' }}>PORT_INTELLIGENCE</div>
          <div className="flex-between">
            <div>
              <h1 style={{ fontSize: '24px' }}>{port.name}</h1>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>{port.region}</div>
            </div>
            <div className={`status-pill status-${congPct > 70 ? 'critical' : congPct > 40 ? 'warning' : 'stable'}`} style={{ fontSize: '12px', padding: '6px 14px' }}>
              {port.congestionLabel}
            </div>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metrics grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {[
              { icon: TrendingUp, label: 'CONGESTION', value: `${congPct}%`, color: congColor },
              { icon: Ship, label: 'VESSELS', value: port.vessels, color: 'var(--accent-3)' },
              { icon: Anchor, label: 'BERTHS', value: port.berths, color: 'var(--accent-1)' },
              { icon: Wind, label: 'WEATHER', value: port.weather, color: 'var(--text-main)' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="metric-card">
                <Icon size={18} style={{ color }} />
                <div className="metric-value" style={{ color, fontSize: '22px' }}>{value}</div>
                <div className="metric-label">{label}</div>
              </div>
            ))}
          </div>

          {/* 3D viz */}
          <div style={{ height: '360px', background: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden', position: 'relative', touchAction: 'none' }}>
            <Canvas camera={{ position: [4.8, 4.4, 6.2], fov: 42 }} dpr={[1, 1.75]} gl={{ antialias: true }} style={{ touchAction: 'none' }}>
              <PortScene port={port} selectedZone={selectedZone} onSelectZone={setSelectedZone} />
            </Canvas>
            <div style={{ position: 'absolute', top: 14, left: 14, width: 260, pointerEvents: 'none' }}>
              <div className="panel" style={{ padding: '12px', background: 'rgba(255,255,255,0.9)' }}>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: 4 }}>TOUCH TARGET</div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{selectedZone?.label || 'Terminal Overview'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>{selectedZone?.detail || 'Tap a berth, vessel, crane, or stack to inspect live zone data.'}</div>
                {selectedZone?.value && <div className="badge badge-blue" style={{ marginTop: 8 }}>{selectedZone.value}</div>}
              </div>
            </div>
          </div>

          {/* Operational meters */}
          <div className="panel-2" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>OPERATIONAL METRICS</div>
            <Meter label="BERTH UTILIZATION" value={congPct} max={100} color={congColor} suffix="%" />
            <Meter label="THROUGHPUT (TEU/month)" value={port.throughput} max={50000} color="var(--accent-1)" />
            <Meter label="VESSEL QUEUE" value={vesselQueue} max={30} color="var(--warning-muted)" />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={handleBerthRequest}>REQUEST BERTH ALLOCATION</button>
            <button className="btn" onClick={() => setScheduleOpen(open => !open)}>
              {scheduleOpen ? 'HIDE VESSEL SCHEDULE' : 'VIEW VESSEL SCHEDULE'}
            </button>
            {congPct > 60 && (
              <button className="btn btn-danger" onClick={handleIssueAlert} disabled={alertedPorts[port.id]}>
                <AlertTriangle size={14} /> {alertedPorts[port.id] ? 'ALERT ISSUED' : 'ISSUE CONGESTION ALERT'}
              </button>
            )}
          </div>

          {(allocationStatus[port.id] || scheduleOpen) && (
            <div className="panel-2" style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {allocationStatus[port.id] && (
                <div className="badge badge-green" style={{ alignSelf: 'flex-start' }}>{allocationStatus[port.id]}</div>
              )}
              {scheduleOpen && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['ARRIVING', 'BERTHING', 'DEPARTING'].map((stage, index) => (
                    <div key={stage} style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', background: 'var(--bg-elevated)' }}>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>{stage}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>{Math.max(1, Math.round(vesselQueue / (index + 2)))} vessels</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Next window: {index + 2}h</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
