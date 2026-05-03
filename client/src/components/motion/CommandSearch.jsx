import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Film, Tv, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const HINTS = [
  'Search movies, shows, people...',
  'Try "Dune" or "Parasite"...',
  'Type a director\'s name...',
  'Search by genre or mood...',
];

export default function CommandSearch({ open, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ph, setPh] = useState(0);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => { if (!open) return; const t = setInterval(() => { if (!q) setPh(i => (i + 1) % HINTS.length); }, 3000); return () => clearInterval(t); }, [open, q]);
  useEffect(() => { if (open) { setQ(''); setResults(null); setTimeout(() => ref.current?.focus(), 80); } }, [open]);
  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try { const { data } = await api.get(`/movies/search?q=${encodeURIComponent(q)}`); setResults(data.data?.results || []); }
      catch { setResults([]); } finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const go = (item) => { nav(`/movie/${item.id}?type=${item.media_type || 'movie'}`); onClose(); };
  const movies = results?.filter(r => r.media_type === 'movie').slice(0, 5) || [];
  const shows  = results?.filter(r => r.media_type === 'tv').slice(0, 3) || [];
  const people = results?.filter(r => r.media_type === 'person').slice(0, 2) || [];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 200 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="cmd"
          >
            {/* Search row */}
            <div className="cmd__input-row">
              <Search size={16} color="#555" />
              <input
                ref={ref}
                className="cmd__input"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Escape' && onClose()}
                placeholder={HINTS[ph]}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {loading && <div className="skel" style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0 }} />}
                <kbd style={{ background: '#111', border: '1px solid #1E1E1E', padding: '2px 6px', fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.08em', color: '#555' }}>ESC</kbd>
              </div>
            </div>

            {/* Results */}
            {results !== null && (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {!results.length && !loading && (
                  <p className="t-mono" style={{ padding: '2rem', textAlign: 'center', color: '#555' }}>No results for "{q}"</p>
                )}
                {[{ items: movies, label: 'Movies', Icon: Film }, { items: shows, label: 'Series', Icon: Tv }, { items: people, label: 'People', Icon: User }].map(({ items, label, Icon }) =>
                  items.length > 0 && (
                    <div key={label}>
                      <p className="cmd__section-label">{label}</p>
                      {items.map(item => (
                        <button key={item.id} className="cmd__item" onClick={() => go(item)}>
                          <div style={{ width: 32, height: 46, background: '#111', flexShrink: 0, overflow: 'hidden' }}>
                            {(item.poster_path || item.profile_path)
                              ? <img src={`https://image.tmdb.org/t/p/w92${item.poster_path || item.profile_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <Icon size={14} color="#333" style={{ margin: '16px 9px' }} />
                            }
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.82rem', color: '#E5E5E5' }}>{item.title || item.name}</p>
                            <p className="t-mono" style={{ marginTop: 2, fontSize: '0.58rem' }}>{item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4) || item.known_for_department || ''}</p>
                          </div>
                          <span className="t-mono" style={{ color: '#333', fontSize: '0.6rem' }}>→</span>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Empty state hints */}
            {!results && (
              <div style={{ padding: '1.25rem 18px', borderTop: '1px solid #1E1E1E', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['Trending', 'Masterpiece', 'Sci-Fi', 'Horror'].map(tag => (
                  <button key={tag} onClick={() => setQ(tag)}
                    style={{ padding: '5px 12px', border: '1px solid #1E1E1E', background: 'none', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', transition: 'border-color 0.2s, color 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4D00'; e.currentTarget.style.color = '#FF4D00'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E1E'; e.currentTarget.style.color = '#555'; }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
