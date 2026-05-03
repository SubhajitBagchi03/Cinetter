import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Star, AlertTriangle, X } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../motion/DynamicIsland';

const CP = {
  masterpiece: { label: 'Masterpiece', emoji: '👑', color: '#A855F7' },
  engage:      { label: 'Engage',      emoji: '🔥', color: '#10B981' },
  chill:       { label: 'Chill Watch', emoji: '😌', color: '#F59E0B' },
  drop:        { label: 'Drop It',     emoji: '💀', color: '#EF4444' },
};

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(null);
  const display = hovered ?? value;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange(n)}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(null)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}
        >
          <Star
            size={17}
            fill={n <= display ? '#FF4D00' : 'none'}
            color={n <= display ? '#FF4D00' : '#333'}
          />
        </button>
      ))}
      <span className="t-mono" style={{ marginLeft: 8, alignSelf: 'center' }}>{value}/10</span>
    </div>
  );
}

export default function ReviewForm({ movieId, mediaType = 'movie', onSuccess }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ content: '', rating: 7, cinePulseCategory: '', spoiler: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.content.trim() || form.content.length < 20) { notify('Review too short (min 20 chars)', 'error'); return; }
    setLoading(true);
    try {
      await api.post('/reviews', { movieId: Number(movieId), mediaType, ...form });
      notify('Review posted!', 'success');
      setForm({ content: '', rating: 7, cinePulseCategory: '', spoiler: false });
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to post', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ border: '1px solid #1E1E1E', padding: '1.5rem', marginBottom: '2rem', background: '#050505' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ width: 32, height: 32, background: '#111', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333' }}>
          <span style={{ fontSize: '0.9rem', color: '#555', fontFamily: "Google Sans Flex" }}>Me</span>
        </div>
        <p className="t-mono" style={{ color: '#A3A3A3', fontSize: '0.8rem' }}>Write your review...</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Rating & CinePulse Inline */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#0A0A0A', padding: 4, borderRadius: 30, border: '1px solid #1E1E1E' }}>
            {Object.entries(CP).map(([cat, meta]) => (
              <button key={cat} type="button"
                onClick={() => setForm(f => ({ ...f, cinePulseCategory: f.cinePulseCategory === cat ? '' : cat }))}
                style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: form.cinePulseCategory === cat ? meta.color : 'transparent', color: form.cinePulseCategory === cat ? '#000' : '#888', fontFamily: "Google Sans Flex", fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                {form.cinePulseCategory === cat ? meta.emoji : ''} {meta.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', marginTop: '0.5rem' }}>
          <textarea className="input" value={form.content}
            onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
            placeholder="What did you think? Be detailed..." rows={4}
            required minLength={20}
            style={{ background: 'transparent', border: '1px solid #1E1E1E', padding: '1rem', fontSize: '0.9rem', fontFamily: "Google Sans Flex", lineHeight: 1.6, resize: 'vertical' }} />
          <span className="t-mono" style={{ position: 'absolute', bottom: 12, right: 12, fontSize: '0.65rem', color: form.content.length < 20 ? '#EF4444' : '#555' }}>
            {form.content.length} / 1000
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {/* Spoiler toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => setForm(f => ({ ...f, spoiler: !f.spoiler }))}>
            <div style={{ width: 16, height: 16, border: `1px solid ${form.spoiler ? '#EF4444' : '#333'}`, background: form.spoiler ? '#EF444420' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {form.spoiler && <AlertTriangle size={10} color="#EF4444" />}
            </div>
            <span className="t-mono" style={{ color: form.spoiler ? '#EF4444' : '#555', fontSize: '0.7rem' }}>Contains spoilers</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary"
            style={{ padding: '8px 24px', fontSize: '0.8rem', borderRadius: 30, background: '#fff', color: '#000', clipPath: 'none', border: 'none' }}>
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
