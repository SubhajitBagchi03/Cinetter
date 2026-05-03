import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Flame, X, RotateCcw, Search, Loader } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../motion/DynamicIsland';

const ROAST_MOVIES = [
  { title: 'Barbie', id: 346698 },
  { title: 'Oppenheimer', id: 872585 },
  { title: 'Avatar: The Way of Water', id: 76600 },
  { title: 'Avengers: Endgame', id: 299534 },
  { title: 'The Batman', id: 414906 },
  { title: 'Bullet Train', id: 718821 },
];

export default function CineRoast({ onClose }) {
  const [query, setQuery] = useState('');
  const [overview, setOverview] = useState('');
  const [roast, setRoast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const getRoast = async (title, ovr = '') => {
    setLoading(true); setRoast(null);
    try {
      const { data } = await api.post('/ai/cine-roast', { movieTitle: title, overview: ovr });
      setRoast(data.data.roast);
      setHistory(h => [{ movie: title, roast: data.data.roast }, ...h.slice(0, 4)]);
    } catch { notify('Roast failed — even the AI gave up', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    getRoast(query.trim(), overview.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{ width: '100%', maxWidth: 560, background: '#000', border: '1px solid #1E1E1E', padding: '2rem', position: 'relative', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Flame size={16} color="#FF4D00" />
            <p className="t-mono" style={{ color: '#FF4D00' }}>AI Feature</p>
          </div>
          <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '2rem', letterSpacing: '0.04em' }}>CINEROAST</h2>
          <p style={{ color: '#555', fontSize: '0.8rem', marginTop: 4 }}>Give any movie the roast it deserves</p>
        </div>
        {onClose && <button className="btn-ghost" onClick={onClose}><X size={18} /></button>}
      </div>

      {/* Quick picks */}
      <div style={{ marginBottom: '1.25rem' }}>
        <p className="t-mono" style={{ marginBottom: '0.5rem' }}>Quick picks</p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {ROAST_MOVIES.map(m => (
            <button key={m.id} onClick={() => { setQuery(m.title); getRoast(m.title); }}
              style={{ padding: '4px 10px', border: '1px solid #1E1E1E', background: 'none', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4D00'; e.currentTarget.style.color = '#FF4D00'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E1E'; e.currentTarget.style.color = '#555'; }}
            >
              {m.title}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input className="input" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Enter movie title..." style={{ paddingRight: 44 }} />
          <Search size={15} color="#555" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        <textarea className="input" value={overview} onChange={e => setOverview(e.target.value)}
          placeholder="Paste the plot summary for a sharper roast (optional)..." rows={2} style={{ resize: 'none', fontSize: '0.8rem' }} />
        <motion.button type="submit" disabled={loading || !query.trim()} whileHover={!loading ? { x: 2 } : {}}
          className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', opacity: (!loading && query.trim()) ? 1 : 0.5 }}>
          {loading ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Roasting...</> : '🔥 Roast It →'}
        </motion.button>
      </form>

      {/* Roast result */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed #1E1E1E' }}>
            <p className="t-mono" style={{ color: '#555' }}>Generating the roast of a lifetime...</p>
          </motion.div>
        )}
        {roast && !loading && (
          <motion.div key="roast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ padding: '1.25rem', background: '#0A0A0A', borderLeft: '3px solid #FF4D00', marginBottom: '1.25rem' }}>
            <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.95rem', lineHeight: 1.7, color: '#E5E5E5', fontStyle: 'italic' }}>
              "{roast}"
            </p>
            <button onClick={() => getRoast(query, overview)}
              style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#FF4D00'}
              onMouseLeave={e => e.currentTarget.style.color = '#555'}
            >
              <RotateCcw size={11} /> Roast again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="t-mono" style={{ marginBottom: '0.75rem' }}>Recent roasts</p>
          {history.map((h, i) => (
            <div key={i} style={{ padding: '8px 0', borderTop: '1px solid #0A0A0A' }}>
              <p className="t-mono" style={{ color: '#FF4D00', marginBottom: 2, fontSize: '0.6rem' }}>{h.movie}</p>
              <p style={{ color: '#555', fontSize: '0.78rem', lineHeight: 1.5 }}>{h.roast.slice(0, 90)}...</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
