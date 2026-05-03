import { motion } from 'framer-motion';

const CP = {
  masterpiece: { label: 'Masterpiece', color: '#A855F7', emoji: '👑' },
  engage:      { label: 'Engage',      color: '#10B981', emoji: '🔥' },
  chill:       { label: 'Chill Watch', color: '#F59E0B', emoji: '😌' },
  drop:        { label: 'Drop It',     color: '#EF4444', emoji: '💀' },
};

// ── Abstract CinePulse Meter (Frequency Wave) ──
export default function PulseWave({ distribution = {}, total = 0, dominant }) {
  const meta = CP[dominant] || CP.engage;
  const bars = 24;
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid #1E1E1E', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>CinePulse Core</h3>
          <p className="t-mono" style={{ color: '#555', fontSize: '0.75rem' }}>{total.toLocaleString()} Pulses</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '3.5rem', fontFamily: "Google Sans Flex", color: total > 0 ? meta.color : '#fff', lineHeight: 0.8 }}>
            {total > 0 ? Math.round((distribution[dominant] / total) * 100) : 0}%
          </div>
          {total > 0 && (
            <div style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.9rem', color: '#fff', textTransform: 'uppercase', marginTop: 4 }}>
              {meta.emoji} {meta.label}
            </div>
          )}
        </div>
      </div>
      
      {/* Abstract Waveform */}
      <div style={{ display: 'flex', gap: 3, height: 60, alignItems: 'center', justifyContent: 'center', background: '#050505', padding: '1rem', borderRadius: 8, border: '1px solid #111' }}>
        {Array.from({ length: bars }).map((_, i) => {
          const h = total > 0 ? 15 + Math.sin(i * 0.8) * 20 + Math.random() * 25 : 4;
          return (
            <motion.div
              key={i}
              initial={{ height: 4 }}
              animate={{ height: `${h}px` }}
              transition={{ duration: total > 0 ? 0.8 : 0, delay: i * 0.03, repeat: total > 0 ? Infinity : 0, repeatType: 'mirror', ease: 'easeInOut' }}
              style={{ flex: 1, background: total > 0 ? meta.color : '#333', opacity: 0.8, borderRadius: 2 }}
            />
          );
        })}
      </div>
      
      {/* Distribution Line */}
      {total > 0 && (
        <div style={{ display: 'flex', gap: 2, marginTop: '1rem', height: 6, borderRadius: 3, overflow: 'hidden' }}>
          {Object.entries(CP).map(([cat, m]) => {
            const pct = Math.round(((distribution[cat] || 0) / total) * 100) || 0;
            return (
              <div key={cat} style={{ flex: pct, background: m.color, opacity: pct > 0 ? 1 : 0, transition: 'all 0.5s' }} title={`${m.label}: ${pct}%`} />
            );
          })}
        </div>
      )}
      
      {/* Distribution Labels */}
      {total > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          {Object.entries(CP).map(([cat, m]) => {
            const pct = Math.round(((distribution[cat] || 0) / total) * 100) || 0;
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                <span className="t-mono" style={{ fontSize: '0.65rem', color: '#888' }}>{m.label} {pct}%</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
