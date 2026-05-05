import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Upload, Sparkles, Loader2, ImagePlus } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../motion/DynamicIsland';

const TMDB_IMG = (p, size = 'w185') =>
  p ? `https://image.tmdb.org/t/p/${size}${p}` : null;

const TOPICS = ['Indian', 'International', 'Anime', 'Sports', 'Games'];

// ── Movie/Show search ─────────────────────────────────────────────────────
function MediaSearch({ onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  const search = (val) => {
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/movies/search?q=${encodeURIComponent(val)}&page=1`);
        const r = data.data?.results || data.data || [];
        setResults(r.slice(0, 8));
      } catch { } finally { setLoading(false); }
    }, 350);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 8, padding: '8px 12px' }}>
        <Search size={14} color="#555" />
        <input value={q} onChange={e => search(e.target.value)}
          placeholder="Search movies or shows..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#E5E5E5', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.82rem' }} />
        {loading && <Loader2 size={14} color="#555" className="spin" />}
      </div>
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#0D0D0D', border: '1px solid #1E1E1E', borderRadius: 8, zIndex: 100, maxHeight: 300, overflowY: 'auto' }}>
            {results.map(r => {
              const isTV = r.media_type === 'tv' || (!r.title && r.name);
              return (
                <button key={r.id} onClick={() => { onSelect({ ...r, media_type: isTV ? 'tv' : 'movie' }); setResults([]); setQ(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #111' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#111'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  {r.poster_path
                    ? <img src={TMDB_IMG(r.poster_path)} alt="" style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 3 }} />
                    : <div style={{ width: 32, height: 44, background: '#111', borderRadius: 3 }} />
                  }
                  <div>
                    <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#E5E5E5', marginBottom: 2 }}>{r.title || r.name}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#555' }}>{isTV ? 'Show' : 'Film'} · {(r.release_date || r.first_air_date || '').slice(0, 4)}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────
export default function CreatePostModal({ onClose, onCreated }) {
  const [type, setType] = useState('normal');
  const [taggedMedia, setTaggedMedia] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userTake, setUserTake] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [topics, setTopics] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  const selectMedia = (m) => {
    setTaggedMedia({
      tmdbId:       m.id,
      title:        m.title || m.name,
      poster_path:  m.poster_path || null,
      backdrop_path:m.backdrop_path || null,
      media_type:   m.media_type,
    });
    setAiContent(''); // reset if media changes
  };

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 4 - imageFiles.length);
    setImageFiles(prev => [...prev, ...arr].slice(0, 4));
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setImagePreviews(prev => [...prev, e.target.result].slice(0, 4));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleTopic = (t) => setTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  // Generate Director's Chair AI content
  const generate = async () => {
    if (!taggedMedia?.tmdbId || !userTake.trim()) {
      notify('Tag a movie/show and write your take first', 'error'); return;
    }
    setGenerating(true);
    try {
      const { data } = await api.post('/ai/spaces-directors-chair', {
        tmdbId:    taggedMedia.tmdbId,
        mediaType: taggedMedia.media_type,
        userTake:  userTake.trim(),
      });
      setAiContent(data.data?.aiContent || '');
      notify('AI content generated!', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Generation failed. Check GROQ_API_KEY in server/.env';
      notify(msg, 'error');
    } finally { setGenerating(false); }
  };

  const submit = async () => {
    if (!taggedMedia) { notify('Movie/show tag is required', 'error'); return; }
    if (!title.trim()) { notify('Title is required', 'error'); return; }
    if (type === 'directors_chair' && !aiContent) { notify('Generate the AI content first', 'error'); return; }
    setSubmitting(true);
    try {
      // 1. Upload images if any
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const form = new FormData();
        imageFiles.forEach(f => form.append('images', f));
        const { data: uploadData } = await api.post('/spaces/upload-images', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrls = uploadData.data || [];
      }

      // 2. Create post
      const payload = {
        type, title: title.trim(), topics, taggedMedia, images: imageUrls,
        ...(type === 'normal' ? { content: content.trim() } : { userTake: userTake.trim(), aiContent }),
      };
      const { data } = await api.post('/spaces/posts', payload);
      onCreated(data.data);
      notify('Post created!', 'success');
    } catch (err) {
      notify(err?.response?.data?.message || 'Failed to create post', 'error');
    } finally { setSubmitting(false); }
  };

  const canSubmit = taggedMedia && title.trim() &&
    (type === 'normal' || (type === 'directors_chair' && aiContent));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.94, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#050505', border: '1px solid #1E1E1E', borderRadius: 12, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.25rem', borderBottom: '1px solid #111', position: 'sticky', top: 0, background: '#050505', zIndex: 10 }}>
          <span style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 800, fontSize: '0.95rem' }}>New Post</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Type toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: '1.25rem', background: '#0A0A0A', padding: 4, borderRadius: 8, border: '1px solid #1A1A1A' }}>
            {[['normal', 'Normal Post'], ['directors_chair', "Director's Chair"]].map(([k, l]) => (
              <button key={k} onClick={() => setType(k)}
                style={{ padding: '8px', borderRadius: 6, border: 'none', background: type === k ? '#fff' : 'transparent', color: type === k ? '#000' : '#555', fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer', transition: 'all .15s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Step 1: Tag movie/show (REQUIRED) */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#555', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TAG MOVIE / SHOW <span style={{ color: '#FF4D00' }}>*</span></label>
            {taggedMedia ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0A0A0A', border: '1px solid #FF4D0040', borderRadius: 8 }}>
                {taggedMedia.poster_path && (
                  <img src={TMDB_IMG(taggedMedia.poster_path)} alt="" style={{ width: 30, height: 42, objectFit: 'cover', borderRadius: 3 }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.82rem', color: '#E5E5E5' }}>{taggedMedia.title}</p>
                  <p className="t-mono" style={{ fontSize: '0.58rem', color: '#555' }}>{taggedMedia.media_type === 'tv' ? 'Show' : 'Film'}</p>
                </div>
                <button onClick={() => { setTaggedMedia(null); setAiContent(''); }}
                  style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}><X size={14} /></button>
              </div>
            ) : (
              <MediaSearch onSelect={selectMedia} />
            )}
          </div>

          {/* Director's Chair specific fields — shown immediately when type is selected */}
          {type === 'directors_chair' && (
            <div style={{ marginBottom: '1.1rem', background: '#080808', border: '1px solid #1E1E1E', borderLeft: '3px solid #FF4D00', borderRadius: 8, padding: '0.85rem 1rem' }}>
              <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', fontWeight: 800, color: '#FF4D00', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>DIRECTOR'S CHAIR FLOW</p>

              {/* Step 1 hint */}
              {!taggedMedia && (
                <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.75rem', color: '#444', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                  Step 1: Tag the movie or show above ↑
                </p>
              )}

              {/* Step 2: your take (always shown, disabled hint if no movie) */}
              <label style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', fontWeight: 700, color: taggedMedia ? '#888' : '#333', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                YOUR TAKE {taggedMedia ? '(1-3 sentences)' : '— tag a movie first'}
              </label>
              <textarea value={userTake} onChange={e => setUserTake(e.target.value)}
                disabled={!taggedMedia}
                placeholder={taggedMedia ? 'e.g. "I think the ending should have been different because..."' : 'Tag a movie above to unlock this field'}
                rows={3}
                style={{ width: '100%', background: taggedMedia ? '#0A0A0A' : '#050505', border: '1px solid #1E1E1E', borderRadius: 8, padding: '10px 12px', color: taggedMedia ? '#E5E5E5' : '#333', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.82rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', cursor: taggedMedia ? 'text' : 'not-allowed', transition: 'all .2s' }} />

              <motion.button onClick={generate} disabled={!taggedMedia || !userTake.trim() || generating}
                whileHover={taggedMedia && userTake.trim() ? { scale: 1.02 } : {}}
                style={{ marginTop: 8, width: '100%', padding: '9px', background: taggedMedia && userTake.trim() ? '#FF4D00' : '#0A0A0A', border: `1px solid ${taggedMedia && userTake.trim() ? '#FF4D00' : '#1E1E1E'}`, borderRadius: 8, color: taggedMedia && userTake.trim() ? '#fff' : '#333', fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 700, fontSize: '0.75rem', cursor: taggedMedia && userTake.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .2s' }}>
                {generating ? <><Loader2 size={14} className="spin" /> Generating with AI...</> : <><Sparkles size={14} /> Generate with AI</>}
              </motion.button>

              {aiContent && (
                <div style={{ marginTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.55rem', fontWeight: 800, color: '#FF4D00', letterSpacing: '0.1em' }}>
                      ✓ GENERATED — EDIT IF NEEDED
                    </p>
                    <button onClick={generate} disabled={generating}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={10} /> Regenerate
                    </button>
                  </div>
                  <textarea
                    value={aiContent}
                    onChange={e => setAiContent(e.target.value)}
                    rows={10}
                    style={{
                      width: '100%', background: '#050505',
                      border: '1px solid #FF4D0030', borderRadius: 8,
                      padding: '12px', color: '#CCC',
                      fontFamily: "'Google Sans Flex',sans-serif",
                      fontSize: '0.82rem', lineHeight: 1.7,
                      outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', whiteSpace: 'pre-wrap',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.6rem', fontWeight: 700, color: '#555', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>
              {type === 'directors_chair' ? 'POST HEADING (shown in feed)' : 'TITLE'} <span style={{ color: '#FF4D00' }}>*</span>
            </label>
            <input value={title} onChange={e => setTitle(e.target.value)} maxLength={200}
              placeholder={type === 'directors_chair' ? 'e.g. What if Murph entered the tesseract instead?' : 'Post title'}
              style={{ width: '100%', background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 8, padding: '10px 12px', color: '#E5E5E5', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Content (normal posts only) */}
          {type === 'normal' && (
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#555', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>CAPTION (max 4 lines)</label>
              <textarea value={content} onChange={e => setContent(e.target.value)} maxLength={600} rows={4}
                placeholder="Share your thoughts..."
                style={{ width: '100%', background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 8, padding: '10px 12px', color: '#E5E5E5', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.82rem', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          {/* Image upload */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#555', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>IMAGES (up to 4) — leave empty to use movie backdrop</label>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
              onChange={e => handleFiles(e.target.files)} />

            {imagePreviews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
                    <img src={src} alt="" style={{ width: '100%', height: 70, objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            {imagePreviews.length < 4 && (
              <button onClick={() => fileRef.current?.click()}
                style={{ width: '100%', padding: '10px', background: '#0A0A0A', border: '1px dashed #1E1E1E', borderRadius: 8, color: '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <ImagePlus size={14} /> {imagePreviews.length > 0 ? `Add more (${4 - imagePreviews.length} left)` : 'Upload images'}
              </button>
            )}
          </div>

          {/* Topics */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#555', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>TOPICS</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TOPICS.map(t => {
                const active = topics.includes(t);
                return (
                  <button key={t} onClick={() => toggleTopic(t)}
                    style={{ padding: '5px 13px', borderRadius: 20, border: `1px solid ${active ? '#fff' : '#1E1E1E'}`, background: active ? '#fff' : 'transparent', color: active ? '#000' : '#555', fontFamily: "'Google Sans Flex',sans-serif", fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <motion.button onClick={submit} disabled={!canSubmit || submitting}
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            style={{ width: '100%', padding: '12px', background: canSubmit ? '#fff' : '#111', border: 'none', borderRadius: 8, color: canSubmit ? '#000' : '#333', fontFamily: "'Google Sans Flex',sans-serif", fontWeight: 800, fontSize: '0.8rem', cursor: canSubmit ? 'pointer' : 'not-allowed', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {submitting ? <><Loader2 size={15} className="spin" /> Publishing...</> : 'Publish Post →'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
