import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../../lib/api';

const CATEGORIES = [
  { key: 'Action',       color: '#EF4444', angle: 0   },
  { key: 'Drama',        color: '#3B82F6', angle: 60  },
  { key: 'Comedy',       color: '#F59E0B', angle: 120 },
  { key: 'SciFi',        color: '#10B981', angle: 180 },
  { key: 'Horror',       color: '#8B5CF6', angle: 240 },
  { key: 'Romance',      color: '#EC4899', angle: 300 },
];

const R = 100;
const CX = 130, CY = 130;

function polarToCart(angle, r) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function RadarShape({ data, max = 100, color = '#FF4D00' }) {
  const points = CATEGORIES.map((cat, i) => {
    const val = (data[cat.key] || 0) / max;
    return polarToCart(cat.angle, val * R);
  });
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
  return (
    <path d={d} fill={`${color}25`} stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
  );
}

export default function TasteDNA({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data — replace with real watchlist/vote genre analysis
  const mockDNA = {
    Action: 72, Drama: 91, Comedy: 40, SciFi: 85, Horror: 28, Romance: 55,
  };

  useEffect(() => {
    // In production: call /api/v1/users/:id/taste-dna
    setTimeout(() => { setData(mockDNA); setLoading(false); }, 600);
  }, [userId]);

  const max = data ? Math.max(...Object.values(data)) : 100;

  if (loading) return (
    <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skel" style={{ width: 260, height: 260, borderRadius: '50%' }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <p className="t-mono" style={{ marginBottom: 2 }}>Taste DNA</p>
          <p style={{ color: '#555', fontSize: '0.78rem' }}>Your genre fingerprint from votes & watchlist</p>
        </div>
        <span className="t-mono" style={{ color: '#555', fontSize: '0.58rem' }}>BETA</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Radar SVG */}
        <svg width={260} height={260} viewBox={`0 0 260 260`} style={{ flexShrink: 0 }}>
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map(scale => (
            <polygon key={scale}
              points={CATEGORIES.map((cat) => {
                const p = polarToCart(cat.angle, scale * R);
                return `${p.x},${p.y}`;
              }).join(' ')}
              fill="none" stroke="#1E1E1E" strokeWidth={1}
            />
          ))}

          {/* Axis lines */}
          {CATEGORIES.map((cat) => {
            const end = polarToCart(cat.angle, R);
            return <line key={cat.key} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#1E1E1E" strokeWidth={1} />;
          })}

          {/* Data shape */}
          <motion.g initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            style={{ transformOrigin: `${CX}px ${CY}px` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <RadarShape data={data} max={max} color="#FF4D00" />
          </motion.g>

          {/* Category labels */}
          {CATEGORIES.map((cat) => {
            const p = polarToCart(cat.angle, R + 22);
            return (
              <text key={cat.key} x={p.x} y={p.y}
                textAnchor="middle" dominantBaseline="middle"
                fill={cat.color} fontSize="8.5" fontWeight="700"
                fontFamily="Google Sans Flex, monospace" letterSpacing="1">
                {cat.key.toUpperCase()}
              </text>
            );
          })}

          {/* Center dot */}
          <circle cx={CX} cy={CY} r={3} fill="#FF4D00" />
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
              <span className="t-mono" style={{ flex: 1, color: '#A3A3A3', fontSize: '0.62rem' }}>{cat.key}</span>
              <div style={{ width: 80, height: 3, background: '#111', position: 'relative' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((data[cat.key] || 0) / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                  style={{ height: '100%', background: cat.color }}
                />
              </div>
              <span className="t-mono" style={{ width: 28, textAlign: 'right', fontSize: '0.6rem' }}>{data[cat.key] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
