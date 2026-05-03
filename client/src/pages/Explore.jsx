import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bookmark, TrendingUp, Flame, Star, Zap } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { notify } from '../components/motion/DynamicIsland';
import OTTRows from '../components/explore/OTTRows';

const IMG = (path, size = 'w342') =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// ── Unified Movie Card — 150px, text BELOW poster ────
function MovieCard({ movie }) {
  const { isAuth } = useAuth();

  const addToWatchlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuth) { notify('Sign in to save movies', 'error'); return; }
    try {
      await api.post('/watchlist', { movieId: movie.id });
      notify('Added to Watchlist ✓', 'success');
    } catch { notify('Already in watchlist', 'info'); }
  };

  const mediaType = movie.media_type || 'movie';
  const title     = movie.title || movie.name || '';
  const year      = (movie.release_date || movie.first_air_date || '').slice(0, 4);

  // ⚡ badge: ONLY if release date is strictly in the future
  const relDate = movie.release_date || movie.first_air_date;
  const isUnreleased = relDate ? new Date(relDate) > new Date() : false;

  return (
    <Link to={`/movie/${movie.id}?type=${mediaType}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
        {/* Poster */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#111', marginBottom: '0.55rem', group: true }}>
          {IMG(movie.poster_path)
            ? <img src={IMG(movie.poster_path)} alt={title} loading="lazy"
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
            : <div style={{ aspectRatio: '2/3', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem', color: '#333' }}>🎬</span>
              </div>
          }
          {/* ⚡ Unreleased badge */}
          {isUnreleased && (
            <div style={{
              position: 'absolute', top: 6, right: 6,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,77,0,0.5)',
              borderRadius: 5, padding: '3px 7px',
              display: 'flex', alignItems: 'center', gap: 4,
              pointerEvents: 'none',
            }}>
              <Zap size={10} fill="#FF4D00" color="#FF4D00" />
            </div>
          )}
          {/* Watchlist button on hover */}
          <motion.button
            initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
            onClick={addToWatchlist}
            title="Add to Watchlist"
            style={{
              position: 'absolute', bottom: 8, right: 8,
              width: 30, height: 30,
              background: 'rgba(0,0,0,0.8)', border: '1px solid #333',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}
          >
            <Bookmark size={13} />
          </motion.button>
        </div>

        {/* Title + year below poster */}
        <p style={{
          fontFamily: "Google Sans Flex", fontWeight: 700,
          fontSize: '0.78rem', color: '#E5E5E5', lineHeight: 1.3,
          marginBottom: '0.2rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {title}
        </p>
        <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.68rem', color: '#555' }}>
          {mediaType === 'tv' ? 'Show' : 'Movie'} · {year}
        </p>
      </motion.div>
    </Link>
  );
}

// ── Scrollable Row — same header style everywhere ────
function MovieRow({ title, movies, icon: Icon, badge, loading }) {
  const trackRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: dir * 450, behavior: 'smooth' });
    setTimeout(() => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, 400);
  };

  return (
    <div style={{ marginBottom: '3.5rem' }}>
      {/* Row header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {Icon && <Icon size={15} color="#FF4D00" />}
          <span style={{ fontFamily: "Google Sans Flex", fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
            {title}
          </span>
          {badge && (
            <span style={{ padding: '2px 8px', background: '#FF4D00', color: '#000', fontFamily: "Google Sans Flex", fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ dir: -1, can: canLeft }, { dir: 1, can: canRight }].map(({ dir, can }) => (
            <button key={dir} onClick={() => scroll(dir)} disabled={!can}
              style={{ width: 28, height: 28, background: 'none', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: can ? 'pointer' : 'not-allowed', color: can ? '#A3A3A3' : '#333', transition: 'border-color 0.2s, color 0.2s' }}
              onMouseEnter={e => can && (e.currentTarget.style.borderColor = '#555')}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}
            >
              {dir === -1 ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Cards — all 150px unified width */}
      {loading ? (
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ flexShrink: 0, width: 150 }}>
              <div className="skel" style={{ width: '100%', aspectRatio: '2/3', marginBottom: 8 }} />
              <div className="skel" style={{ width: '80%', height: 12, marginBottom: 5 }} />
              <div className="skel" style={{ width: '50%', height: 10 }} />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? null : (
        <div style={{ position: 'relative' }}>
          {/* Left Fade */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 60,
            background: 'linear-gradient(to right, #000 0%, transparent 100%)',
            zIndex: 10, pointerEvents: 'none', opacity: canLeft ? 1 : 0, transition: 'opacity 0.3s'
          }} />

          {/* Right Fade */}
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 60,
            background: 'linear-gradient(to left, #000 0%, transparent 100%)',
            zIndex: 10, pointerEvents: 'none', opacity: canRight ? 1 : 0, transition: 'opacity 0.3s'
          }} />

          <div
            ref={trackRef}
            style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}
            onScroll={e => {
              const el = e.currentTarget;
              setCanLeft(el.scrollLeft > 0);
              setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
            }}
          >
            {movies.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ width: 150, flexShrink: 0 }}
              >
                <MovieCard movie={m} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Explore Page ─────────────────────────────────────
export default function Explore() {
  const { user } = useAuth();

  const [trending,   setTrending]   = useState({ data: [], loading: true });
  const [nowPlaying, setNowPlaying] = useState({ data: [], loading: true });
  const [upcoming,   setUpcoming]   = useState({ data: [], loading: true });

  useEffect(() => {
    // Trending — with fallback to popular if it fails
    api.get('/movies/trending')
      .then(r => setTrending({ data: r.data?.data || [], loading: false }))
      .catch(() =>
        api.get('/movies/popular')
          .then(r => setTrending({ data: r.data?.data || [], loading: false }))
          .catch(() => setTrending({ data: [], loading: false }))
      );

    // Now Playing
    api.get('/movies/now-playing')
      .then(r => {
        const raw = r.data?.data;
        setNowPlaying({ data: Array.isArray(raw) ? raw : (raw?.results || []), loading: false });
      })
      .catch(() => setNowPlaying({ data: [], loading: false }));

    // Upcoming
    api.get('/movies/upcoming')
      .then(r => {
        const raw = r.data?.data;
        setUpcoming({ data: Array.isArray(raw) ? raw : (raw?.results || []), loading: false });
      })
      .catch(() => setUpcoming({ data: [], loading: false }));
  }, []);

  return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem) 4rem' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1E1E1E', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="t-mono" style={{ marginBottom: '0.4rem' }}>
            — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9, letterSpacing: '0.01em' }}
          >
            {user?.username
              ? <><span style={{ color: '#FF4D00' }}>{user.username}</span>'s PULSE</>
              : <>TODAY'S <span style={{ color: '#FF4D00' }}>PULSE</span></>
            }
          </motion.h1>
        </div>
        <span className="t-mono">What's hitting different today</span>
      </div>

      {/* ── 3 main rows — each loads independently ── */}
      <MovieRow title="Talk of the Town"  movies={trending.data}   loading={trending.loading}   icon={TrendingUp} badge="LIVE" />
      <MovieRow title="Now Playing"        movies={nowPlaying.data} loading={nowPlaying.loading} icon={Flame} />
      <MovieRow title="Coming Soon"        movies={upcoming.data}   loading={upcoming.loading}   icon={Star} />

      {/* ── OTT rows — always independent ── */}
      <OTTRows />
    </div>
  );
}
