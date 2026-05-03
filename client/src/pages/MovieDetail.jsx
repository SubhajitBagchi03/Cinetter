import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Bookmark, Play, Star, MessageCircle, AlertTriangle, ChevronDown, Check, ChevronLeft, ChevronRight, Link as LinkIcon, Zap } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { notify } from '../components/motion/DynamicIsland';
import { useMovieRoom } from '../lib/socket';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewCard from '../components/reviews/ReviewCard';
import WatchProviders from '../components/movies/WatchProviders';

const IMG = (p, s = 'w500') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

import PulseWave from '../components/movies/PulseWave';

const Dropdown = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111', color: '#E5E5E5', border: '1px solid #1E1E1E', padding: '6px 12px', borderRadius: 8, fontFamily: 'Google Sans Flex', fontSize: '0.8rem', cursor: 'pointer' }}>
        <span style={{ fontSize: '1rem', color: '#888' }}>↓↑</span> {selected} <ChevronDown size={14} color="#888" />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8, padding: 4, minWidth: 120, zIndex: 50 }}>
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: selected === o ? '#222' : 'transparent', color: selected === o ? '#fff' : '#A3A3A3', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'Google Sans Flex', fontSize: '0.8rem', textAlign: 'left' }}>
              {o} {selected === o && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SeasonCard = ({ s, i, id, watchedSeasons, toggleSeasonWatched }) => {
  const [pulse, setPulse] = useState(null);
  useEffect(() => {
    api.get(`/cinepulse/tv-${id}-s${s.season_number}`)
      .then(r => setPulse(r.data.data))
      .catch(() => {});
  }, [id, s.season_number]);

  const isWatched = watchedSeasons.includes(s.id);
  const colors = { masterpiece: '#A855F7', engage: '#10B981', chill: '#F59E0B', drop: '#EF4444' };

  return (
    <Link to={`/tv/${id}/season/${s.season_number}`} style={{ textDecoration: 'none', flexShrink: 0, width: 300 }}>
      <motion.div whileHover={{ y: -5 }} style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
          <div style={{ width: 100, height: 150, flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: '#111' }}>
            {s.poster_path ? <img src={IMG(s.poster_path, 'w185')} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
            <button onClick={(e) => toggleSeasonWatched(s.id, e)} style={{ position: 'absolute', top: -5, right: -5, background: 'none', border: 'none', padding: 0, cursor: 'pointer', zIndex: 10 }}>
               <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isWatched ? '1px solid #10B981' : '1px solid #333' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isWatched ? "#10B981" : "#A3A3A3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
               </div>
            </button>
            <h4 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '1rem' }}>{s.name}</h4>
            <p style={{ fontFamily: 'Google Sans Flex, sans-serif', fontSize: '0.75rem', color: '#888', marginTop: 4 }}>
              {s.air_date ? s.air_date.slice(0,4) : ''} • {s.episode_count} Episodes
            </p>
            <p style={{ fontFamily: 'Google Sans Flex, sans-serif', fontSize: '0.7rem', color: '#555', marginTop: 'auto' }}>{pulse?.total || 0} Reviews</p>
          </div>
        </div>
        {/* Progress Bar (Actual Cinepulse) */}
        <div style={{ display: 'flex', gap: 2, padding: '0 1rem 1rem', height: 20 }}>
           {pulse?.total > 0 ? (
             Object.entries(colors).map(([cat, col]) => {
               const pct = pulse.distribution[cat] || 0;
               if (pct === 0) return null;
               return <div key={cat} style={{ flex: pct, background: col, borderRadius: 2 }} title={`${cat}: ${pct}%`} />
             })
           ) : (
             <div style={{ flex: 1, background: '#1A1A1A', borderRadius: 2 }} />
           )}
        </div>
      </motion.div>
    </Link>
  );
};

const ScrollArea = ({ children, id, scrollRef, style = {} }) => {
  const innerRef = useRef(null);
  const resolvedRef = scrollRef || innerRef;
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const checkScroll = () => {
    if (!resolvedRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = resolvedRef.current;
    setShowLeft(Math.ceil(scrollLeft) > 0);
    setShowRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    setTimeout(checkScroll, 100);
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [children]);

  return (
    <div style={{ position: 'relative' }}>
      <AnimatePresence>
        {showLeft && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 60, background: 'linear-gradient(to right, #000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />}
        {showRight && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 60, background: 'linear-gradient(to left, #000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />}
      </AnimatePresence>
      <div 
        id={id}
        ref={resolvedRef} 
        onScroll={checkScroll}
        style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', scrollBehavior: 'smooth', ...style }}
      >
        {children}
      </div>
    </div>
  );
};

// ── Aura Matrix ──
function AuraMatrix({ genres = [], keywords = [] }) {
  if ((!genres || genres.length === 0) && (!keywords || keywords.length === 0)) return null;
  const colors = ['#EF4444', '#F59E0B', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899'];
  
  const vibes = useMemo(() => {
    const base = genres.map(g => g.name);
    const keys = keywords.map(k => k.name).filter(k => !base.includes(k)).slice(0, 5 - base.length);
    const combined = [...base, ...keys].slice(0, 5);
    
    const w = [40, 30, 20, 10, 5, 5];
    const totalW = combined.reduce((a, _, i) => a + (w[i] || 5), 0);
    
    let rawVibes = combined.map((name, i) => ({
      id: name,
      name,
      pct: Math.round(((w[i] || 5) / totalW) * 100),
      color: colors[i % colors.length]
    })).sort((a,b) => b.pct - a.pct);
    
    const currentSum = rawVibes.reduce((sum, v) => sum + v.pct, 0);
    if (currentSum !== 100 && rawVibes.length > 0) {
      rawVibes[0].pct += (100 - currentSum);
    }
    return rawVibes;
  }, [genres, keywords]);

  const dots = useMemo(() => {
    const arr = [];
    vibes.forEach(v => {
      for(let i = 0; i < v.pct; i++) arr.push(v.color);
    });
    return arr.slice(0, 100);
  }, [vibes]);

  return (
    <div style={{ background: '#050505', border: '1px solid #1E1E1E', padding: '1.5rem', borderRadius: 8, marginBottom: '1.5rem' }}>
      <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>Aura Matrix</h3>
      
      {/* 10x10 Matrix Diagram */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginBottom: '2rem' }}>
        {dots.map((color, i) => (
          <motion.div 
            key={i} 
            initial={{ scale: 0, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            transition={{ delay: i * 0.005, duration: 0.2 }} 
            style={{ aspectRatio: '1', background: color, borderRadius: 2 }} 
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {vibes.map(v => (
          <div key={v.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: v.color }} />
              <span style={{ fontFamily: 'Google Sans Flex, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#E5E5E5' }}>
                {v.name.replace(/ & /g, ' & ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <span style={{ fontFamily: 'Google Sans Flex, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{v.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page
export default function MovieDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const [sp] = useSearchParams();
  const type = sp.get('type') || 'movie';
  const heroRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [pulse, setPulse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inWL, setInWL] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const castRef = useRef(null);

  const scrollCast = (dir) => {
    if (castRef.current) {
      castRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' });
    }
  };

  const [seasonOrder, setSeasonOrder] = useState('Sequence');
  const [watchedSeasons, setWatchedSeasons] = useState([]);
  const [isWatched, setIsWatched] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0); // real count from API

  const toggleSeasonWatched = (seasonId, e) => {
    e.preventDefault();
    setWatchedSeasons(prev => prev.includes(seasonId) ? prev.filter(id => id !== seasonId) : [...prev, seasonId]);
  };

  const toggleAllWatched = () => {
    if (!movie?.seasons) return;
    const allSeasonIds = movie.seasons.filter(s => s.season_number > 0).map(s => s.id);
    const allWatched = allSeasonIds.every(id => watchedSeasons.includes(id));
    if (allWatched) {
      setWatchedSeasons([]);
    } else {
      setWatchedSeasons(allSeasonIds);
    }
  };

  const { scrollY } = useScroll({ target: heroRef });
  const heroY = useTransform(scrollY, [0, 500], [0, -120]);
  const heroO = useTransform(scrollY, [0, 350], [1, 0.25]);

  useEffect(() => {
    setLoading(true);
    setMovie(null);

    const fetchMain = async (attempt = 0) => {
      try {
        const m = await api.get(`/movies/${id}?type=${type}`);
        setMovie(m.data.data);

        // Fetch secondary data in parallel — non-blocking
        api.get(`/movies/${id}/credits?type=${type}`)
          .then(c => setCredits(c.data.data))
          .catch(() => {});
        api.get(`/movies/${id}/similar?type=${type}`)
          .then(s => setSimilar(s.data.data?.slice(0, 14) || []))
          .catch(() => {});
      } catch (e) {
        if (attempt < 2) {
          // auto-retry up to 2 more times with 800ms gap
          setTimeout(() => fetchMain(attempt + 1), 800);
          return;
        }
        console.error('Movie fetch failed after retries:', e);
        setMovie(null);
      } finally {
        if (attempt === 0 || true) setLoading(false);
      }
    };

    fetchMain();

    api.get(`/cinepulse/${id}`)
      .then(p => setPulse(p.data.data))
      .catch(() => setPulse(null));

    api.get(`/reviews/${id}`)
      .then(r => setReviews(r.data.data || []))
      .catch(() => setReviews([]));

    // Fetch real interest count + user state
    api.get(`/interest/${id}`)
      .then(r => {
        setInterestCount(r.data.data.count);
        setIsInterested(r.data.data.interested);
      })
      .catch(() => {});

  }, [id, type]);

  const toggleWL = async () => {
    try {
      if (inWL) { await api.delete(`/watchlist/${id}`); setInWL(false); notify('Removed from Watchlist', 'info'); }
      else { await api.post('/watchlist', { movieId: id }); setInWL(true); notify('Added to Watchlist', 'success'); }
    } catch { notify('Sign in to save movies', 'error'); }
  };

  const toggleInterest = async () => {
    const prev = isInterested;
    // Optimistic update
    setIsInterested(!prev);
    setInterestCount(c => prev ? c - 1 : c + 1);
    try {
      const { data } = await api.post('/interest', {
        movieId: id,
        movieTitle: movie?.title || movie?.name || '',
        releaseDate: movie?.release_date || movie?.first_air_date || null,
        mediaType: type,
      });
      // Sync with server truth
      setInterestCount(data.count);
      setIsInterested(data.interested);
      if (data.interested) {
        notify(`You'll be notified when "${movie?.title || movie?.name}" releases!`, 'success');
      } else {
        notify('Removed from your interest list', 'info');
      }
    } catch {
      // Revert on failure
      setIsInterested(prev);
      setInterestCount(c => prev ? c + 1 : c - 1);
      notify('Sign in to mark as interested', 'error');
    }
  };

  const refreshPulse = async () => {
    const { data } = await api.get(`/cinepulse/${id}`).catch(() => ({ data: { data: null } }));
    setPulse(data.data);
  };

  useMovieRoom(id, (livePulse) => setPulse(livePulse));

  if (loading) return (
    <div className="page" style={{ paddingTop: 'var(--nav-h)' }}>
      <div className="skel" style={{ height: '65vh', width: '100%' }} />
      <div style={{ padding: '2.5rem clamp(1.25rem,4vw,4rem)' }}>
        <div className="skel" style={{ height: 48, width: 320, marginBottom: 12 }} />
        <div className="skel" style={{ height: 20, width: 200, marginBottom: 24 }} />
        <div className="skel" style={{ height: 80, width: '55%' }} />
      </div>
    </div>
  );
  if (!movie) return (
    <div style={{ color: '#555', textAlign: 'center', paddingTop: '30vh', paddingBottom: '30vh' }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Movie not found</h2>
      <p style={{ marginBottom: '2rem' }}>We couldn't retrieve the details for this title. It might be unavailable or there was a connection issue.</p>
      <Link to="/explore" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>Return to Explore</Link>
    </div>
  );

  const title = movie.title || movie.name;
  const year  = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}H ${movie.runtime % 60}M` : null;
  const backdrop = IMG(movie.backdrop_path, 'original');
  const poster   = IMG(movie.poster_path, 'w500');
  const domCat   = pulse?.distribution
    ? Object.entries(pulse.distribution).sort((a, b) => b[1] - a[1])[0]?.[0]
    : 'engage';
  
  // Detect unreleased content
  const UNRELEASED_STATUSES = ['Announced', 'In Production', 'Post Production', 'Planned', 'Pilot', 'In Development'];
  const releaseDate = movie.release_date || movie.first_air_date;
  const isUnreleased = UNRELEASED_STATUSES.includes(movie.status) || 
    (releaseDate && new Date(releaseDate) > new Date());
    
  const getCrew = (jobs) => credits?.crew?.find(c => jobs.includes(c.job));
  const topCrew = type === 'tv'
    ? [
        ...(movie.created_by || []).map(c => ({ ...c, label: 'Creator' })),
        { ...getCrew(['Director']), label: 'Director' },
        { ...getCrew(['Writer', 'Screenplay', 'Story', 'Author']), label: 'Writer' },
        { ...getCrew(['Original Music Composer', 'Music']), label: 'Music' }
      ].filter(c => c.name)
    : [
        { ...getCrew(['Director']), label: 'Director' },
        { ...getCrew(['Writer', 'Screenplay', 'Story', 'Author']), label: 'Writer' },
        { ...getCrew(['Original Music Composer', 'Music']), label: 'Music' },
        { ...getCrew(['Director of Photography']), label: 'Cinematography' }
      ].filter(c => c.name);

  const releaseDates = movie.release_dates?.results?.find(r => r.iso_3166_1 === 'IN' || r.iso_3166_1 === 'US')?.release_dates;
  const tvRatings = movie.content_ratings?.results?.find(r => r.iso_3166_1 === 'US' || r.iso_3166_1 === 'IN');
  const cert = type === 'tv' 
    ? tvRatings?.rating 
    : releaseDates?.find(r => r.certification)?.certification;
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const keywordsList = movie.keywords?.keywords || movie.keywords?.results || [];
  
  const bestVideo = (() => {
    if (!movie?.videos?.results?.length) return null;
    const trailers = movie.videos.results.filter(v => v.type === 'Trailer');
    if (trailers.length > 0) return trailers[0];
    const teasers = movie.videos.results.filter(v => v.type === 'Teaser');
    if (teasers.length > 0) return teasers[0];
    return movie.videos.results[0];
  })();

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* ── PARALLAX HERO ── */}
      <div ref={heroRef} style={{ position: 'relative', height: '65vh', overflow: 'hidden' }}>
        {backdrop && (
          <motion.div style={{ y: heroY, opacity: heroO, position: 'absolute', inset: '-12%' }}>
            <img src={backdrop} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </motion.div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
        
        {bestVideo && (
          <motion.button onClick={() => setIsTrailerOpen(true)} whileHover={{ scale: 1.08 }}
            style={{ position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', width: 64, height: 64, border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.08)', cursor: 'pointer', zIndex: 10 }}>
            <Play size={24} color="#fff" fill="#fff" style={{ marginLeft: 3 }} />
          </motion.button>
        )}
        
        <div style={{ position: 'absolute', top: 84, left: 'clamp(1.25rem, 4vw, 4rem)' }}>
          <p className="t-mono" style={{ fontSize: '0.6rem' }}>{type === 'tv' ? 'TV SERIES' : 'FILM'} — {year}</p>
        </div>
      </div>

      {/* ── CONTENT HEADER ── */}
      <div style={{ padding: '0 clamp(1.25rem, 4vw, 4rem)', maxWidth: 1400, margin: '0 auto', display: 'flex', gap: '2.5rem', marginTop: '-8rem', position: 'relative', zIndex: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Poster */}
        {poster && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ width: 220, flexShrink: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid #1E1E1E', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', position: 'relative' }}>
            <img src={poster} alt={title} style={{ width: '100%', display: 'block' }} />
            {/* Unreleased badge on poster */}
            {isUnreleased && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                style={{ position: 'absolute', top: 10, right: 10, background: isInterested ? '#FF4D00' : 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', border: `1px solid ${isInterested ? '#FF4D00' : 'rgba(255,77,0,0.4)'}`, borderRadius: 6, padding: '5px 9px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={toggleInterest}
              >
                <motion.div animate={isInterested ? { rotate: [0, -15, 15, -10, 0], scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.4 }}>
                  <Zap size={13} fill={isInterested ? '#fff' : 'none'} color={isInterested ? '#fff' : '#FF4D00'} />
                </motion.div>
                <span style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.72rem', fontWeight: 700, color: '#fff' }}>{interestCount}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Title & Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
          style={{ flex: 1, minWidth: 300, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem', paddingTop: '3rem' }}>
          
          <div>
            <h1 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 0.9, letterSpacing: '0.01em', marginBottom: '1rem', textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              {title}
            </h1>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
              {[
                runtime && runtime,
                cert && <span style={{ padding: '2px 6px', border: '1px solid #555', borderRadius: 4, fontSize: '0.65rem' }}>{cert}</span>,
                type === 'tv' && movie.number_of_seasons ? `${movie.number_of_seasons} Season${movie.number_of_seasons > 1 ? 's' : ''}` : null,
                movie.vote_average && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} color="#FF4D00" fill="#FF4D00" /> {movie.vote_average.toFixed(1)} <span style={{ color: '#555', fontSize: '0.6rem' }}>TMDB</span></span>,
                movie.original_language?.toUpperCase(),
              ].filter(Boolean).map((m, i) => (
                <span key={i} className="t-mono" style={{ color: '#E5E5E5', display: 'flex', alignItems: 'center' }}>{m}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
              <div>
                <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>{type === 'tv' ? 'CREATOR' : 'DIRECTOR'}</p>
                <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600 }}>{topCrew[0]?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>COUNTRY</p>
                <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600 }}>{movie.origin_country?.[0] || 'N/A'}</p>
              </div>
              <div>
                <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>LANGUAGE</p>
                <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600 }}>
                  {movie.spoken_languages?.find(l => l.iso_639_1 === movie.original_language)?.english_name || movie.original_language?.toUpperCase() || 'EN'}
                </p>
              </div>
              <div>
                <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>AGE RATING</p>
                <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600 }}>{cert || 'NR'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── MAIN TWO-COLUMN GRID ── */}
      <div style={{ padding: '4rem clamp(1.25rem, 4vw, 4rem)', maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1fr)', gap: '4rem' }}>
        
        {/* LEFT COLUMN: Overview, Cast */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Overview */}
          <section>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Overview</h3>
              
              {/* Socials */}
              <div style={{ display: 'flex', gap: 12 }}>
                {movie.external_ids?.twitter_id && <a href={`https://twitter.com/${movie.external_ids.twitter_id}`} target="_blank" rel="noreferrer" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#888'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>}
                {movie.external_ids?.instagram_id && <a href={`https://instagram.com/${movie.external_ids.instagram_id}`} target="_blank" rel="noreferrer" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#888'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>}
                {movie.external_ids?.imdb_id && <a href={`https://imdb.com/title/${movie.external_ids.imdb_id}`} target="_blank" rel="noreferrer" style={{ color: '#888', transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='#888'}><LinkIcon size={18} /></a>}
              </div>
            </div>
            
            <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.95rem', color: '#A3A3A3', lineHeight: 1.8, marginBottom: '1.5rem' }}>{movie.overview}</p>
            
            {/* Box Office & Status */}
            {(movie.status || movie.revenue > 0) && (
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', padding: '1rem', background: '#050505', border: '1px solid #111', borderRadius: 8 }}>
                {movie.status && (
                  <div>
                    <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>STATUS</p>
                    <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600 }}>{movie.status}</p>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div>
                    <p className="t-mono" style={{ fontSize: '0.65rem', color: '#555', marginBottom: 4 }}>BOX OFFICE</p>
                    <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.9rem', color: '#10B981', fontWeight: 600 }}>{formatter.format(movie.revenue)}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Genres & Keywords Tags */}
            {(movie.genres?.length > 0 || keywordsList.length > 0) && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {movie.genres?.map(g => (
                  <span key={g.id} style={{ padding: '6px 14px', background: '#111', borderRadius: 30, fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.75rem', color: '#E5E5E5', border: '1px solid #1E1E1E' }}>
                    {g.name}
                  </span>
                ))}
                {keywordsList.slice(0, 5).map(k => (
                  <span key={k.id} style={{ padding: '6px 14px', background: 'transparent', borderRadius: 30, fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.75rem', color: '#888', border: '1px dashed #1E1E1E' }}>
                    #{k.name}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Seasons */}
          {type === 'tv' && movie.seasons?.length > 0 && (
            <section style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #1E1E1E', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Seasons</h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Dropdown options={['Sequence', 'Latest']} selected={seasonOrder} onChange={setSeasonOrder} />
                  <button onClick={() => { const el = document.getElementById('seasons-scroll'); if(el) el.scrollBy({ left: -300, behavior: 'smooth' }) }} className="btn-ghost" style={{ padding: 4 }}><ChevronLeft size={16} /></button>
                  <button onClick={() => { const el = document.getElementById('seasons-scroll'); if(el) el.scrollBy({ left: 300, behavior: 'smooth' }) }} className="btn-ghost" style={{ padding: 4 }}><ChevronRight size={16} /></button>
                </div>
              </div>
              
              <ScrollArea id="seasons-scroll" style={{ gap: '1rem' }}>
                {(seasonOrder === 'Latest' ? [...movie.seasons.filter(s => s.season_number > 0)].reverse() : movie.seasons.filter(s => s.season_number > 0)).map((s, i) => (
                  <SeasonCard key={s.id} s={s} i={i} id={id} watchedSeasons={watchedSeasons} toggleSeasonWatched={toggleSeasonWatched} />
                ))}
              </ScrollArea>
            </section>
          )}

          {/* Cast */}
          {credits?.cast?.length > 0 && (
            <section style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>Cast</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => scrollCast(-1)} className="btn-ghost" style={{ padding: 4 }}><ChevronLeft size={20} /></button>
                  <button onClick={() => scrollCast(1)} className="btn-ghost" style={{ padding: 4 }}><ChevronRight size={20} /></button>
                </div>
              </div>

              <ScrollArea scrollRef={castRef} style={{ gap: '1.5rem', paddingBottom: 8 }}>
                {credits.cast.slice(0, 20).map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    style={{ flexShrink: 0, width: 80, textAlign: 'center' }}>
                    <Link to={`/person/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ width: 80, height: 80, background: '#111', borderRadius: '50%', margin: '0 auto 12px', overflow: 'hidden', border: '1px solid #1E1E1E' }}>
                        {p.profile_path
                          ? <img src={IMG(p.profile_path, 'w185')} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '1.5rem' }}>👤</div>
                        }
                      </div>
                      <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#E5E5E5', lineHeight: 1.2 }}>{p.name}</p>
                      <p style={{ fontFamily: 'Google Sans Flex, sans-serif', marginTop: 4, fontSize: '0.65rem', color: '#888', lineHeight: 1.2 }}>{p.character}</p>
                    </Link>
                  </motion.div>
                ))}
              </ScrollArea>
            </section>
          )}

          {/* Crew */}
          {topCrew.length > 0 && (
             <section>
              <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Crew</h3>
              <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}>
                {topCrew.map((c, i) => (
                  <Link key={i} to={`/person/${c.id}`} style={{ textDecoration: 'none', textAlign: 'center', width: 80, flexShrink: 0, display: 'block' }}>
                     <div style={{ width: 80, height: 80, background: '#111', borderRadius: '50%', margin: '0 auto 12px', border: '1px solid #1E1E1E', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.profile_path
                          ? <img src={IMG(c.profile_path, 'w185')} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ fontSize: '1.5rem' }}>🎥</span>
                        }
                     </div>
                     <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#E5E5E5', lineHeight: 1.2 }}>{c.name}</p>
                     <p style={{ fontFamily: "'Google Sans Flex', sans-serif", marginTop: 4, fontSize: '0.65rem', color: '#888' }}>{c.label}</p>
                  </Link>
                ))}
              </div>
             </section>
          )}

          {/* Production Companies */}
          {movie.production_companies?.length > 0 && (
             <section style={{ marginTop: '3rem' }}>
              <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Production</h3>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {movie.production_companies.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#050505', padding: '12px 16px', borderRadius: 8, border: '1px solid #1E1E1E' }}>
                     {p.logo_path ? (
                       <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                         <img src={IMG(p.logo_path, 'w185')} alt={p.name} style={{ maxHeight: '100%', maxWidth: 80, objectFit: 'contain' }} />
                       </div>
                     ) : null}
                     <span style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#E5E5E5' }}>{p.name}</span>
                  </div>
                ))}
              </div>
             </section>
          )}

        </div>

        {/* RIGHT COLUMN: Vibe Chart, Watch Providers */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
           {/* Button: Mark as Interested (unreleased) OR Mark as Watched (released) */}
           {isUnreleased ? (
             <motion.button
              onClick={toggleInterest}
               whileTap={{ scale: 0.97 }}
               style={{
                 padding: '13px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center',
                 justifyContent: 'center', gap: 10, borderRadius: 6, cursor: 'pointer',
                 border: 'none', position: 'relative', overflow: 'hidden', width: '100%',
                 background: isInterested
                   ? 'linear-gradient(135deg, #FF4D00 0%, #FF8C00 100%)'
                   : 'linear-gradient(135deg, #1A0A00 0%, #2A1200 100%)',
                 boxShadow: isInterested ? '0 0 20px rgba(255,77,0,0.4)' : 'none',
                 transition: 'all 0.35s ease',
               }}
             >
               {/* Scanning line animation when interested */}
               {isInterested && (
                 <motion.div
                   initial={{ x: '-100%' }}
                   animate={{ x: '200%' }}
                   transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                   style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', pointerEvents: 'none' }}
                 />
               )}
               <motion.div animate={isInterested ? { rotate: [0, -20, 20, -10, 0] } : {}} transition={{ duration: 0.5 }}>
                 <Zap size={16} fill={isInterested ? '#fff' : 'none'} color={isInterested ? '#fff' : '#FF4D00'} />
               </motion.div>
               <span style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 700, color: '#fff', position: 'relative', zIndex: 1, letterSpacing: '0.02em' }}>
                 {isInterested ? `Interested · ${interestCount}` : 'Mark as Interested'}
               </span>
             </motion.button>
           ) : type === 'tv' ? (() => {
              const totalS = movie.seasons?.filter(s => s.season_number > 0).length || 1;
              const watchedCount = watchedSeasons.length;
              const progPct = watchedCount > 0 ? Math.round((watchedCount / totalS) * 100) : 0;
              const allWatched = watchedCount === totalS;

              return (
                <button
                  onClick={toggleAllWatched}
                  className="btn-outline"
                  style={{ padding: '12px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, background: allWatched ? '#0D2B1F' : '#111', border: `1px solid ${allWatched ? '#10B981' : watchedCount > 0 ? '#10B981' : '#333'}`, position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {watchedCount > 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${progPct}%`, background: '#10B981', opacity: 0.15, transition: 'width 0.3s' }} />
                  )}
                  <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, color: allWatched ? '#10B981' : watchedCount > 0 ? '#10B981' : '#E5E5E5', fontWeight: 600 }}>
                    <Check size={16} />
                    {allWatched ? 'Watched All Seasons' : watchedCount > 0 ? `Watching... ${progPct}%` : 'Mark as Watched'}
                  </span>
                </button>
              );
           })() : (
              <button
                onClick={() => setIsWatched(w => !w)}
                className="btn-outline"
                style={{ padding: '12px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, background: isWatched ? '#0D2B1F' : '#111', border: `1px solid ${isWatched ? '#10B981' : '#333'}`, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <Check size={16} color={isWatched ? '#10B981' : '#E5E5E5'} />
                <span style={{ color: isWatched ? '#10B981' : '#E5E5E5', fontWeight: 600 }}>
                  {isWatched ? 'Watched' : 'Mark as Watched'}
                </span>
              </button>
           )}
             <button onClick={toggleWL} className="btn-primary" style={{ padding: '12px 20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, ...(inWL && { background: '#1A1A1A', color: '#fff', border: '1px solid #2A2A2A', clipPath: 'none' }) }}>
               <Bookmark size={16} fill={inWL ? '#FF4D00' : 'none'} color={inWL ? '#FF4D00' : 'currentColor'} />
               {inWL ? 'In Collection' : 'Add to Collection'}
             </button>
          </div>

          <AuraMatrix genres={movie.genres} keywords={keywordsList} />
          
          <div style={{ background: '#050505', border: '1px solid #1E1E1E', padding: '1.5rem', borderRadius: 8 }}>
            <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Watch Online</p>
            <WatchProviders movieId={id} type={type} />
          </div>
        </div>
      </div>

      {/* ── CINEPULSE & REVIEWS (Full Width Area) ── */}
      <div style={{ padding: '0 clamp(1.25rem, 4vw, 4rem)', maxWidth: 1400, margin: '0 auto 4rem' }}>
        
        {/* The Meter */}
        {type !== 'tv' && (
          <PulseWave score={pulse?.score || 0} category={domCat} total={pulse?.total || 0} distribution={pulse?.distribution} dominant={domCat} />
        )}
        
        {/* Reviews Section */}
        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #1E1E1E', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.6rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
              Reviews <span className="t-mono" style={{ color: '#555', fontSize: '0.8rem', fontWeight: 400 }}>{reviews.length} REVIEWS</span>
            </h3>
            
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select style={{ background: '#0A0A0A', color: '#E5E5E5', border: '1px solid #222', padding: '6px 12px', borderRadius: 6, fontFamily: 'Google Sans Flex', fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                <option>Most Liked</option>
                <option>Recent</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A3A3A3', fontSize: '0.8rem', fontFamily: 'Google Sans Flex', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#FF4D00', width: 14, height: 14 }} /> Show Spoilers
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A3A3A3', fontSize: '0.8rem', fontFamily: 'Google Sans Flex', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: '#FF4D00', width: 14, height: 14 }} /> Following Only
              </label>
            </div>
          </div>

          {user && reviews.some(r => r.userId?._id?.toString() === user._id || r.userId === user._id) ? null : (
            <ReviewForm movieId={id} mediaType={type} onSuccess={() => api.get(`/reviews/${id}`).then(r => setReviews(r.data.data || []))} />
          )}

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#333', background: '#050505', border: '1px dashed #1E1E1E', borderRadius: 8 }}>
              <MessageCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
              <p className="t-mono">No reviews yet. Start the conversation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reviews.map(r => (
                <ReviewCard key={r._id} review={r} onDelete={rid => setReviews(rv => rv.filter(x => x._id !== rid))} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MORE LIKE THIS ── */}
      {similar.length > 0 && (
        <div style={{ padding: '0 clamp(1.25rem, 4vw, 4rem)', maxWidth: 1400, margin: '0 auto 4rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E' }}>
            <h3 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>More Like This</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if(el) el.scrollBy({ left: -300, behavior: 'smooth' }) }} className="btn-ghost" style={{ padding: 4 }}><ChevronLeft size={20} /></button>
              <button onClick={() => { const el = document.getElementById('similar-scroll'); if(el) el.scrollBy({ left: 300, behavior: 'smooth' }) }} className="btn-ghost" style={{ padding: 4 }}><ChevronRight size={20} /></button>
            </div>
          </div>
          
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 40, background: 'linear-gradient(to right, #000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 40, background: 'linear-gradient(to left, #000 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
            
            <div id="similar-scroll" style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 10, paddingLeft: 10, paddingRight: 10, scrollBehavior: 'smooth' }}>
              {similar.map(m => (
                <Link key={m.id} to={`/movie/${m.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: 140 }}>
                  <motion.div whileHover={{ y: -5 }} className="m-card" style={{ borderRadius: 6, overflow: 'hidden', border: '1px solid #1E1E1E' }}>
                    {IMG(m.poster_path, 'w185')
                      ? <img src={IMG(m.poster_path, 'w185')} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                      : <div style={{ aspectRatio: '2/3', background: '#111' }} />
                    }
                  </motion.div>
                  <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.75rem', fontWeight: 600, color: '#E5E5E5', marginTop: 8, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title || m.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TRAILER MODAL ── */}
      <AnimatePresence>
        {isTrailerOpen && bestVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsTrailerOpen(false)}
          >
            <div style={{ width: '90%', maxWidth: 1000, aspectRatio: '16/9', background: '#000', borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${bestVideo.key}?autoplay=1`}
                title="Trailer" frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
