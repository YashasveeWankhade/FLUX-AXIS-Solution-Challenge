import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, QuadraticBezierLine, Grid, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { CheckCircle2, XCircle, ArrowRight, Zap, DollarSign, Clock, Leaf } from 'lucide-react';

const ALTERNATIVES = [
  { id: 'R1', label: 'RECOMMENDED', via: 'Port of Oakland', carrier: 'COSCO Shipping', etaDelta: '+6h', costDelta: '+$8,400', slaOk: true, co2Delta: '+2.1%', confidence: 91 },
  { id: 'R2', label: 'ALTERNATIVE', via: 'Port of Seattle', carrier: 'ONE Ocean Network', etaDelta: '+30h', costDelta: '+$3,100', slaOk: false, co2Delta: '+4.8%', confidence: 76 },
  { id: 'R3', label: 'AIR FREIGHT', via: 'LAX Air Cargo', carrier: 'FedEx Custom Critical', etaDelta: '-48h', costDelta: '+$94,200', slaOk: true, co2Delta: '+380%', confidence: 99 },
];

function getRouteGeometry(shipment, selectedAlternativeId) {
  const risk = shipment?.riskScore || 0.2;
  const spread = shipment ? Math.min(1.4, Math.max(0.35, Math.abs(shipment.origin.coords.lng - shipment.destination.coords.lng) / 120)) : 0.8;
  const routeBias = selectedAlternativeId === 'R1' ? -0.45 : selectedAlternativeId === 'R2' ? 0.42 : selectedAlternativeId === 'R3' ? -1.05 : 0;
  const heightBoost = selectedAlternativeId === 'R3' ? 1.15 : selectedAlternativeId ? 0.35 : 0;

  return {
    start: new THREE.Vector3(-4, 0, -spread),
    mid: new THREE.Vector3(0, 1.45 + risk * 2.6 + heightBoost, routeBias),
    end: new THREE.Vector3(4, 0, spread),
  };
}

function TouchSphere({ position, label, color, onSelectVisual }) {
  return (
    <group
      position={position}
      onPointerDown={event => {
        event.stopPropagation();
        onSelectVisual(label);
      }}
    >
      <Sphere args={[0.16, 20, 20]}>
        <meshStandardMaterial color={color} roughness={0.45} />
      </Sphere>
      <Text position={[0, 0.34, 0]} fontSize={0.14} color="#647084" anchorX="center">
        {label}
      </Text>
    </group>
  );
}

function MovingShipment({ shipment, geometry, selectedAlternativeId, onSelectVisual }) {
  const groupRef = useRef(null);
  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(geometry.start, geometry.mid, geometry.end), [geometry]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const drift = (clock.elapsedTime * 0.018) % 1;
    const progress = ((shipment?.progress || 0.5) + drift) % 1;
    const point = curve.getPoint(progress);
    const tangent = curve.getTangent(progress);
    groupRef.current.position.copy(point);
    groupRef.current.rotation.y = Math.atan2(tangent.x, tangent.z);
    groupRef.current.position.y += Math.sin(clock.elapsedTime * 2.1) * 0.035;
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={event => {
        event.stopPropagation();
        onSelectVisual(`Shipment ${shipment?.id || ''} on ${selectedAlternativeId || 'current route'}`);
      }}
    >
      <mesh>
        <boxGeometry args={[0.48, 0.18, 0.26]} />
        <meshStandardMaterial color="#172033" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.2, 0.18, 0.2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.38} />
      </mesh>
    </group>
  );
}

function AlternativeArc({ option, geometry, active, onSelectAlternative, onSelectVisual }) {
  const offset = option.id === 'R1' ? -0.7 : option.id === 'R2' ? 0.7 : -1.35;
  const altitude = option.id === 'R3' ? 1.4 : option.id === 'R2' ? 0.55 : 0.35;
  const color = active ? '#3f6c8f' : option.slaOk ? '#4f7f94' : '#b7791f';
  const start = [geometry.start.x, geometry.start.y + 0.05, geometry.start.z + offset * 0.25];
  const mid = [geometry.mid.x, geometry.mid.y + altitude, offset];
  const end = [geometry.end.x, geometry.end.y + 0.05, geometry.end.z + offset * 0.25];

  return (
    <group
      onPointerDown={event => {
        event.stopPropagation();
        onSelectAlternative(option.id);
        onSelectVisual(`${option.label}: ${option.via}`);
      }}
    >
      <QuadraticBezierLine start={start} end={end} mid={mid} color={color} lineWidth={active ? 3 : 1.2} transparent opacity={active ? 0.95 : 0.42} />
      {active && <Text position={[0, mid[1] + 0.28, mid[2]]} fontSize={0.16} color="#3f6c8f" anchorX="center">{option.via}</Text>}
    </group>
  );
}

function Scene({ shipment, selectedAlternativeId, alternatives, onSelectAlternative, onSelectVisual }) {
  const geometry = useMemo(() => getRouteGeometry(shipment, selectedAlternativeId), [shipment, selectedAlternativeId]);
  const riskColor = (shipment?.riskScore || 0) > 0.4 ? '#b7791f' : '#3f6c8f';

  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[8, 8, 8]} intensity={1.1} />
      <OrbitControls
        makeDefault
        enableZoom
        enablePan
        autoRotate
        autoRotateSpeed={0.3}
        minDistance={5}
        maxDistance={12}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      />
      <Grid infiniteGrid sectionSize={1} fadeDistance={20} sectionColor="#cbd5e1" cellColor="#e5eaf1" />
      <QuadraticBezierLine start={geometry.start.toArray()} end={geometry.end.toArray()} mid={geometry.mid.toArray()} color={riskColor} lineWidth={2.2} />
      {alternatives.map(option => (
        <AlternativeArc
          key={option.id}
          option={option}
          geometry={geometry}
          active={selectedAlternativeId === option.id}
          onSelectAlternative={onSelectAlternative}
          onSelectVisual={onSelectVisual}
        />
      ))}
      <TouchSphere position={geometry.start.toArray()} label={shipment?.origin.id || 'ORG'} color="#3f6c8f" onSelectVisual={onSelectVisual} />
      <TouchSphere position={geometry.mid.toArray()} label="ETA risk apex" color="#b7791f" onSelectVisual={onSelectVisual} />
      <TouchSphere position={geometry.end.toArray()} label={shipment?.destination.id || 'DST'} color="#7a6670" onSelectVisual={onSelectVisual} />
      <MovingShipment shipment={shipment} geometry={geometry} selectedAlternativeId={selectedAlternativeId} onSelectVisual={onSelectVisual} />
      <Text position={[0, -0.06, -2.7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.14} color="#647084" anchorX="center">
        touch route arcs to select alternatives
      </Text>
    </>
  );
}

export default function RoutesPage() {
  const { shipments, executeReroute } = useAppStore();
  const [idx, setIdx] = useState(0);
  const [selectedAlt, setSelectedAlt] = useState(null);
  const [executed, setExecuted] = useState(false);
  const [visualFocus, setVisualFocus] = useState('Current route');

  const s = shipments[idx] || shipments[0];

  const handleExecute = () => {
    if (!selectedAlt || !s) return;
    executeReroute(s.id, selectedAlt);
    setExecuted(true);
    setTimeout(() => { setExecuted(false); setSelectedAlt(null); }, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '280px 1fr 360px' }}>

      {/* Left: Queue */}
      <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px' }}>ROUTE_QUEUE</h2>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>{shipments.length} active routes</div>
        </div>
        <div className="scroll-area" style={{ flex: 1 }}>
          {shipments.map((sh, i) => {
            const risk = Math.round(sh.riskScore * 100);
            return (
              <div key={sh.id} onClick={() => { setIdx(i); setSelectedAlt(null); setExecuted(false); }}
                style={{
                  padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', background: idx === i ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: idx === i ? '2px solid var(--accent-1)' : '2px solid transparent',
                  transition: 'all 0.1s',
                }}>
                <div className="flex-between" style={{ marginBottom: '3px' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: '12px' }}>{sh.id}</span>
                  <span className="mono" style={{ fontSize: '10px', color: risk > 75 ? 'var(--critical-muted)' : risk > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)' }}>DRS:{risk}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sh.origin.id}  to  {sh.destination.id}</div>
                <div className="risk-bar-wrap" style={{ marginTop: '6px' }}>
                  <div className="risk-bar-fill" style={{ width: `${sh.progress * 100}%`, background: 'var(--accent-1)' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: 3D viz */}
      <div style={{ background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>ROUTE_VISUALIZATION</div>
            {s && <div style={{ fontWeight: 600, fontSize: '14px', marginTop: '2px' }}>{s.origin.name}  to  {s.destination.name}</div>}
          </div>
          {s && <div className={`status-pill status-${s.status}`}>{s.status}</div>}
        </div>
        <div style={{ flex: 1, position: 'relative', touchAction: 'none', minHeight: 0, height: '100%' }}>
          <Canvas camera={{ position: [0, 5, 9], fov: 46 }} dpr={[1, 1.75]} gl={{ antialias: true }} style={{ position: 'absolute', inset: 0, touchAction: 'none' }}>
            <Scene
              shipment={s}
              selectedAlternativeId={selectedAlt}
              alternatives={ALTERNATIVES}
              onSelectAlternative={setSelectedAlt}
              onSelectVisual={setVisualFocus}
            />
          </Canvas>
          <div className="panel" style={{ position: 'absolute', top: 14, left: 14, padding: '12px', width: 260, background: 'rgba(255,255,255,0.9)', pointerEvents: 'none' }}>
            <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: 4 }}>3D FOCUS</div>
            <div style={{ fontSize: '13px', fontWeight: 700 }}>{visualFocus}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
              {selectedAlt ? `${selectedAlt} selected. Execute from the action rail.` : 'Tap an arc, node, or moving vessel to inspect it.'}
            </div>
          </div>
        </div>
        {/* Telemetry overlay */}
        {s && (
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', display: 'flex', gap: '12px' }}>
            {[
              { icon: Clock, label: 'PROGRESS', value: `${Math.round(s.progress * 100)}%` },
              { icon: DollarSign, label: 'VALUE', value: s.value },
              { icon: Zap, label: 'DRS', value: s.drs },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 14px', backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-tight)' }}>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Alternatives */}
      <div style={{ borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '14px' }}>AI_RECOMMENDATION</h2>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>Select an alternative route</div>
        </div>
        <div className="scroll-area" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {executed ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', color: 'var(--stable-muted)' }}>
              <CheckCircle2 size={48} strokeWidth={1.5} />
              <div style={{ fontWeight: 700, fontSize: '15px' }}>REROUTE EXECUTED</div>
              <div className="mono" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Carrier notified  -  ETA updated</div>
            </motion.div>
          ) : (
            ALTERNATIVES.map(alt => {
              const isSelected = selectedAlt === alt.id;
              return (
                <div key={alt.id} onClick={() => setSelectedAlt(alt.id)}
                  style={{
                    background: isSelected ? 'var(--bg-accent)' : 'var(--bg-panel-2)',
                    border: `1px solid ${isSelected ? 'var(--accent-1)' : 'var(--border-subtle)'}`,
                    borderRadius: '6px', padding: '16px', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span className="badge badge-blue">{alt.label}</span>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--stable-muted)' }}>{alt.confidence}%</span>
                  </div>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{alt.via}</div>
                  <div className="mono" style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px' }}>{alt.carrier}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[['ETA Delta', alt.etaDelta], ['Cost Delta', alt.costDelta], ['CO2 Delta', alt.co2Delta], ['SLA', alt.slaOk ? 'COMPLIANT' : 'BREACH']].map(([k, v]) => (
                      <div key={k}>
                        <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{k}</div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: k === 'SLA' ? (alt.slaOk ? 'var(--stable-muted)' : 'var(--critical-muted)') : 'var(--text-main)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!executed && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              disabled={!selectedAlt} onClick={handleExecute}>
              <ArrowRight size={15} /> EXECUTE REROUTE
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
