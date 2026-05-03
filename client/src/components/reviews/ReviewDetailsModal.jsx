import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Heart, MessageCircle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../motion/DynamicIsland';
import { Link } from 'react-router-dom';

const CP_META = {
  masterpiece: { label: 'Masterpiece', emoji: '👑', color: '#A855F7' },
  engage:      { label: 'Engage',      emoji: '🔥', color: '#10B981' },
  chill:       { label: 'Chill Watch', emoji: '😌', color: '#F59E0B' },
  drop:        { label: 'Drop It',     emoji: '💀', color: '#EF4444' },
};

function StarDisplay({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#FF4D00', fontSize: '0.85rem' }}>★</span>
      <span className="t-mono" style={{ marginLeft: 4, color: '#E5E5E5' }}>{rating}/10</span>
    </div>
  );
}

export default function ReviewDetailsModal({ review, isOpen, onClose }) {
  const { user, isAuth } = useAuth();
  const [replies, setReplies] = useState(review.replies || []);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => document.body.style.overflow = 'auto';
  }, [isOpen]);

  if (!isOpen) return null;

  const cpMeta = review.cinePulseCategory ? CP_META[review.cinePulseCategory] : null;

  const handlePostReply = async () => {
    if (!isAuth) return notify('Sign in to reply', 'error');
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      const res = await api.post(`/reviews/${review._id}/reply`, { text: replyText });
      setReplies(res.data.data.replies);
      setReplyText('');
    } catch {
      notify('Failed to post reply', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          style={{ width: '100%', maxWidth: 1000, height: '80vh', background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 16, display: 'flex', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 48px rgba(0,0,0,0.5)' }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#111', border: '1px solid #1E1E1E', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
            <X size={16} />
          </button>

          {/* LEFT: ORIGINAL REVIEW */}
          <div style={{ flex: '1 1 50%', padding: '3rem 2.5rem', overflowY: 'auto', borderRight: '1px solid #111', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 48, height: 48, background: '#111', borderRadius: '50%', border: '1px solid #1E1E1E', overflow: 'hidden' }}>
                {review.userId?.avatar ? <img src={review.userId.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "Google Sans Flex", fontSize: '1.2rem', color: '#555' }}>{review.userId?.username?.[0]?.toUpperCase()}</span>}
              </div>
              <div>
                <h4 style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '1rem', color: '#E5E5E5', marginBottom: 2 }}>{review.userId?.username}</h4>
                <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.75rem', color: '#888' }}>@{review.userId?.username?.toLowerCase()}</p>
              </div>
              {cpMeta && (
                <div style={{ marginLeft: 'auto', background: `${cpMeta.color}15`, border: `1px solid ${cpMeta.color}40`, padding: '4px 10px', borderRadius: 20, color: cpMeta.color, fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {cpMeta.emoji} {cpMeta.label}
                </div>
              )}
            </div>
            
            <StarDisplay rating={review.rating} />

            <div style={{ marginTop: '1.5rem', flex: 1 }}>
              {review.title && <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1.2rem', fontWeight: 700, color: '#E5E5E5', marginBottom: '0.75rem' }}>{review.title}</h3>}
              <p style={{ fontFamily: "Google Sans Flex", fontSize: '1rem', color: '#A3A3A3', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{review.content}</p>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #111', display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#888', fontFamily: "Google Sans Flex", fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={16} color="#FF4D00" /> {review.likeCount || review.likes?.length || 0} Likes</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MessageCircle size={16} /> {replies.length} Replies</div>
              <div style={{ marginLeft: 'auto' }}>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>

          {/* RIGHT: REPLIES THREAD */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', background: '#050505' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #111' }}>
              <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Thread</h3>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {replies.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#555', fontFamily: "Google Sans Flex", fontSize: '0.85rem', marginTop: '2rem' }}>No replies yet. Be the first!</div>
              ) : (
                replies.map(reply => (
                  <div key={reply._id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: 32, height: 32, flexShrink: 0, background: '#111', borderRadius: '50%', overflow: 'hidden' }}>
                      {reply.userId?.avatar ? <img src={reply.userId.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#555' }}>{reply.userId?.username?.[0]?.toUpperCase() || '?'}</span>}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.85rem', fontWeight: 700, color: '#E5E5E5' }}>{reply.userId?.username}</span>
                        <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.65rem', color: '#555' }}>{new Date(reply.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.85rem', color: '#A3A3A3', lineHeight: 1.6 }}>{reply.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid #111', background: '#0A0A0A' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ width: 32, height: 32, flexShrink: 0, background: '#111', borderRadius: '50%', overflow: 'hidden' }}>
                  {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#555' }}>{user?.username?.[0]?.toUpperCase() || '?'}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Add a comment..." 
                    style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontFamily: "Google Sans Flex", fontSize: '0.85rem', outline: 'none', resize: 'none', minHeight: 40 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button onClick={handlePostReply} disabled={!replyText.trim() || loading} style={{ background: replyText.trim() ? '#fff' : '#222', color: replyText.trim() ? '#000' : '#555', border: 'none', padding: '6px 16px', borderRadius: 20, fontFamily: "Google Sans Flex", fontSize: '0.75rem', fontWeight: 700, cursor: replyText.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                      {loading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
