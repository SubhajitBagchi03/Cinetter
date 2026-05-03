import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Globe, Heart, BookOpen, Bookmark } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { notify } from '../components/motion/DynamicIsland';

const IMG = (ids = []) => ids[0] ? `https://image.tmdb.org/t/p/w342/${ids[0]}` : null;

function CollectionCard({ col }) {
  const covers = col.movies?.slice(0, 3) || [];

  return (
    <Link to={`/collections/${col._id}`} style={{ textDecoration: 'none' }}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{ border: '1px solid #1E1E1E', background: '#000', overflow: 'hidden', cursor: 'pointer' }}
      >
        {/* Cover mosaic */}
        <div style={{ height: 160, display: 'grid', gridTemplateColumns: covers.length > 1 ? '2fr 1fr' : '1fr', gap: 1, background: '#111' }}>
          {covers.length === 0
            ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={32} color="#333" /></div>
            : covers.slice(0, 2).map((id, i) => (
              <div key={i} style={{ overflow: 'hidden', ...(i === 1 && { display: 'grid', gridTemplateRows: '1fr 1fr', gap: 1 }) }}>
                {i === 1
                  ? covers.slice(1, 3).map((cid, j) => (
                    <div key={j} style={{ overflow: 'hidden', background: '#111' }}>
                      <div style={{ width: '100%', height: '100%', background: '#111' }} />
                    </div>
                  ))
                  : <div style={{ background: '#111', width: '100%', height: '100%' }} />
                }
              </div>
            ))
          }
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: '0.4rem' }}>
            <p style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.875rem', color: '#E5E5E5', lineHeight: 1.3 }}>{col.name}</p>
            {col.isPublic
              ? <Globe size={13} color="#555" style={{ flexShrink: 0, marginTop: 2 }} />
              : <Lock size={13} color="#555" style={{ flexShrink: 0, marginTop: 2 }} />
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-mono">{col.movies?.length || 0} FILMS</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Heart size={12} color="#555" />
              <span className="t-mono" style={{ fontSize: '0.58rem' }}>{col.likeCount || 0}</span>
            </div>
          </div>
          {col.authorId?.username && (
            <p className="t-mono" style={{ marginTop: '0.5rem', fontSize: '0.58rem', color: '#555' }}>by {col.authorId.username}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

function CreateModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', isPublic: true });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/collections', form);
      onCreate(data.data);
      onClose();
      notify('Collection created', 'success');
    } catch { notify('Failed to create', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 480, background: '#000', border: '1px solid #1E1E1E', padding: '2.5rem' }}
      >
        <p className="t-mono" style={{ marginBottom: '0.5rem' }}>— New</p>
        <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '2rem', marginBottom: '2rem', letterSpacing: '0.04em' }}>CREATE COLLECTION</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="My Masterpieces" required />
          </div>
          <div>
            <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Description (optional)</label>
            <textarea className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What's this collection about?" rows={3} style={{ resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: '1px solid #1E1E1E', cursor: 'pointer' }} onClick={() => setForm(f => ({ ...f, isPublic: !f.isPublic }))}>
            <div style={{ width: 20, height: 20, border: `1px solid ${form.isPublic ? '#FF4D00' : '#333'}`, background: form.isPublic ? '#FF4D00' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {form.isPublic && <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 900 }}>✓</span>}
            </div>
            <span className="t-mono">Make public</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Creating...' : 'Create →'}
            </button>
            <button type="button" onClick={onClose} className="btn-outline" style={{ fontSize: '0.75rem' }}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Collections() {
  const { isAuth } = useAuth();
  const [tab, setTab] = useState('discover');
  const [discover, setDiscover] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    setLoading(true);
    const reqs = [api.get('/collections/discover')];
    if (isAuth) reqs.push(api.get('/collections/my'));
    Promise.all(reqs).then(([d, m]) => {
      setDiscover(d.data.data || []);
      if (m) setMine(m.data.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [isAuth]);

  const displayed = tab === 'mine' ? mine : discover;

  return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem) 4rem' }}>
      <AnimatePresence>{showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreate={c => setMine(m => [c, ...m])} />}</AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1E1E1E', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="t-mono" style={{ marginBottom: '0.4rem' }}>— Curated by the community</p>
          <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9 }}>COLLECTIONS</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="tabs" style={{ border: 'none' }}>
            {[{ id: 'discover', label: 'Discover' }, ...(isAuth ? [{ id: 'mine', label: 'Mine' }] : [])].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn${tab === t.id ? ' tab-btn--active' : ''}`}>{t.label}</button>
            ))}
          </div>
          {isAuth && (
            <motion.button whileHover={{ x: 2 }} onClick={() => setShowCreate(true)} className="btn-primary" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> New
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: '#1E1E1E' }}>
          {Array(8).fill(0).map((_, i) => <div key={i} className="skel" style={{ height: 240, background: '#000' }} />)}
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#555' }}>
          <BookOpen size={40} color="#1E1E1E" style={{ margin: '0 auto 1rem' }} />
          <p className="t-mono">No collections yet</p>
          {isAuth && <button onClick={() => setShowCreate(true)} className="btn-outline" style={{ marginTop: '1.5rem', fontSize: '0.7rem' }}>Create first</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1px', background: '#1E1E1E' }}>
          {displayed.map((col, i) => (
            <motion.div key={col._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} style={{ background: '#000' }}>
              <CollectionCard col={col} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
