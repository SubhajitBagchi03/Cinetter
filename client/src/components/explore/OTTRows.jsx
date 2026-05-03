/**
 * OTT Streaming Rows — Netflix / JioHotstar / Prime Video
 * Uses real TMDB provider logos from image.tmdb.org
 * All cards match top-row size (150px) with text below
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../lib/api';

const IMG  = (p, s = 'w342') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

// Official TMDB provider logo images — render identically to Netflix/Hotstar/Prime apps
const PROVIDER_LOGO_BASE = 'https://image.tmdb.org/t/p/original';

const PROVIDERS = [
  {
    id: 8,
    name: 'Netflix',
    tagline: "Don't Miss These on Netflix",
    type: 'movie',
    color: '#E50914',
    // Official Netflix logo path from TMDB
    logoPath: '/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg',
  },
  {
    id: 2336,
    name: 'JioHotstar',
    tagline: "Don't Miss These on JioHotstar",
    type: 'movie',      // Updated ID 2336 supports both, movie shows more variety
    color: '#7B2FBE',
    // Official Disney+/Hotstar logo from TMDB
    logoPath: '/kVqjgpcwvDJOhCupjcLzwwtOp52.jpg', // Updated logo path for JioHotstar
  },
  {
    id: 119,
    name: 'Prime Video',
    tagline: 'Worth Watching on Prime',
    type: 'movie',
    color: '#00A8E0',
    // Official Prime Video logo from TMDB
    logoPath: '/emthp39XA2YScoYL1p0sdbAH2WA.jpg',
  },
];

// ── Shared card — same 150px width as top rows, text BELOW poster ──
export function OTTCard({ movie, accentColor, type = 'movie' }) {
  const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : type);
  return (
    <Link to={`/movie/${movie.id}?type=${mediaType}`} style={{ textDecoration: 'none', display: 'block' }}>
      <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
        {/* Poster — same aspect ratio as top rows */}
        <div style={{ position: 'relative', overflow: 'hidden', background: '#111', marginBottom: '0.55rem' }}>
          {IMG(movie.poster_path)
            ? <img
                src={IMG(movie.poster_path)}
                alt={movie.title || movie.name}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }}
              />
            : <div style={{ aspectRatio: '2/3', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🎬</span>
              </div>
          }
        </div>
        {/* Title + meta BELOW poster */}
        <p style={{
          fontFamily: "Google Sans Flex", fontWeight: 700,
          fontSize: '0.78rem', color: '#E5E5E5', lineHeight: 1.3,
          marginBottom: '0.2rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {movie.title || movie.name}
        </p>
        <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.68rem', color: '#555' }}>
          {mediaType === 'tv' ? 'Show' : 'Movie'} · {(movie.release_date || movie.first_air_date || '').slice(0, 4)}
        </p>
      </motion.div>
    </Link>
  );
}

// ── Single OTT row ──
function OTTRow({ provider }) {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  useEffect(() => {
    api.get(`/movies/streaming?providerId=${provider.id}&region=IN&type=${provider.type}`)
      .then(({ data }) => setMovies(data.data?.slice(0, 20) || []))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [provider.id]);

  const scroll = (dir) => {
    const el = trackRef.current; if (!el) return;
    el.scrollBy({ left: dir * 480, behavior: 'smooth' });
    setTimeout(() => {
      setCanLeft(el.scrollLeft > 0);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
    }, 400);
  };

  if (!loading && movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: '3.5rem' }}
    >
      {/* Row header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Official provider logo from TMDB */}
          <img
            src={`${PROVIDER_LOGO_BASE}${provider.logoPath}`}
            alt={provider.name}
            style={{ width: 30, height: 30, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
          />
          <span style={{
            fontFamily: "Google Sans Flex", fontWeight: 800,
            fontSize: '0.9rem', letterSpacing: '-0.01em',
            textTransform: 'uppercase', color: '#E5E5E5',
          }}>
            {provider.tagline}
          </span>
        </div>

        {/* Scroll arrows — same style as top rows */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[{ dir: -1, can: canLeft }, { dir: 1, can: canRight }].map(({ dir, can }) => (
            <button key={dir} onClick={() => scroll(dir)} disabled={!can}
              style={{
                width: 28, height: 28, background: 'none',
                border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: can ? 'pointer' : 'not-allowed',
                color: can ? '#A3A3A3' : '#333', transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => can && (e.currentTarget.style.borderColor = '#555')}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}
            >
              {dir === -1 ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
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
      ) : (
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
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025 }}
                style={{ width: 150, flexShrink: 0 }}
              >
                <OTTCard movie={m} accentColor={provider.color} type={provider.type} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function OTTRows() {
  return (
    <div style={{ marginTop: '0.5rem' }}>
      {PROVIDERS.map(p => <OTTRow key={p.id} provider={p} />)}
    </div>
  );
}
