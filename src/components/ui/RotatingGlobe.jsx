import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * RotatingGlobe — canvas d3 orthographic globe with supply-chain overlays.
 *
 * Props:
 *   ports       [{ id, name, coords:{lat,lng}, congestion }]
 *   routes      [{ start:{lat,lng}, end:{lat,lng}, status }]
 *   selectedId  port id to highlight (string | null)
 *   onPortClick (portId) => void
 */
export default function RotatingGlobe({ ports = [], routes = [], selectedId = null, onPortClick }) {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // Keep latest props in refs so the render loop always sees current values
  const propsRef = useRef({ ports, routes, selectedId, onPortClick });
  useEffect(() => {
    propsRef.current = { ports, routes, selectedId, onPortClick };
  }, [ports, routes, selectedId, onPortClick]);

  useEffect(() => {
    const wrap   = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* ── palette ── */
    const C = {
      ocean: '#F6F8FB', land: '#E5EAF1', landStroke: '#CBD5E1',
      grat: 'rgba(63,108,143,0.1)', dot: 'rgba(63,108,143,0.15)',
      portOk: '#16745F', portWarn: '#B7791F', portCrit: '#C2414B',
      routeOk: 'rgba(22,116,95,0.4)', routeCrit: 'rgba(194,65,75,0.5)',
      routeWarn: 'rgba(183,121,31,0.45)', sel: '#3F6C8F',
      ring: '#CBD5E1', label: '#647084',
    };

    /* ── mutable sizing state ── */
    let W = 600, H = 500, baseR = 200;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      W = Math.max(100, Math.round(r.width));
      H = Math.max(100, Math.round(r.height));
      baseR = Math.min(W, H) / 2.35;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      projection.scale(baseR).translate([W / 2, H / 2]);
    };

    const ro = new ResizeObserver(() => { resize(); render(); });
    ro.observe(wrap);

    /* ── d3 ── */
    const projection = d3.geoOrthographic().clipAngle(90).scale(baseR).translate([W / 2, H / 2]);
    const pathGen    = d3.geoPath().projection(projection).context(ctx);

    /* ── point-in-polygon ── */
    const pip = (pt, ring) => {
      let ins = false;
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i], [xj, yj] = ring[j];
        if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi)
          ins = !ins;
      }
      return ins;
    };
    const inFeat = (pt, g) => {
      if (g.type === 'Polygon') {
        if (!pip(pt, g.coordinates[0])) return false;
        for (let i = 1; i < g.coordinates.length; i++) if (pip(pt, g.coordinates[i])) return false;
        return true;
      }
      if (g.type === 'MultiPolygon') {
        for (const poly of g.coordinates) {
          if (pip(pt, poly[0])) {
            let hole = false;
            for (let i = 1; i < poly.length; i++) if (pip(pt, poly[i])) { hole = true; break; }
            if (!hole) return true;
          }
        }
      }
      return false;
    };
    const genDots = (feat, sp = 20) => {
      const out = [];
      const [[mnLng, mnLat], [mxLng, mxLat]] = d3.geoBounds(feat);
      const step = sp * 0.08;
      for (let lng = mnLng; lng <= mxLng; lng += step)
        for (let lat = mnLat; lat <= mxLat; lat += step)
          if (inFeat([lng, lat], feat.geometry)) out.push([lng, lat]);
      return out;
    };

    /* ── data ── */
    const allDots = [];
    let landData = null;

    const arcPts = (a, b, n = 60) => {
      const fn = d3.geoInterpolate([a.lng, a.lat], [b.lng, b.lat]);
      return Array.from({ length: n + 1 }, (_, i) => fn(i / n));
    };

    /* ── render ── */
    const render = () => {
      const { ports: pp, routes: rr, selectedId: sid } = propsRef.current;
      const sc = projection.scale();
      const sf = sc / baseR;

      ctx.clearRect(0, 0, W, H);

      // glow
      const grd = ctx.createRadialGradient(W/2, H/2, sc*0.85, W/2, H/2, sc*1.3);
      grd.addColorStop(0, 'rgba(63,108,143,0.05)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      // ocean
      ctx.beginPath(); ctx.arc(W/2, H/2, sc, 0, Math.PI*2);
      ctx.fillStyle = C.ocean; ctx.fill();
      ctx.strokeStyle = C.ring; ctx.lineWidth = 1.5*sf; ctx.stroke();

      if (!landData) return;

      // graticule
      ctx.beginPath(); pathGen(d3.geoGraticule()());
      ctx.strokeStyle = C.grat; ctx.lineWidth = 0.5*sf; ctx.stroke();

      // land
      landData.features.forEach(f => {
        ctx.beginPath(); pathGen(f);
        ctx.fillStyle = C.land; ctx.fill();
        ctx.strokeStyle = C.landStroke; ctx.lineWidth = 0.6*sf; ctx.stroke();
      });

      // halftone dots
      const center = projection.invert([W/2, H/2]);
      allDots.forEach(([lng, lat]) => {
        const p = projection([lng, lat]);
        if (!p) return;
        if (d3.geoDistance([lng, lat], center) > Math.PI/2) return;
        ctx.beginPath(); ctx.arc(p[0], p[1], 0.9*sf, 0, Math.PI*2);
        ctx.fillStyle = C.dot; ctx.fill();
      });

      // routes
      rr.forEach(r => {
        const pts = arcPts(r.start, r.end, 60);
        const col = r.status === 'CRITICAL' ? C.routeCrit : r.status === 'WARNING' ? C.routeWarn : C.routeOk;

        ctx.beginPath();
        let mv = false;
        pts.forEach(c => {
          if (d3.geoDistance(c, center) > Math.PI/2) { mv = false; return; }
          const p = projection(c);
          if (!p) { mv = false; return; }
          if (!mv) { ctx.moveTo(p[0], p[1]); mv = true; }
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.strokeStyle = col; ctx.lineWidth = 1.4*sf; ctx.stroke();

        // dashed overlay
        ctx.beginPath(); mv = false;
        pts.forEach(c => {
          if (d3.geoDistance(c, center) > Math.PI/2) { mv = false; return; }
          const p = projection(c);
          if (!p) { mv = false; return; }
          if (!mv) { ctx.moveTo(p[0], p[1]); mv = true; }
          else ctx.lineTo(p[0], p[1]);
        });
        ctx.setLineDash([4*sf, 6*sf]);
        ctx.strokeStyle = r.status === 'CRITICAL' ? 'rgba(194,65,75,0.4)' : 'rgba(22,116,95,0.3)';
        ctx.lineWidth = 0.5*sf; ctx.stroke();
        ctx.setLineDash([]);
      });

      // ports
      pp.forEach(port => {
        if (d3.geoDistance([port.coords.lng, port.coords.lat], center) > Math.PI/2) return;
        const p = projection([port.coords.lng, port.coords.lat]);
        if (!p) return;

        const isSel = sid && port.id === sid;
        const cong = port.congestion || 0;
        const col = cong > 0.7 ? C.portCrit : cong > 0.4 ? C.portWarn : C.portOk;
        const c = isSel ? C.sel : col;

        // outer glow
        ctx.beginPath(); ctx.arc(p[0], p[1], (isSel ? 10 : 6)*sf, 0, Math.PI*2);
        ctx.fillStyle = c + '2D'; ctx.fill();

        // ring
        if (isSel || cong > 0.7) {
          ctx.beginPath(); ctx.arc(p[0], p[1], (isSel ? 12 : 8)*sf, 0, Math.PI*2);
          ctx.strokeStyle = c; ctx.lineWidth = 1*sf; ctx.globalAlpha = 0.4; ctx.stroke(); ctx.globalAlpha = 1;
        }

        // core
        ctx.beginPath(); ctx.arc(p[0], p[1], (isSel ? 4 : 2.8)*sf, 0, Math.PI*2);
        ctx.fillStyle = c; ctx.fill();

        // label
        if (sf > 0.65) {
          ctx.font = `${Math.round(9*sf)}px 'JetBrains Mono',monospace`;
          ctx.fillStyle = isSel ? C.sel : C.label;
          ctx.textAlign = 'left';
          ctx.fillText(port.id, p[0]+8*sf, p[1]+3*sf);
        }
      });
    };

    /* ── load world ── */
    const loadWorld = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json'
        );
        if (!res.ok) throw new Error('fetch failed');
        landData = await res.json();
        landData.features.forEach(f => genDots(f, 20).forEach(d => allDots.push(d)));
        render();
        setLoading(false);
      } catch (e) {
        setError('Could not load globe data'); setLoading(false);
      }
    };

    /* ── interaction ── */
    const rot = [0, -15];
    let autoRot = true;

    const tick = d3.timer(() => {
      if (autoRot) { rot[0] += 0.22; projection.rotate(rot); render(); }
    });

    // mouse
    const onDown = e => {
      autoRot = false;
      const sx = e.clientX, sy = e.clientY, r0 = [...rot];
      const mv = me => {
        rot[0] = r0[0] + (me.clientX - sx) * 0.4;
        rot[1] = Math.max(-90, Math.min(90, r0[1] - (me.clientY - sy) * 0.4));
        projection.rotate(rot); render();
      };
      const up = () => {
        document.removeEventListener('mousemove', mv);
        document.removeEventListener('mouseup', up);
        setTimeout(() => { autoRot = true; }, 1200);
      };
      document.addEventListener('mousemove', mv);
      document.addEventListener('mouseup', up);
    };

    const onWheel = e => {
      e.preventDefault();
      const s = e.deltaY > 0 ? 0.92 : 1.08;
      projection.scale(Math.max(baseR*0.5, Math.min(baseR*3, projection.scale()*s)));
      render();
    };

    // touch
    let lt = null, ltd = null;
    const ts = e => {
      autoRot = false;
      if (e.touches.length === 1)
        lt = { x: e.touches[0].clientX, y: e.touches[0].clientY, r: [...rot] };
      else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX-e.touches[1].clientX;
        const dy = e.touches[0].clientY-e.touches[1].clientY;
        ltd = Math.sqrt(dx*dx+dy*dy);
      }
    };
    const tm = e => {
      e.preventDefault();
      if (e.touches.length === 1 && lt) {
        rot[0] = lt.r[0]+(e.touches[0].clientX-lt.x)*0.4;
        rot[1] = Math.max(-90, Math.min(90, lt.r[1]-(e.touches[0].clientY-lt.y)*0.4));
        projection.rotate(rot); render();
      } else if (e.touches.length === 2 && ltd) {
        const dx = e.touches[0].clientX-e.touches[1].clientX;
        const dy = e.touches[0].clientY-e.touches[1].clientY;
        const d = Math.sqrt(dx*dx+dy*dy);
        projection.scale(Math.max(baseR*0.5, Math.min(baseR*3, projection.scale()*(d/ltd))));
        ltd = d; render();
      }
    };
    const te = () => { lt = null; ltd = null; setTimeout(() => { autoRot = true; }, 1500); };

    // click on ports
    const onClick = e => {
      const fn = propsRef.current.onPortClick;
      const pp = propsRef.current.ports;
      if (!fn || !pp.length) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      const sf = projection.scale() / baseR;
      const center = projection.invert([W/2, H/2]);
      let best = null, bestD = Infinity;
      pp.forEach(port => {
        if (d3.geoDistance([port.coords.lng, port.coords.lat], center) > Math.PI/2) return;
        const p = projection([port.coords.lng, port.coords.lat]);
        if (!p) return;
        const d = Math.hypot(p[0]-cx, p[1]-cy);
        if (d < 16*sf && d < bestD) { best = port; bestD = d; }
      });
      if (best) fn(best.id);
    };

    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', ts, { passive: true });
    canvas.addEventListener('touchmove', tm, { passive: false });
    canvas.addEventListener('touchend', te);
    canvas.addEventListener('click', onClick);

    resize();
    loadWorld();

    return () => {
      tick.stop(); ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', ts);
      canvas.removeEventListener('touchmove', tm);
      canvas.removeEventListener('touchend', te);
      canvas.removeEventListener('click', onClick);
    };
  }, []);  // runs once — latest props read from propsRef

  if (error)
    return (
      <div style={{ width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg-app)',color:'var(--critical-muted)',flexDirection:'column',gap:8}}>
        <span style={{fontWeight:700}}>Globe Error</span>
        <span style={{fontSize:12,color:'var(--text-muted)'}}>{error}</span>
      </div>
    );

  return (
    <div ref={wrapRef}
      style={{ width:'100%', height:'100%', position:'absolute', inset:0, overflow:'hidden', background:'transparent' }}>
      <canvas ref={canvasRef} style={{ display:'block', cursor:'grab' }} />

      {loading && (
        <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.7)',backdropFilter:'blur(6px)',zIndex:5}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
            <div style={{width:28,height:28,border:'2px solid var(--accent-1)',borderTopColor:'transparent',borderRadius:'50%',animation:'spin .8s linear infinite'}}/>
            <span className="mono" style={{fontSize:10,color:'var(--accent-1)',letterSpacing:'0.1em'}}>LOADING GEOSPHERE…</span>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      <div style={{position:'absolute',bottom:12,left:12,zIndex:6,background:'rgba(255,255,255,0.85)',border:'1px solid var(--border-subtle)',borderRadius:4,padding:'5px 10px',backdropFilter:'blur(8px)',boxShadow:'var(--shadow-tight)'}}>
        <span className="mono" style={{fontSize:9,color:'var(--text-dim)',letterSpacing:'0.06em'}}>DRAG TO ROTATE · SCROLL TO ZOOM</span>
      </div>

      <div style={{position:'absolute',top:12,right:12,zIndex:6,display:'flex',alignItems:'center',gap:6,background:'rgba(255,255,255,0.85)',border:'1px solid var(--border-subtle)',borderRadius:4,padding:'5px 10px',backdropFilter:'blur(8px)',boxShadow:'var(--shadow-tight)'}}>
        <div style={{width:6,height:6,borderRadius:'50%',background:'var(--stable-muted)',boxShadow:'0 0 6px var(--stable-muted)',animation:'pulse 2s ease-in-out infinite'}}/>
        <span className="mono" style={{fontSize:9,color:'var(--stable-muted)',letterSpacing:'0.08em'}}>LIVE</span>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      </div>
    </div>
  );
}
