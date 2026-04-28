import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";

export function WorldMap({ dots = [], lineColor = "#111110" }) {
  const map = useMemo(() => new DottedMap({ height: 100, grid: "diagonal" }), []);
  const svgMap = useMemo(() => map.getSVG({ radius: 0.22, color: "#00000015", shape: "circle", backgroundColor: "white" }), [map]);

  const projectPoint = (lat, lng) => {
    return { x: (lng + 180) * (800 / 360), y: (90 - lat) * (400 / 180) };
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: '#FAFAFA' }}>
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        style={{ height: '100%', width: '100%', pointerEvents: 'none', userSelect: 'none', objectFit: 'cover' }}
        alt="world map"
      />
      <svg viewBox="0 0 800 400" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {dots.map((dot, i) => {
          const start = projectPoint(dot.start.lat, dot.start.lng);
          const end = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={i}>
              <motion.path
                d={`M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${Math.min(start.y, end.y) - 50} ${end.x} ${end.y}`}
                fill="none"
                stroke={lineColor}
                strokeWidth="0.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <circle cx={start.x} cy={start.y} r="1.5" fill={lineColor} />
              <circle cx={end.x} cy={end.y} r="1.5" fill={lineColor} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
