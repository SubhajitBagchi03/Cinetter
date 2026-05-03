import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Clapperboard, X, Loader, Sparkles, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../motion/DynamicIsland';

const GENRES   = ['Drama', 'Horror', 'SciFi', 'Comedy', 'Action', 'Romance', 'Thriller', 'Animation'];
const VIBES    = ['Epic', 'Dark', 'Heartwarming', 'Mind-bending', 'Nostalgic', 'Provocative', 'Surreal', 'Raw'];

export default function DirectorsChair({ onClose }) {
  const [form, setForm] = useState({ genre: 'Drama', premise: '', vibe: 'Epic' });
  const [pitch, setPitch] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPitch = async () => {
    if (!form.premise.trim()) { notify('Enter a premise first', 'error'); return; }
    setLoading(true); setPitch(null);
    try {
      const { data } = await api.post('/ai/directors-chair', form);
      setPitch(data.data);
    } catch { notify('Pitch generation failed', 'error'); }
    finally { setLoading(false); }
  };

  const CP_COLORS = { Masterpiece: '#A855F7', Engage: '#10B981', 'Chill Watch': '#F59E0B' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      style={{ width: '100%', maxWidth: 600, background: '#000', border: '1px solid #1E1E1E', padding: '2rem', position: 'relative', margin: '0 auto' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Clapperboard size={16} color="#FF4D00" />
            <p className="t-mono" style={{ color: '#FF4D00' }}>AI Feature</p>
          </div>
          <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '2rem', letterSpacing: '0.04em' }}>DIRECTOR'S CHAIR</h2>
          <p style={{ color: '#555', fontSize: '0.8rem', marginTop: 4 }}>Pitch your dream film. AI produces the concept.</p>
        </div>
        {onClose && <button className="btn-ghost" onClick={onClose}><X size={18} /></button>}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Genre selector */}
        <div>
          <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Genre</label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {GENRES.map(g => (
              <button key={g} onClick={() => setForm(f => ({ ...f, genre: g }))}
                style={{ padding: '5px 12px', border: `1px solid ${form.genre === g ? '#FF4D00' : '#1E1E1E'}`, background: form.genre === g ? '#FF4D0015' : 'none', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: form.genre === g ? '#FF4D00' : '#555', transition: 'all 0.2s' }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe selector */}
        <div>
          <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Vibe</label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {VIBES.map(v => (
              <button key={v} onClick={() => setForm(f => ({ ...f, vibe: v }))}
                style={{ padding: '5px 12px', border: `1px solid ${form.vibe === v ? '#3B82F6' : '#1E1E1E'}`, background: form.vibe === v ? '#3B82F615' : 'none', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: form.vibe === v ? '#3B82F6' : '#555', transition: 'all 0.2s' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Premise */}
        <div>
          <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Your Premise</label>
          <textarea className="input" value={form.premise}
            onChange={e => setForm(f => ({ ...f, premise: e.target.value }))}
            placeholder="A disgraced detective returns to their hometown to find that time itself has stopped moving..."
            rows={3} style={{ resize: 'none', fontFamily: "Google Sans Flex", fontSize: '0.875rem', lineHeight: 1.6 }} />
        </div>

        <motion.button onClick={getPitch} disabled={loading || !form.premise.trim()} whileHover={!loading ? { x: 2 } : {}}
          className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8, opacity: (loading || !form.premise.trim()) ? 0.5 : 1 }}>
          {loading
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating pitch...</>
            : <><Sparkles size={14} /> Generate Film Pitch →</>
          }
        </motion.button>
      </div>

      {/* Pitch result */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '1.5rem', border: '1px dashed #1E1E1E', textAlign: 'center' }}>
            <p className="t-mono" style={{ color: '#555' }}>The AI is in the director's chair...</p>
          </motion.div>
        )}
        {pitch && !loading && (
          <motion.div key="pitch" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ border: '1px solid #1E1E1E', padding: '1.5rem', background: '#0A0A0A' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1.75rem', letterSpacing: '0.04em', color: '#fff', lineHeight: 1 }}>{pitch.title}</h3>
                <p style={{ color: '#A3A3A3', fontSize: '0.85rem', fontStyle: 'italic', marginTop: 4 }}>"{pitch.tagline}"</p>
              </div>
              <button onClick={getPitch}
                style={{ background: 'none', border: '1px solid #1E1E1E', padding: '6px 10px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: 4, fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E1E'; e.currentTarget.style.color = '#555'; }}>
                <RefreshCw size={11} /> Regenerate
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              {[
                { k: 'Genre',   v: pitch.genre },
                { k: 'Vibe',    v: pitch.vibe },
                { k: 'Runtime', v: pitch.runtime },
                { k: 'Budget',  v: pitch.productionBudget },
              ].map(d => (
                <div key={d.k} style={{ padding: '0.75rem', border: '1px solid #1E1E1E', background: '#000' }}>
                  <p className="t-mono" style={{ marginBottom: 3 }}>{d.k}</p>
                  <p style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.85rem' }}>{d.v}</p>
                </div>
              ))}
            </div>

            {/* Cast */}
            <div style={{ marginBottom: '0.75rem' }}>
              <p className="t-mono" style={{ marginBottom: '0.5rem' }}>Suggested Cast</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {pitch.castSuggestions.map(a => (
                  <span key={a} style={{ padding: '4px 10px', border: '1px solid #1E1E1E', fontFamily: "Google Sans Flex", fontSize: '0.78rem', color: '#A3A3A3' }}>{a}</span>
                ))}
              </div>
            </div>

            {/* Predicted CinePulse */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: '0.75rem', borderTop: '1px solid #111' }}>
              <span className="t-mono">Predicted CinePulse</span>
              <span style={{ padding: '3px 10px', border: `1px solid ${CP_COLORS[pitch.predictedCinePulse] || '#555'}40`, color: CP_COLORS[pitch.predictedCinePulse] || '#555', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {pitch.predictedCinePulse}
              </span>
            </div>

            {/* Poster concept */}
            <div style={{ marginTop: '0.75rem', padding: '10px 14px', background: '#000', border: '1px solid #0A0A0A' }}>
              <p className="t-mono" style={{ marginBottom: 4 }}>Poster Concept</p>
              <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.6, fontStyle: 'italic' }}>{pitch.posterConcept}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
