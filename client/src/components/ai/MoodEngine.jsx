import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Brain, X, ArrowRight, Loader } from 'lucide-react';
import api from '../../lib/api';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#F59E0B' },
  { emoji: '😢', label: 'Emotional', color: '#3B82F6' },
  { emoji: '🔥', label: 'Hyped', color: '#EF4444' },
  { emoji: '🤔', label: 'Curious', color: '#8B5CF6' },
  { emoji: '😴', label: 'Tired', color: '#6B7280' },
  { emoji: '😍', label: 'Romantic', color: '#EC4899' },
  { emoji: '😱', label: 'Thrills', color: '#F97316' },
  { emoji: '🎉', label: 'Festive', color: '#10B981' },
  { emoji: '😤', label: 'Action', color: '#FF4D00' },
];

export default function MoodEngine() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMoods = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    setResults(null);
    try {
      const { data } = await api.post('/ai/mood-recommend', { mood: selectedMood.emoji });
      setResults(data.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setMood(null); setResults(null); };

  return (
    <>
      {/* FAB — AI Gradient border, Component 8 */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          zIndex: 60, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <div className="ai-border" style={{ display: 'inline-block' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'none' }}
          />
          <div style={{ background: '#000', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={22} color="#fff" />
          </div>
        </div>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', zIndex: 70 }}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 420,
                background: '#000', border: '1px solid #1E1E1E', zIndex: 71,
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #1E1E1E' }}>
                <div>
                  <p className="t-mono" style={{ marginBottom: 4, color: '#FF4D00' }}>AI Mood Engine</p>
                  <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '1.75rem', letterSpacing: '0.04em' }}>WHAT TO WATCH</h2>
                </div>
                <button onClick={() => setOpen(false)} className="btn-ghost"><X size={18} /></button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                {!mood ? (
                  <>
                    <p className="t-mono" style={{ marginBottom: '1.25rem' }}>How are you feeling right now?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                      {MOODS.map(m => (
                        <motion.button
                          key={m.label}
                          whileHover={{ scale: 1.04, borderColor: m.color }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => getMoods(m)}
                          style={{
                            padding: '1rem 0.5rem', background: '#0A0A0A', border: '1px solid #1E1E1E',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <span style={{ fontSize: '1.75rem' }}>{m.emoji}</span>
                          <span className="t-mono" style={{ fontSize: '0.58rem' }}>{m.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', paddingTop: '3rem' }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Loader size={32} color="#FF4D00" />
                    </motion.div>
                    <p className="t-mono">Finding your perfect watch...</p>
                  </div>
                ) : results?.length > 0 ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <p className="t-mono">
                        {mood.emoji} {mood.label} picks
                      </p>
                      <button onClick={reset} className="btn-ghost" style={{ fontSize: '0.65rem', fontFamily: "Google Sans Flex", letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF4D00' }}>
                        Change mood
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {results.map((m, i) => (
                        <motion.a
                          key={m.id}
                          href={`/movie/${m.id}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', border: '1px solid #1E1E1E', textDecoration: 'none', transition: 'border-color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#2A2A2A'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}
                        >
                          <div style={{ width: 44, height: 64, background: '#111', flexShrink: 0, overflow: 'hidden' }}>
                            {m.poster_path && <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.82rem', color: '#E5E5E5', lineHeight: 1.3, marginBottom: 4 }}>{m.title}</p>
                            <p className="t-mono" style={{ fontSize: '0.58rem' }}>{m.release_date?.slice(0, 4)} · ★ {m.vote_average?.toFixed(1)}</p>
                          </div>
                          <ArrowRight size={14} color="#333" style={{ flexShrink: 0, marginTop: 'auto', marginBottom: 'auto' }} />
                        </motion.a>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}>
                    <p className="t-mono">No results found. Try another mood.</p>
                    <button onClick={reset} className="btn-outline" style={{ marginTop: '1rem', fontSize: '0.7rem' }}>Try again</button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
