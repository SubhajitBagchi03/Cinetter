import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MessageCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { notify } from '../motion/DynamicIsland';
import ReviewDetailsModal from './ReviewDetailsModal';

const CP_META = {
  masterpiece: { label: 'Masterpiece', emoji: '👑', color: '#A855F7' },
  engage:      { label: 'Engage',      emoji: '🔥', color: '#10B981' },
  chill:       { label: 'Chill Watch', emoji: '😌', color: '#F59E0B' },
  drop:        { label: 'Drop It',     emoji: '💀', color: '#EF4444' },
};

function StarDisplay({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={12} fill={n <= Math.ceil(rating / 2) ? '#FF4D00' : 'none'} color={n <= Math.ceil(rating / 2) ? '#FF4D00' : '#333'} />
      ))}
      <span className="t-mono" style={{ marginLeft: 4 }}>{rating}/10</span>
    </div>
  );
}

export default function ReviewCard({ review, onDelete }) {
  const { user, isAuth } = useAuth();
  const [liked, setLiked] = useState(review.likes?.includes(user?._id) || false);
  const [likeCount, setLikeCount] = useState(review.likeCount || review.likes?.length || 0);
  const [showFull, setShowFull] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isOwn = user?._id === review.userId?._id?.toString() || user?.id === review.userId?._id?.toString();
  const cpMeta = review.cinePulseCategory ? CP_META[review.cinePulseCategory] : null;

  const toggleLike = async () => {
    if (!isAuth) { notify('Sign in to like reviews', 'error'); return; }
    setLiked(l => !l);
    setLikeCount(n => liked ? n - 1 : n + 1);
    await api.post(`/reviews/${review._id}/like`).catch(() => { setLiked(l => !l); setLikeCount(n => liked ? n + 1 : n - 1); });
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    try { await api.delete(`/reviews/${review._id}`); onDelete?.(review._id); notify('Review deleted', 'info'); }
    catch { notify('Delete failed', 'error'); }
  };

  const isLong = review.content?.length > 280;
  const displayContent = (!showFull && isLong) ? review.content.slice(0, 280) + '...' : review.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ border: '1px solid #1E1E1E', padding: '1.5rem', position: 'relative', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#2A2A2A'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#1E1E1E'}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <Link to={`/profile/${review.userId?._id}`} style={{ textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {review.userId?.avatar
              ? <img src={review.userId.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#555' }}>{review.userId?.username?.[0]?.toUpperCase()}</span>
            }
          </div>
        </Link>
        <Link to={`/profile/${review.userId?._id}`} style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.82rem', color: '#E5E5E5' }}>{review.userId?.username}</span>
        </Link>
        <StarDisplay rating={review.rating} />
        {cpMeta && (
          <span style={{ padding: '2px 8px', border: `1px solid ${cpMeta.color}30`, color: cpMeta.color, fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {cpMeta.emoji} {cpMeta.label}
          </span>
        )}
        <span className="t-mono" style={{ marginLeft: 'auto', fontSize: '0.58rem' }}>
          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <h4 style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', color: '#E5E5E5', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {review.title}
        </h4>
      )}

      {/* Spoiler gate */}
      {review.spoiler && !spoilerRevealed ? (
        <div style={{ border: '1px dashed #EF444450', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="#EF4444" />
            <span className="t-mono" style={{ color: '#EF4444', fontSize: '0.62rem' }}>Contains spoilers</span>
          </div>
          <button onClick={() => setSpoilerRevealed(true)}
            style={{ background: 'none', border: '1px solid #EF444450', padding: '3px 10px', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.58rem', color: '#EF4444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Reveal →
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{ color: '#A3A3A3', fontSize: '0.875rem', lineHeight: 1.7 }}>{displayContent}</p>
          {isLong && (
            <button onClick={() => setShowFull(s => !s)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4, color: '#FF4D00', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {showFull ? 'Show less ↑' : 'Read more →'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #111' }}>
        <button onClick={toggleLike}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#FF4D00' : '#555', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}>
          <Heart size={12} fill={liked ? '#FF4D00' : 'none'} /> {likeCount}
        </button>
        <button onClick={() => setIsModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          <MessageCircle size={12} /> {review.replies?.length || 0}
        </button>
        {isOwn && (
          <button onClick={handleDelete}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase', marginLeft: 'auto', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#333'}
          >
            Delete
          </button>
        )}
      </div>

      <ReviewDetailsModal review={review} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
}
