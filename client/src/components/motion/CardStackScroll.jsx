import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';

const IMG = (p, s = 'w500') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

/**
 * Card Stack Scroll — Component 12
 * Featured movies that stack up as you scroll through the section.
 * Usage: <CardStackScroll movies={[...]} />
 */
function StackCard({ movie, index, total }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <div
      ref={ref}
      style={{ position: 'sticky', top: `calc(var(--nav-h) + ${index * 24}px)`, height: '70vh', marginBottom: '2rem' }}
    >
      <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <motion.div
          style={{ y, scale, height: '100%', position: 'relative', overflow: 'hidden', border: '1px solid #1E1E1E', background: '#0A0A0A', cursor: 'pointer' }}
          whileHover={{ borderColor: '#2A2A2A' }}
        >
          {IMG(movie.backdrop_path, 'original') && (
            <img src={IMG(movie.backdrop_path, 'original')} alt={movie.title || movie.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
            />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
          <div style={{ position: 'absolute', top: 20, right: 20 }}>
            <span style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
          </div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
            <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FF4D00', marginBottom: '0.5rem' }}>
              Featured
            </p>
            <h2 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 0.9, letterSpacing: '0.01em', marginBottom: '0.75rem' }}>
              {movie.title || movie.name}
            </h2>
            {movie.overview && (
              <p style={{ color: '#A3A3A3', fontSize: '0.875rem', lineHeight: 1.6, maxWidth: 480 }}>
                {movie.overview.slice(0, 160)}...
              </p>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

export default function CardStackScroll({ movies = [] }) {
  if (!movies.length) return null;
  return (
    <div style={{ paddingBottom: '4rem' }}>
      {movies.slice(0, 5).map((movie, i) => (
        <StackCard key={movie.id} movie={movie} index={i} total={Math.min(movies.length, 5)} />
      ))}
    </div>
  );
}
