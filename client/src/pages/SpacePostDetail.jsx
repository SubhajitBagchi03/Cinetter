import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Share2, MessageCircle, Send, X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { getSocket } from '../lib/socket';
import { notify } from '../components/motion/DynamicIsland';

const TMDB_IMG = (p, size = 'w1280') =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : null;

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Share Modal ───────────────────────────────────────────────────────────
const PROXY = (url) =>
  url?.startsWith('https://image.tmdb.org/')
    ? `/api/v1/spaces/proxy-image?url=${encodeURIComponent(url)}`
    : url;

function ShareModal({ post, onClose }) {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  // Resolve the best available image
  const rawImg = post.images?.[0]
    || (post.taggedMedia?.backdrop_path ? TMDB_IMG(post.taggedMedia.backdrop_path) : null)
    || (post.taggedMedia?.poster_path   ? TMDB_IMG(post.taggedMedia.poster_path, 'w780') : null);

  // Proxied version for crossOrigin canvas capture
  const proxiedImg = rawImg ? PROXY(rawImg) : null;

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, { useCORS: true, backgroundColor: '#000' });
      const link = document.createElement('a');
      link.download = `cinetter-${post._id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch { notify('Download failed', 'error'); }
    finally { setDownloading(false); }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/spaces/${post._id}`);
      notify('Link copied to clipboard!', 'success');
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement('textarea');
      el.value = `${window.location.origin}/spaces/${post._id}`;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      notify('Link copied!', 'success');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 12, width: '100%', maxWidth: 480, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #111' }}>
          <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>Share Post</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Branded card — captured by html2canvas using proxied URLs */}
        <div ref={cardRef} style={{ background: '#000', padding: '1.25rem' }}>
          {proxiedImg && (
            <div style={{ borderRadius: 6, overflow: 'hidden', marginBottom: '0.85rem', height: 200, position: 'relative', background: '#0A0A0A' }}>
              <img src={proxiedImg} alt="" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
          <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#E5E5E5', marginBottom: '0.4rem', lineHeight: 1.4 }}>{post.title}</p>
          {post.taggedMedia && (
            <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.72rem', color: '#555', marginBottom: '0.6rem' }}>{post.taggedMedia.title}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #111' }}>
            <img src="/logo.png" alt="Cinetter" style={{ height: 18, opacity: 0.7 }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '1rem 1.25rem' }}>
          <button onClick={download} disabled={downloading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', background: '#111', border: '1px solid #1E1E1E', color: '#E5E5E5', borderRadius: 8, fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
            <Download size={14} /> {downloading ? 'Saving...' : 'Download'}
          </button>
          <button onClick={copyLink}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', background: '#FF4D00', border: 'none', color: '#fff', borderRadius: 8, fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
            <Share2 size={14} /> Share Link
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Single comment (with replies) ─────────────────────────────────────────
function Comment({ comment, postId, onReply, isAuth }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likeCount || 0);
  const [showReplies, setShowReplies] = useState(false);

  const toggleLike = async () => {
    if (!isAuth) return;
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    await api.post(`/spaces/posts/${postId}/comments/${comment._id}/like`).catch(() => {});
  };

  return (
    <div style={{ padding: '0.85rem 0', borderBottom: '1px solid #0A0A0A' }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', color: '#555' }}>
          {comment.authorId?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.78rem', color: '#E5E5E5' }}>{comment.authorId?.username}</span>
            <span className="t-mono" style={{ fontSize: '0.58rem', color: '#333' }}>{timeAgo(comment.createdAt)}</span>
          </div>
          <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.82rem', color: '#AAA', lineHeight: 1.55 }}>{comment.content}</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: 8 }}>
            <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#FF4D00' : '#555', fontSize: '0.65rem', fontFamily: "'Google Sans Flex',sans-serif" }}>
              <Heart size={12} fill={liked ? '#FF4D00' : 'none'} /> {likes}
            </button>
            {isAuth && (
              <button onClick={() => onReply(comment)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '0.65rem', fontFamily: "'Google Sans Flex',sans-serif" }}>Reply</button>
            )}
            {comment.replyCount > 0 && (
              <button onClick={() => setShowReplies(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: '0.65rem', fontFamily: "'Google Sans Flex',sans-serif" }}>
                — {showReplies ? 'Hide' : `View all ${comment.replyCount} replies`}
              </button>
            )}
          </div>
          {/* Inline preview replies — only show after user clicks "View all N replies" */}
          {showReplies && comment.replies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: 8, paddingLeft: '1rem', borderLeft: '2px solid #1A1A1A' }}>
              {comment.replies.map(r => (
                <div key={r._id} style={{ padding: '6px 0' }}>
                  <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.72rem', color: '#666', marginRight: 6 }}>{r.authorId?.username}</span>
                  <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.78rem', color: '#666' }}>{r.content}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main detail page ──────────────────────────────────────────────────────
export default function SpacePostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { isAuth, user } = useAuth();
  const [post,     setPost]     = useState(null);
  const [comments, setComments] = useState([]);
  const [sort,     setSort]     = useState('newest');
  const [text,     setText]     = useState('');
  const [replyTo,  setReplyTo]  = useState(null); // comment being replied to
  const [posting,  setPosting]  = useState(false);
  const [liked,    setLiked]    = useState(false);
  const [likes,    setLikes]    = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [loadingCmts, setLoadingCmts] = useState(true);
  const inputRef = useRef(null);

  // Fetch post
  useEffect(() => {
    api.get(`/spaces/posts/${postId}`)
      .then(({ data }) => { setPost(data.data); setLikes(data.data.likeCount || 0); })
      .catch(() => navigate('/spaces'));
  }, [postId]);

  // Fetch comments
  const fetchComments = async (s = sort) => {
    setLoadingCmts(true);
    try {
      const { data } = await api.get(`/spaces/posts/${postId}/comments?sort=${s}&limit=30`);
      setComments(data.data || []);
    } finally { setLoadingCmts(false); }
  };

  useEffect(() => { if (postId) fetchComments(sort); }, [postId, sort]);

  // Real-time comments via Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const socket = getSocket(token);
    if (!socket) return;
    socket.emit('join:space', postId);
    socket.on('new_comment', (c) => {
      if (!c.parentCommentId) {
        setComments(prev => [c, ...prev]);
      }
    });
    return () => {
      socket.emit('leave:space', postId);
      socket.off('new_comment');
    };
  }, [postId]);

  const toggleLike = async () => {
    if (!isAuth) { notify('Sign in to like', 'error'); return; }
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    await api.post(`/spaces/posts/${postId}/like`).catch(() => {});
  };

  const submitComment = async () => {
    if (!text.trim() || !isAuth || posting) return;
    setPosting(true);
    try {
      const payload = { content: text.trim() };
      if (replyTo) payload.parentCommentId = replyTo._id;
      await api.post(`/spaces/posts/${postId}/comments`, payload);
      setText(''); setReplyTo(null);
      if (!replyTo) fetchComments(sort); // refresh top-level
      notify('Comment posted', 'success');
    } catch { notify('Failed to post', 'error'); }
    finally { setPosting(false); }
  };

  const handleReply = (c) => {
    setReplyTo(c);
    setText(`@${c.authorId?.username} `);
    inputRef.current?.focus();
  };

  if (!post) return (
    <div className="page" style={{ paddingTop: 'calc(var(--nav-h) + 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skel" style={{ width: 48, height: 48, borderRadius: '50%' }} />
    </div>
  );

  const displayImages = post.images?.length
    ? post.images
    : post.taggedMedia?.backdrop_path
      ? [TMDB_IMG(post.taggedMedia.backdrop_path)]
      : [];

  const content = post.type === 'directors_chair' ? post.aiContent : post.content;

  return (
    <div className="page" style={{ paddingTop: 'var(--nav-h)', background: '#000', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 4rem' }}>

        {/* Back */}
        <div style={{ padding: '1rem 1rem 0' }}>
          <button onClick={() => navigate('/spaces')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.75rem' }}>
            <ArrowLeft size={14} /> Back to Spaces
          </button>
        </div>

        {/* Images */}
        {displayImages.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: displayImages.length === 1 ? '1fr' : displayImages.length === 2 ? '1fr 1fr' : '1fr 1fr', gap: 3, marginTop: '1rem' }}>
            {displayImages.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt="" style={{ width: '100%', height: displayImages.length === 1 ? 420 : 210, objectFit: 'cover', display: 'block' }} />
            ))}
          </div>
        )}

        {/* Content area */}
        <div style={{ padding: '1.25rem 1rem' }}>
          {/* Badges */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {post.type === 'directors_chair' && (
              <span style={{ background: '#FFFFFF10', border: '1px solid #FFFFFF20', color: '#aaa', padding: '3px 8px', borderRadius: 3, fontSize: '0.58rem', letterSpacing: '0.1em' }}>DIRECTOR'S CUT</span>
            )}
            {post.topics?.map(t => (
              <span key={t} style={{ border: '1px solid #1E1E1E', color: '#444', padding: '3px 8px', borderRadius: 3, fontSize: '0.58rem', letterSpacing: '0.08em' }}>{t}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 800, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', lineHeight: 1.35, color: '#F0F0F0', marginBottom: '0.75rem' }}>
            {post.title}
          </h1>

          {/* Director's Chair user take note */}
          {post.type === 'directors_chair' && post.userTake && (
            <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderLeft: '3px solid #FF4D00', padding: '0.6rem 0.85rem', marginBottom: '1rem', borderRadius: 4 }}>
              <p className="t-mono" style={{ fontSize: '0.55rem', color: '#FF4D00', marginBottom: 4 }}>AUTHOR'S TAKE</p>
              <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.78rem', color: '#666', fontStyle: 'italic' }}>"{post.userTake}"</p>
            </div>
          )}

          {/* Body */}
          {content && (
            <div style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.92rem', color: '#AAA', lineHeight: 1.75, marginBottom: '1.25rem', whiteSpace: 'pre-wrap' }}>
              {content}
            </div>
          )}

          {/* Meta + actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #111', flexWrap: 'wrap' }}>
            {post.authorRole === 'admin' && (
              <span style={{ background: '#FF4D00', color: '#000', fontSize: '0.5rem', fontWeight: 800, padding: '1px 5px', borderRadius: 2 }}>CINETTER</span>
            )}
            <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 600, fontSize: '0.78rem', color: '#888' }}>By {post.authorId?.username}</span>
            <span className="t-mono" style={{ fontSize: '0.6rem', color: '#333' }}>• {timeAgo(post.createdAt)}</span>

            {post.taggedMedia && (
              <Link to={`/movie/${post.taggedMedia.tmdbId}?type=${post.taggedMedia.media_type}`}
                style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 4, padding: '3px 8px', textDecoration: 'none', marginLeft: 4 }}>
                {post.taggedMedia.poster_path && (
                  <img src={`https://image.tmdb.org/t/p/w92${post.taggedMedia.poster_path}`} alt=""
                    style={{ width: 14, height: 20, objectFit: 'cover', borderRadius: 2 }} />
                )}
                <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.65rem', color: '#888' }}>{post.taggedMedia.title}</span>
              </Link>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <button onClick={toggleLike} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#FF4D00' : '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.72rem' }}>
                <Heart size={15} fill={liked ? '#FF4D00' : 'none'} /> {likes}
              </button>
              <button onClick={() => setShowShare(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#111', border: '1px solid #1E1E1E', borderRadius: 20, color: '#E5E5E5', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>
        </div>

        {/* ── COMMENTS ── */}
        <div style={{ borderTop: '1px solid #111', padding: '1.25rem 1rem' }}>
          {/* Sort tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: '1.25rem' }}>
            {['newest', 'top'].map(s => (
              <button key={s} onClick={() => setSort(s)}
                style={{ padding: '5px 14px', borderRadius: 20, border: `1px solid ${sort === s ? '#fff' : '#1E1E1E'}`, background: sort === s ? '#fff' : 'transparent', color: sort === s ? '#000' : '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Comment input */}
          {isAuth ? (
            <div style={{ marginBottom: '1.5rem' }}>
              {replyTo && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, padding: '4px 8px', background: '#0A0A0A', borderRadius: 4 }}>
                  <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.68rem', color: '#555' }}>Replying to @{replyTo.authorId?.username}</span>
                  <button onClick={() => { setReplyTo(null); setText(''); }} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', marginLeft: 'auto' }}><X size={12} /></button>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem', color: '#555' }}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                  <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), submitComment())}
                    placeholder="Write a comment..."
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#E5E5E5', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.82rem' }} />
                  <button onClick={submitComment} disabled={!text.trim() || posting}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: text.trim() ? '#FF4D00' : '#333', transition: 'color .15s' }}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1px dashed #1E1E1E', borderRadius: 8, color: '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.78rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
              Sign in to join the conversation
            </Link>
          )}

          {/* Comments list */}
          {loadingCmts ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '0.85rem 0', borderBottom: '1px solid #0A0A0A' }}>
                <div className="skel" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="skel" style={{ height: 12, width: '30%', marginBottom: 6 }} />
                  <div className="skel" style={{ height: 14, width: '80%' }} />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <p className="t-mono" style={{ color: '#333', textAlign: 'center', paddingTop: '2rem' }}>No comments yet. Start the conversation.</p>
          ) : (
            comments.map(c => (
              <Comment key={c._id} comment={c} postId={postId} onReply={handleReply} isAuth={isAuth} />
            ))
          )}
        </div>
      </div>

      {/* Share modal */}
      <AnimatePresence>
        {showShare && <ShareModal post={post} onClose={() => setShowShare(false)} />}
      </AnimatePresence>
    </div>
  );
}
