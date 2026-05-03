import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { notify } from '../components/motion/DynamicIsland';
import { UserPlus, UserMinus, Settings } from 'lucide-react';

const IMG = (p, s = 'w185') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

const STATS_META = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
  { key: 'watchlist', label: 'Watchlist' },
];

export default function Profile() {
  const { id } = useParams();
  const { user, isAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [tab, setTab] = useState('reviews');

  const isOwn = user?._id === id || user?.id === id;

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`)
      .then(({ data }) => {
        setProfile(data.data);
        if (user) setFollowing(data.data.followers?.includes(user._id || user.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, user]);

  const toggleFollow = async () => {
    if (!isAuth) { notify('Sign in to follow', 'error'); return; }
    try {
      if (following) { await api.delete(`/users/${id}/follow`); setFollowing(false); notify('Unfollowed', 'info'); }
      else { await api.post(`/users/${id}/follow`); setFollowing(true); notify('Following!', 'success'); }
    } catch { notify('Action failed', 'error'); }
  };

  if (loading) return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem)' }}>
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="skel" style={{ width: 100, height: 100 }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 32, width: 200, marginBottom: 12 }} />
          <div className="skel" style={{ height: 16, width: 120 }} />
        </div>
      </div>
    </div>
  );

  const p = profile;
  if (!p) return <div style={{ textAlign: 'center', paddingTop: '20vh', color: '#555' }} className="t-mono">User not found</div>;

  return (
    <div className="page" style={{ padding: 0 }}>

      {/* ── Header banner area */}
      <div style={{ height: 220, background: 'linear-gradient(135deg, #0A0A0A 0%, #111 100%)', borderBottom: '1px solid #1E1E1E', position: 'relative', overflow: 'hidden' }}>
        {/* Ghost username as background */}
        <div style={{ position: 'absolute', bottom: -20, left: '5%', fontFamily: "Google Sans Flex", fontSize: 'clamp(5rem, 15vw, 12rem)', lineHeight: 0.85, color: 'transparent', WebkitTextStroke: '1px #1A1A1A', userSelect: 'none', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
          {p.username}
        </div>
      </div>

      <div style={{ padding: '0 clamp(1.25rem, 4vw, 4rem) 4rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* Profile info row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginTop: '-3rem', position: 'relative', zIndex: 2, flexWrap: 'wrap', paddingBottom: '2rem', borderBottom: '1px solid #1E1E1E' }}>
          {/* Avatar */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ width: 96, height: 96, background: '#111', border: '2px solid #1E1E1E', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
            {p.avatar
              ? <img src={p.avatar} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: "Google Sans Flex", fontSize: '2.5rem', color: '#333' }}>{p.username?.[0]?.toUpperCase()}</span>
              </div>
            }
          </motion.div>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h1 style={{ fontFamily: "Google Sans Flex", fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                {p.username}
              </h1>
              {p.role !== 'user' && (
                <span style={{ padding: '2px 8px', background: '#FF4D00', color: '#000', fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  {p.role}
                </span>
              )}
            </div>
            {p.bio && <p style={{ color: '#737373', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1rem', maxWidth: 400 }}>{p.bio}</p>}

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {[
                { val: p.followers?.length || 0, label: 'Followers' },
                { val: p.following?.length || 0, label: 'Following' },
                { val: p.watchlist?.length || 0, label: 'Watchlist' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{s.val}</div>
                  <div className="t-mono" style={{ marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            {isOwn ? (
              <button className="btn-outline" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Settings size={14} /> Edit Profile
              </button>
            ) : (
              <motion.button whileHover={{ x: 2 }} onClick={toggleFollow}
                className={following ? 'btn-outline' : 'btn-primary'}
                style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                {following ? <><UserMinus size={14} /> Unfollow</> : <><UserPlus size={14} /> Follow</>}
              </motion.button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginTop: 0 }}>
          {['reviews', 'collections', 'watchlist'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ paddingTop: '2rem' }}
          >
            {tab === 'reviews' && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}>
                <p className="t-mono">No reviews yet</p>
              </div>
            )}
            {tab === 'collections' && (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}>
                <p className="t-mono">No public collections</p>
              </div>
            )}
            {tab === 'watchlist' && (
              isOwn
                ? <WatchlistTab />
                : <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}><p className="t-mono">Private watchlist</p></div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function WatchlistTab() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/watchlist').then(({ data }) => setMovies(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
      {Array(8).fill(0).map((_, i) => <div key={i} className="skel" style={{ aspectRatio: '2/3' }} />)}
    </div>
  );
  if (!movies.length) return <div style={{ textAlign: 'center', padding: '3rem 0', color: '#555' }}><p className="t-mono">Watchlist is empty</p></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.6rem' }}>
      {movies.map((m, i) => (
        <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Link to={`/movie/${m.id}`} style={{ textDecoration: 'none' }}>
            <div className="m-card">
              {m.poster_path && <img src={IMG(m.poster_path)} alt={m.title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />}
              <div className="m-card__overlay">
                <p style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.72rem', color: '#E5E5E5' }}>{m.title}</p>
                <p className="t-mono" style={{ fontSize: '0.58rem', marginTop: 2 }}>{m.release_date?.slice(0, 4)}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
