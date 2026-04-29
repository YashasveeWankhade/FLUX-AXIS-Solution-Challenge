import React, { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { BrainCircuit, TrendingUp, AlertTriangle, ShieldCheck, Zap, ChevronRight } from 'lucide-react';

const PREDICTIONS = [
  { id: 'P1', route: 'SHA  to  LAX', riskNow: 72, riskForecast: 88, timeframe: '+24h', driver: 'Typhoon Koinu landfall', action: 'Reroute via Oakland', confidence: 94, critical: true },
  { id: 'P2', route: 'DXB  to  RTM', riskNow: 55, riskForecast: 78, timeframe: '+48h', driver: 'Suez Canal congestion surge', action: 'Cape of Good Hope alternative', confidence: 87, critical: true },
  { id: 'P3', route: 'SIN  to  SYD', riskNow: 32, riskForecast: 61, timeframe: '+72h', driver: 'Port Botany berth shortage', action: 'Brisbane diversion', confidence: 76, critical: false },
  { id: 'P4', route: 'NYC  to  RTM', riskNow: 18, riskForecast: 28, timeframe: '+5d', driver: 'North Atlantic weather system', action: 'Southern route +4h', confidence: 68, critical: false },
];

const PREDICTION_POINTS = {
  P1: new THREE.Vector3(-2.9, 0, -1.6),
  P2: new THREE.Vector3(0.75, 0, 0.8),
  P3: new THREE.Vector3(2.6, 0, 1.65),
  P4: new THREE.Vector3(-1.45, 0, 1.25),
};

function heatColor(value) {
  const cold = new THREE.Color('#dfeaf2');
  const mid = new THREE.Color('#b7791f');
  const hot = new THREE.Color('#c2414b');
  if (value < 0.55) return cold.lerp(mid, value / 0.55);
  return mid.lerp(hot, (value - 0.55) / 0.45);
}

function riskAtPoint(pointX, pointZ, time, predictions, selectedPredictionId) {
  let value = 0.1 + Math.sin(pointX * 1.2 + time * 0.7) * 0.04 + Math.cos(pointZ * 1.5 - time * 0.45) * 0.04;
  predictions.forEach(prediction => {
    const hotspot = PREDICTION_POINTS[prediction.id];
    const distanceSq = (pointX - hotspot.x) ** 2 + (pointZ - hotspot.z) ** 2;
    const forecastWeight = prediction.riskForecast / 100;
    const selectedBoost = selectedPredictionId === prediction.id ? 0.2 : 0;
    value += Math.exp(-distanceSq / 1.35) * (forecastWeight * 0.72 + selectedBoost);
  });
  return Math.max(0, Math.min(1, value));
}

function RiskSurface({ predictions, selectedPredictionId, onInspectCell }) {
  const gridSegments = 34;

  const geometry = useMemo(() => {
    const surfaceGeometry = new THREE.PlaneGeometry(9.5, 9.5, gridSegments, gridSegments);
    surfaceGeometry.rotateX(-Math.PI / 2);
    const colors = new Float32Array(surfaceGeometry.attributes.position.count * 3);
    surfaceGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return surfaceGeometry;
  }, []);

  useFrame(({ clock }) => {
    const surfaceGeometry = geometry;
    const positions = surfaceGeometry.attributes.position;
    const colors = surfaceGeometry.attributes.color;
    const time = clock.elapsedTime;

    for (let vertexIndex = 0; vertexIndex < positions.count; vertexIndex += 1) {
      const pointX = positions.getX(vertexIndex);
      const pointZ = positions.getZ(vertexIndex);
      const risk = riskAtPoint(pointX, pointZ, time, predictions, selectedPredictionId);
      const elevation = risk * 1.8 + Math.sin(pointX * 1.7 + time) * 0.045;
      const color = heatColor(risk);
      positions.setY(vertexIndex, elevation);
      colors.setXYZ(vertexIndex, color.r, color.g, color.b);
    }

    positions.needsUpdate = true;
    colors.needsUpdate = true;
    surfaceGeometry.computeVertexNormals();
  });

  return (
    <mesh
      geometry={geometry}
      onPointerDown={event => {
        event.stopPropagation();
        const risk = riskAtPoint(event.point.x, event.point.z, performance.now() * 0.001, predictions, selectedPredictionId);
        onInspectCell({
          label: 'Risk Cell',
          value: `${Math.round(risk * 100)}% forecast pressure`,
          detail: `x ${event.point.x.toFixed(1)}, z ${event.point.z.toFixed(1)}`,
        });
      }}
    >
      <meshStandardMaterial vertexColors side={THREE.DoubleSide} roughness={0.76} metalness={0.03} />
    </mesh>
  );
}

function PredictionMarker({ prediction, selected, onSelectPrediction, onInspectCell }) {
  const markerRef = useRef(null);
  const point = PREDICTION_POINTS[prediction.id];

  useFrame(({ clock }) => {
    if (!markerRef.current) return;
    const pulse = selected ? 1.25 + Math.sin(clock.elapsedTime * 5) * 0.08 : 1 + Math.sin(clock.elapsedTime * 2 + prediction.riskNow) * 0.04;
    markerRef.current.scale.setScalar(pulse);
    markerRef.current.position.y = 0.35 + prediction.riskForecast / 100 + Math.sin(clock.elapsedTime * 1.4) * 0.05;
  });

  return (
    <group
      ref={markerRef}
      position={[point.x, 0.8, point.z]}
      onPointerDown={event => {
        event.stopPropagation();
        onSelectPrediction(selected ? null : prediction.id);
        onInspectCell({
          label: prediction.route,
          value: `${prediction.riskForecast}% forecast`,
          detail: prediction.driver,
        });
      }}
    >
      <Sphere args={[0.16, 20, 20]}>
        <meshStandardMaterial color={prediction.critical ? '#c2414b' : '#b7791f'} emissive={prediction.critical ? '#5f1118' : '#5c3b11'} emissiveIntensity={0.18} roughness={0.44} />
      </Sphere>
      <Text position={[0, 0.36, 0]} fontSize={0.13} color="#172033" anchorX="center">
        {prediction.id}
      </Text>
    </group>
  );
}

export default function SignalsPage() {
  const { shipments, executeReroute, addNotification } = useAppStore();
  const [selectedPred, setSelectedPred] = useState(null);
  const [executed, setExecuted] = useState({});
  const [surfaceFocus, setSurfaceFocus] = useState({
    label: 'Risk Surface',
    value: 'Live forecast mesh',
    detail: 'Tap heat cells or lane markers to inspect local pressure.',
  });

  const avgRisk = Math.round(shipments.reduce((a, s) => a + s.riskScore, 0) / Math.max(1, shipments.length) * 100);

  const executePrediction = (prediction) => {
    const [originId, destinationId] = prediction.route.match(/[A-Z]{3}/g) || [];
    const shipment = shipments.find(item => item.origin.id === originId && item.destination.id === destinationId) || shipments[0];
    if (!shipment) return;
    executeReroute(shipment.id, prediction.id);
    setExecuted(state => ({ ...state, [prediction.id]: shipment.id }));
    addNotification(`${prediction.action} started for ${shipment.id}`, 'success');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ height: '100%', display: 'grid', gridTemplateColumns: '1fr 420px' }}>

      {/* Left: 3D topology */}
      <div style={{ position: 'relative', background: 'var(--bg-app)' }}>
        <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--accent-1)', letterSpacing: '0.1em' }}>NEURAL_RISK_PROJECTION</div>
          <h1 style={{ fontSize: '28px', marginTop: '4px' }}>Risk Topology</h1>
          <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
            {[
              { label: 'NETWORK RISK', value: `${avgRisk}%`, color: avgRisk > 40 ? 'var(--warning-muted)' : 'var(--stable-muted)' },
              { label: 'CRITICAL LANES', value: PREDICTIONS.filter(p => p.critical).length, color: 'var(--critical-muted)' },
              { label: 'MODEL CONF.', value: '91%', color: 'var(--stable-muted)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.86)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 14px', backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-tight)' }}>
                <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '16px', color }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
        <Canvas camera={{ position: [7.5, 6.8, 7.5], fov: 46 }} dpr={[1, 1.75]} gl={{ antialias: true }} style={{ touchAction: 'none' }}>
          <ambientLight intensity={0.68} />
          <directionalLight position={[5, 7, 4]} intensity={1.2} />
          <OrbitControls
            autoRotate
            autoRotateSpeed={0.35}
            enableZoom
            enablePan
            minDistance={5.5}
            maxDistance={12}
            touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          />
          <Grid infiniteGrid sectionColor="#cbd5e1" cellColor="#e5eaf1" />
          <RiskSurface predictions={PREDICTIONS} selectedPredictionId={selectedPred} onInspectCell={setSurfaceFocus} />
          {PREDICTIONS.map(prediction => (
            <PredictionMarker
              key={prediction.id}
              prediction={prediction}
              selected={selectedPred === prediction.id}
              onSelectPrediction={setSelectedPred}
              onInspectCell={setSurfaceFocus}
            />
          ))}
        </Canvas>
        <div className="panel" style={{ position: 'absolute', left: 24, bottom: 24, width: 300, padding: '12px', background: 'rgba(255,255,255,0.9)', pointerEvents: 'none' }}>
          <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: 4 }}>SURFACE SAMPLE</div>
          <div style={{ fontSize: '13px', fontWeight: 700 }}>{surfaceFocus.label}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>{surfaceFocus.detail}</div>
          <div className="badge badge-blue" style={{ marginTop: 8 }}>{surfaceFocus.value}</div>
        </div>
      </div>

      {/* Right: Predictions */}
      <div style={{ borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BrainCircuit size={18} style={{ color: 'var(--accent-1)' }} />
            <h2 style={{ fontSize: '14px' }}>THREAT_PROJECTIONS</h2>
          </div>
          <div className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>XGBoost model  -  91% acceptance  -  4.2h lead time</div>
        </div>

        <div className="scroll-area" style={{ flex: 1 }}>
          {PREDICTIONS.map(p => {
            const isSelected = selectedPred === p.id;
            return (
              <div key={p.id} onClick={() => setSelectedPred(isSelected ? null : p.id)}
                style={{
                  padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer', background: isSelected ? 'var(--bg-accent)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent-1)' : '3px solid transparent',
                  transition: 'all 0.1s',
                }}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>{p.route}</span>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{p.timeframe}</span>
                </div>
                {/* Risk trajectory */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.riskNow}%`, background: p.riskNow > 65 ? 'var(--critical-muted)' : 'var(--warning-muted)', borderRadius: '3px' }} />
                  </div>
                  <TrendingUp size={12} color="var(--critical-muted)" />
                  <div style={{ flex: 1, height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.riskForecast}%`, background: p.riskForecast > 75 ? 'var(--critical-muted)' : 'var(--warning-muted)', borderRadius: '3px' }} />
                  </div>
                </div>
                <div className="flex-between">
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>NOW: {p.riskNow}%</span>
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--critical-muted)' }}>FORECAST: {p.riskForecast}%</span>
                </div>

                {/* Expanded */}
                {isSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="panel-2" style={{ padding: '12px', borderLeft: '3px solid var(--critical-muted)' }}>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>DRIVER</div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.driver}</div>
                    </div>
                    <div className="panel-2" style={{ padding: '12px', borderLeft: '3px solid var(--accent-1)' }}>
                      <div className="mono" style={{ fontSize: '9px', color: 'var(--text-dim)', marginBottom: '4px' }}>RECOMMENDED ACTION</div>
                      <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.action}</div>
                    </div>
                    <div className="flex-between">
                      <span className="mono" style={{ fontSize: '10px', color: 'var(--text-dim)' }}>CONFIDENCE: {p.confidence}%</span>
                      {p.critical && <span className="badge badge-red">CRITICAL LANE</span>}
                    </div>
                    <button className="btn btn-primary btn-sm" disabled={Boolean(executed[p.id])} onClick={event => { event.stopPropagation(); executePrediction(p); }}>
                      {executed[p.id] ? `EXECUTED FOR ${executed[p.id]}` : 'EXECUTE RECOMMENDATION'} <ChevronRight size={13} />
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Autonomous advisory */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--stable-bg)' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <ShieldCheck size={16} style={{ color: 'var(--stable-muted)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div className="mono" style={{ fontSize: '10px', color: 'var(--stable-muted)', marginBottom: '4px' }}>AUTONOMOUS_ADVISORY</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Shift Pacific allocation by 14% to avoid projected congestion. SHA to LAX reroute window closes in <strong style={{ color: 'var(--warning-muted)' }}>6h 22m</strong>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
