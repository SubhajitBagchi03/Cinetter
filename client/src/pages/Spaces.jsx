import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Plus, ChevronDown, Film, Clapperboard, Trash2, User } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import CreatePostModal from '../components/spaces/CreatePostModal';

const TMDB_IMG = (p, size = 'w1280') =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : null;

const TOPICS = ['Indian', 'International', 'Anime', 'Sports', 'Games'];

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

// Gradient placeholder
const GRADIENTS = [
  'linear-gradient(135deg, #1a0533 0%, #0f0f0f 100%)',
  'linear-gradient(135deg, #001a33 0%, #0f0f0f 100%)',
  'linear-gradient(135deg, #1a1200 0%, #0f0f0f 100%)',
  'linear-gradient(135deg, #001a10 0%, #0f0f0f 100%)',
];
const getGradient = (id) => GRADIENTS[(id?.charCodeAt(0) || 0) % GRADIENTS.length];

// Build fallback URL chain for a post
const buildChain = (post) => {
  const c = [];
  if (post.images?.length)              c.push(post.images[0]);
  if (post.taggedMedia?.backdrop_path)  c.push(TMDB_IMG(post.taggedMedia.backdrop_path));
  if (post.taggedMedia?.poster_path)    c.push(TMDB_IMG(post.taggedMedia.poster_path, 'w780'));
  return c;
};

// Hook: tries each URL in chain, then falls back to TMDB API fetch
function usePostImage(post) {
  const chain = buildChain(post);
  const [idx,    setIdx]    = useState(0);
  const [apiFallback, setApiFallback] = useState(null);
  const [dead,   setDead]   = useState(false);
  const fetching = useRef(false);

  const onError = useCallback(async () => {
    if (idx < chain.length - 1) {
      setIdx(i => i + 1);
      return;
    }
    // All stored paths exhausted — fetch fresh from backend
    if (!fetching.current && post.taggedMedia?.tmdbId) {
      fetching.current = true;
      try {
        const type = post.taggedMedia.media_type === 'tv' ? 'tv' : 'movies';
        const { data } = await api.get(`/${type}/${post.taggedMedia.tmdbId}`);
        const d = data?.data || data;
        const p = d?.poster_path || d?.backdrop_path;
        if (p) { setApiFallback(TMDB_IMG(p, 'w780')); }
        else   { setDead(true); }
      } catch { setDead(true); }
    } else if (!post.taggedMedia?.tmdbId) {
      setDead(true);
    }
  }, [idx, chain.length, post.taggedMedia]);

  const src = dead ? null : (apiFallback || chain[idx] || null);
  return { src, onError };
}

// ── Post card ─────────────────────────────────────────────────────────────
function PostCard({ post, index, onDelete, currentUserId }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount || 0);
  const [deleting, setDeleting] = useState(false);
  const { isAuth } = useAuth();
  const { src: imgSrc, onError: onImgError } = usePostImage(post);
  const isDirectors = post.type === 'directors_chair';
  const isOwn = currentUserId && post.authorId?._id?.toString() === currentUserId;

  const toggleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuth) return;
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    await api.post(`/spaces/posts/${post._id}/like`).catch(() => {});
  };

  const handleDelete = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/spaces/posts/${post._id}`);
      onDelete?.(post._id);
    } catch { setDeleting(false); }
  };

  return (
    <motion.article
      onClick={() => navigate(`/spaces/${post._id}`)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      style={{
        cursor: 'pointer', marginBottom: '1.25rem', borderRadius: 8,
        overflow: 'hidden', background: '#050505',
        border: '1px solid #1A1A1A',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1A1A'; e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.4)'; }}
    >
      {/* ── IMAGE AREA (always present) ── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden', background: getGradient(post._id) }}>
        {imgSrc && (
          <img src={imgSrc} alt="" loading="lazy" onError={onImgError}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        )}

        {/* Gradient scrim */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />

        {/* Top badges — no PINNED badge */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          {isDirectors && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(109,40,217,0.85)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.08em', backdropFilter: 'blur(8px)' }}>
              <Clapperboard size={9} /> DIRECTOR'S CUT
            </span>
          )}
          {post.authorRole === 'admin' && (
            <span style={{ background: 'rgba(255,77,0,0.9)', color: '#fff', padding: '3px 8px', borderRadius: 4, fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em' }}>CINETTER</span>
          )}
        </div>

        {/* Bottom-left: tagged movie pill */}
        {post.taggedMedia && (
          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '3px 10px 3px 5px', backdropFilter: 'blur(12px)' }}
            onClick={e => { e.stopPropagation(); navigate(`/${post.taggedMedia.media_type === 'tv' ? 'tv' : 'movie'}/${post.taggedMedia.tmdbId}`); }}>
            {post.taggedMedia.poster_path
              ? <img src={TMDB_IMG(post.taggedMedia.poster_path, 'w92')} alt="" style={{ width: 18, height: 24, objectFit: 'cover', borderRadius: 3 }} />
              : <Film size={12} color="#888" />
            }
            <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.65rem', color: '#ccc', maxWidth: 120, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {post.taggedMedia.title}
            </span>
          </div>
        )}

        {/* Bottom-right: engagement + delete */}
        <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {/* Delete button — only own posts */}
          {isOwn && (
            <button onClick={handleDelete} disabled={deleting}
              title="Delete post"
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(180,0,0,0.75)', border: '1px solid rgba(255,50,50,0.3)', borderRadius: 20, padding: '4px 10px', cursor: deleting ? 'not-allowed' : 'pointer', color: '#fff', fontSize: '0.62rem', backdropFilter: 'blur(8px)', transition: 'background 0.2s', opacity: deleting ? 0.5 : 1 }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,0,0,0.9)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(180,0,0,0.75)'}>
              <Trash2 size={11} /> {deleting ? '...' : 'Delete'}
            </button>
          )}
          <button onClick={toggleLike}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', cursor: 'pointer', color: liked ? '#FF4D00' : '#ccc', fontSize: '0.65rem', backdropFilter: 'blur(8px)', transition: 'color 0.2s' }}>
            <Heart size={12} fill={liked ? '#FF4D00' : 'none'} /> {likes}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 10px', color: '#ccc', fontSize: '0.65rem', backdropFilter: 'blur(8px)' }}>
            <MessageCircle size={12} /> {post.commentCount || 0}
          </div>
        </div>

        {/* No image placeholder text */}
        {!imgSrc && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Film size={40} color="rgba(255,255,255,0.06)" />
          </div>
        )}
      </div>

      {/* ── TEXT AREA ── */}
      <div style={{ padding: '0.9rem 1.1rem' }}>
        {/* Topics */}
        {post.topics?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {post.topics.map(t => (
              <span key={t} style={{ border: '1px solid #222', color: '#3A3A3A', padding: '1px 7px', borderRadius: 3, fontSize: '0.53rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Google Sans Flex',sans-serif" }}>{t}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#E8E8E8', lineHeight: 1.4, marginBottom: '0.35rem' }}>
          {post.title}
        </p>

        {/* Content preview */}
        {post.type === 'normal' && post.content && (
          <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.78rem', color: '#555', lineHeight: 1.55, marginBottom: '0.5rem',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.content}
          </p>
        )}
        {isDirectors && (
          <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.72rem', color: '#FF4D00', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            Tap to read the full Director's Cut →
          </p>
        )}

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#111', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#555', flexShrink: 0 }}>
            {post.authorId?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 600, fontSize: '0.72rem', color: '#666' }}>
            {post.authorId?.username || 'Anonymous'}
          </span>
          <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.58rem', color: '#2A2A2A' }}>• {timeAgo(post.createdAt)}</span>
        </div>
      </div>
    </motion.article>
  );
}

function PostSkeleton() {
  return (
    <div style={{ marginBottom: '1.25rem', border: '1px solid #1A1A1A', borderRadius: 8, overflow: 'hidden' }}>
      <div className="skel" style={{ height: 240 }} />
      <div style={{ padding: '0.9rem 1.1rem' }}>
        <div className="skel" style={{ height: 14, width: '70%', marginBottom: 8 }} />
        <div className="skel" style={{ height: 11, width: '40%' }} />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Spaces() {
  const [activeTopics, setActiveTopics] = useState([]);
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [hasMore,    setHasMore]    = useState(true);
  const [loadingMore,setLoadingMore]= useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const { isAuth, user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [myPostsOnly, setMyPostsOnly] = useState(false);

  const fetchPosts = useCallback(async (pg = 1, topics = activeTopics, myOnly = myPostsOnly) => {
    if (pg === 1) setLoading(true); else setLoadingMore(true);
    try {
      const params = new URLSearchParams({ page: pg, limit: 10, sort: 'latest' });
      if (topics.length === 1) params.set('topic', topics[0]);
      if (myOnly && currentUserId) params.set('author', currentUserId);
      const { data } = await api.get(`/spaces/posts?${params}`);
      const results = data.data || [];
      setPosts(prev => pg === 1 ? results : [...prev, ...results]);
      setHasMore(pg < (data.pages || 1));
      setPage(pg);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, [activeTopics, myPostsOnly, currentUserId]);

  useEffect(() => { fetchPosts(1, activeTopics, myPostsOnly); }, [activeTopics, myPostsOnly]);

  const toggleTopic = (t) =>
    setActiveTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreate(false);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const displayed = activeTopics.length > 1
    ? posts.filter(p => p.topics?.some(t => activeTopics.includes(t)))
    : posts;

  return (
    <div className="page" style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── Centered row: sidebar + feed ── */}
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'flex-start', padding: '0 1.5rem' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 260, flexShrink: 0,
          position: 'sticky', top: 'var(--nav-h)',
          height: 'calc(100vh - var(--nav-h))',
          paddingTop: '2.5rem', paddingBottom: '2rem',
          overflowY: 'auto',
        }}>
          {/* Topics box */}
          <div style={{
            background: '#0A0A0A',
            border: '1px solid #1E1E1E',
            borderRadius: 14,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #161616',
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#0D0D0D',
            }}>
              <div style={{ width: 9, height: 9, background: '#FF4D00', borderRadius: '50%', boxShadow: '0 0 8px #FF4D0088' }} />
              <span style={{
                fontFamily: "'Google Sans Flex',sans-serif",
                fontSize: '0.7rem', fontWeight: 900,
                color: '#fff', letterSpacing: '0.18em',
              }}>TOPICS</span>
            </div>

            {/* Topic rows */}
            <div style={{ padding: '0.5rem 0' }}>
              {TOPICS.map(t => {
                const on = activeTopics.includes(t);
                return (
                  <button key={t} onClick={() => toggleTopic(t)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', border: 'none', cursor: 'pointer',
                      padding: '11px 1.25rem',
                      background: on ? 'rgba(255,77,0,0.10)' : 'transparent',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => { if (!on) e.currentTarget.style.background = '#111'; }}
                    onMouseLeave={e => { if (!on) e.currentTarget.style.background = 'transparent'; }}>
                    {/* Checkbox */}
                    <span style={{
                      width: 19, height: 19, borderRadius: 5, flexShrink: 0,
                      border: `2px solid ${on ? '#FF4D00' : '#2A2A2A'}`,
                      background: on ? '#FF4D00' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                      {on && <span style={{ width: 8, height: 8, background: '#000', borderRadius: 2, display: 'block' }} />}
                    </span>
                    {/* Label */}
                    <span style={{
                      fontFamily: "'Google Sans Flex',sans-serif",
                      fontSize: '0.95rem',
                      fontWeight: on ? 700 : 400,
                      color: on ? '#fff' : '#888',
                      transition: 'color .15s',
                    }}>{t}</span>
                    {/* Active dot */}
                    {on && <span style={{ marginLeft: 'auto', width: 7, height: 7, background: '#FF4D00', borderRadius: '50%', boxShadow: '0 0 6px #FF4D0099' }} />}
                  </button>
                );
              })}
            </div>

            {/* Clear all */}
          {activeTopics.length > 0 && (
            <div style={{ padding: '0.5rem 1rem 0rem' }}>
              <button onClick={() => setActiveTopics([])}
                style={{
                  width: '100%', padding: '9px',
                  background: 'transparent', border: '1px solid #1E1E1E',
                  color: '#555', fontFamily: "'Google Sans Flex',sans-serif",
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em',
                  cursor: 'pointer', borderRadius: 8, transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4D00'; e.currentTarget.style.color = '#FF4D00'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1E1E1E'; e.currentTarget.style.color = '#555'; }}>
                CLEAR ALL
              </button>
            </div>
          )}

          {/* My Posts button */}
          {isAuth && (
            <div style={{ padding: '0.75rem 1rem 1rem' }}>
              <button
                onClick={() => { setMyPostsOnly(m => !m); setActiveTopics([]); }}
                style={{
                  width: '100%', padding: '10px',
                  background: myPostsOnly ? '#FF4D00' : 'transparent',
                  border: `1px solid ${myPostsOnly ? '#FF4D00' : '#1E1E1E'}`,
                  color: myPostsOnly ? '#fff' : '#888',
                  fontFamily: "'Google Sans Flex',sans-serif",
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em',
                  cursor: 'pointer', borderRadius: 8, transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}
                onMouseEnter={e => { if (!myPostsOnly) { e.currentTarget.style.borderColor = '#FF4D00'; e.currentTarget.style.color = '#FF4D00'; } }}
                onMouseLeave={e => { if (!myPostsOnly) { e.currentTarget.style.borderColor = '#1E1E1E'; e.currentTarget.style.color = '#888'; } }}>
                <User size={13} /> My Posts
              </button>
            </div>
          )}
        </div>
      </aside>

        {/* ── FEED ── */}
        <main style={{ flex: 1, minWidth: 0, padding: '2.5rem 0' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #111' }}>
            <div>
              <h1 style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: 'clamp(3rem,8vw,5.5rem)', fontWeight: 900, lineHeight: 0.88, letterSpacing: '-0.02em' }}>
                {myPostsOnly ? 'MY POSTS' : 'SPACES'}
              </h1>
            </div>
            {isAuth && (
              <motion.button onClick={() => setShowCreate(true)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', background: '#FF4D00', color: '#fff', border: 'none', borderRadius: 6, fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', letterSpacing: '0.04em', flexShrink: 0 }}>
                <Plus size={14} /> New Post
              </motion.button>
            )}
          </div>

          {/* Posts */}
          {loading
            ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
            : displayed.length === 0
              ? (
                <div style={{ textAlign: 'center', paddingTop: '5rem' }}>
                  <Clapperboard size={36} color="#1A1A1A" style={{ margin: '0 auto 1rem' }} />
                  <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.65rem', color: '#222', letterSpacing: '0.1em' }}>NO POSTS IN SELECTED TOPICS</p>
                </div>
              )
              : (
                <>
                  <AnimatePresence>
                    {displayed.map((post, i) => <PostCard key={post._id} post={post} index={i} onDelete={handleDeletePost} currentUserId={currentUserId} />)}
                  </AnimatePresence>

                  {hasMore && (
                    <motion.button onClick={() => fetchPosts(page + 1)} disabled={loadingMore}
                      whileHover={{ y: -2 }}
                      style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #1A1A1A', color: '#333', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {loadingMore ? 'LOADING...' : <><ChevronDown size={13} /> LOAD MORE</>}
                    </motion.button>
                  )}
                </>
              )
          }
        </main>
      </div>

      <AnimatePresence>
        {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} onCreated={handlePostCreated} />}
      </AnimatePresence>
    </div>
  );
}
