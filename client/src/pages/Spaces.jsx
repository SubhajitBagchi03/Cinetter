import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Flame, Globe, Tv, Gamepad2, Swords } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { notify } from '../components/motion/DynamicIsland';

const TOPICS = [
  { id: 'all', label: 'All', icon: Globe },
  { id: 'Indian', label: 'Indian', icon: Flame },
  { id: 'International', label: 'World', icon: Globe },
  { id: 'Anime', label: 'Anime', icon: Swords },
  { id: 'Sports', label: 'Sports', icon: Tv },
  { id: 'Games', label: 'Games', icon: Gamepad2 },
];

const TYPE_COLORS = { news: '#3B82F6', discussion: '#10B981', poll: '#A855F7' };

function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likeCount || 0);
  const { isAuth } = useAuth();

  const toggleLike = async (e) => {
    e.preventDefault();
    if (!isAuth) { notify('Sign in to like', 'error'); return; }
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
    await api.post(`/spaces/${post._id}/like`).catch(() => {});
  };

  return (
    <motion.div
      whileHover={{ borderColor: '#2A2A2A' }}
      style={{ border: '1px solid #1E1E1E', background: '#000', padding: '1.5rem', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}
    >
      {/* Type accent stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: TYPE_COLORS[post.type] || '#333' }} />

      <div style={{ paddingLeft: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ width: 28, height: 28, background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#555' }}>{post.authorId?.username?.[0]?.toUpperCase() || '?'}</span>
          </div>
          <span style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.8rem' }}>{post.authorId?.username || 'Anonymous'}</span>
          <span className="t-mono" style={{ marginLeft: 'auto' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          <span style={{ padding: '2px 8px', border: `1px solid ${TYPE_COLORS[post.type] || '#333'}30`, color: TYPE_COLORS[post.type] || '#555', fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {post.type}
          </span>
        </div>

        <h3 style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', color: '#E5E5E5', marginBottom: '0.5rem', lineHeight: 1.4 }}>
          {post.title}
        </h3>
        {post.content && <p style={{ color: '#737373', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>{post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}</p>}

        {post.topics?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {post.topics.map(t => (
              <span key={t} style={{ padding: '2px 8px', border: '1px solid #1E1E1E', fontFamily: "Google Sans Flex", fontSize: '0.58rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #111' }}>
          <button onClick={toggleLike}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#FF4D00' : '#555', fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}>
            <Heart size={13} fill={liked ? '#FF4D00' : 'none'} />
            {likes}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#555', fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <MessageCircle size={13} /> {post.comments?.length || 0}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PostSkeleton() {
  return (
    <div style={{ border: '1px solid #1E1E1E', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <div className="skel" style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3 }} />
      <div style={{ paddingLeft: '0.75rem' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: '0.75rem' }}>
          <div className="skel" style={{ width: 28, height: 28 }} />
          <div className="skel" style={{ height: 14, width: 100 }} />
        </div>
        <div className="skel" style={{ height: 20, width: '80%', marginBottom: 8 }} />
        <div className="skel" style={{ height: 14, width: '60%' }} />
      </div>
    </div>
  );
}

export default function Spaces() {
  const [topic, setTopic] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuth } = useAuth();

  // Demo posts since backend is stub
  const DEMO = [
    { _id: '1', type: 'discussion', title: 'Is Interstellar the greatest sci-fi ever made or is it overrated?', content: 'Nolan\'s Interstellar came out 10 years ago and the debate never dies. The science, the emotion, the visuals — but is it truly the best or just nostalgia?', topics: ['International'], authorId: { username: 'cosmiccinema' }, likeCount: 142, comments: Array(23), createdAt: new Date().toISOString() },
    { _id: '2', type: 'news', title: 'RRR sequel officially confirmed — Ram Charan and Jr. NTR return', content: 'SS Rajamouli has confirmed RRR 2 is in early development. Both lead stars have signed on and production is expected to begin in late 2025.', topics: ['Indian'], authorId: { username: 'tollywoodpulse' }, likeCount: 387, comments: Array(56), createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', type: 'poll', title: 'Best anime of the decade — Attack on Titan vs Demon Slayer vs Jujutsu Kaisen?', content: 'The big three modern shonen. Cast your vote and make your case in the comments.', topics: ['Anime'], authorId: { username: 'otakupulse' }, likeCount: 215, comments: Array(89), createdAt: new Date(Date.now() - 7200000).toISOString() },
    { _id: '4', type: 'discussion', title: 'Parasite changed cinema forever — still the best film of the 2020s', content: 'Bong Joon-ho\'s masterpiece set a new standard. Five years later, nothing has come close to its precision, humor, and social commentary.', topics: ['International'], authorId: { username: 'filmcritic99' }, likeCount: 298, comments: Array(41), createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: '5', type: 'news', title: 'Kalki 2898 AD becomes highest grossing Indian film of all time', content: 'Prabhas-starrer Kalki 2898 AD has officially crossed ₹1,000 crore globally, making it the highest-grossing Indian film ever.', topics: ['Indian'], authorId: { username: 'boxofficeking' }, likeCount: 456, comments: Array(78), createdAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  useEffect(() => {
    setTimeout(() => { setPosts(DEMO); setLoading(false); }, 600);
  }, []);

  const filtered = topic === 'all' ? posts : posts.filter(p => p.topics?.includes(topic));

  return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) 0 4rem' }}>
      <div style={{ padding: '0 clamp(1.25rem, 4vw, 4rem)', borderBottom: '1px solid #1E1E1E', paddingBottom: '1.5rem', marginBottom: 0 }}>
        <p className="t-mono" style={{ marginBottom: '0.4rem' }}>— The cinema conversation</p>
        <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9 }}>SPACES</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 0, alignItems: 'start', maxWidth: 1200, margin: '0 auto' }}>
        {/* Left — feed */}
        <div style={{ borderRight: '1px solid #1E1E1E', minHeight: '60vh' }}>
          {/* Topic filter strip */}
          <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid #1E1E1E' }}>
            {TOPICS.map(t => (
              <button key={t.id} onClick={() => setTopic(t.id)}
                style={{ flexShrink: 0, padding: '12px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${topic === t.id ? '#FF4D00' : 'transparent'}`, cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: topic === t.id ? '#fff' : '#555', transition: 'color 0.2s', marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          <div>
            {loading
              ? Array(4).fill(0).map((_, i) => <PostSkeleton key={i} />)
              : filtered.length === 0
                ? <div style={{ padding: '3rem', textAlign: 'center' }}><p className="t-mono" style={{ color: '#555' }}>No posts in this topic</p></div>
                : filtered.map((post, i) => (
                  <motion.div key={post._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <PostCard post={post} />
                  </motion.div>
                ))
            }
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ padding: '1.5rem', position: 'sticky', top: 'calc(var(--nav-h) + 1rem)' }}>
          <p className="t-mono" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E' }}>Trending Topics</p>
          {[['Kalki 2898 AD', 456], ['Attack on Titan', 387], ['Parasite', 298], ['Interstellar', 215], ['RRR 2', 142]].map(([name, n]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #0A0A0A' }}>
              <span style={{ fontFamily: "Google Sans Flex", fontWeight: 600, fontSize: '0.8rem', color: '#E5E5E5' }}>{name}</span>
              <span className="t-mono" style={{ color: '#555', fontSize: '0.58rem' }}>{n}</span>
            </div>
          ))}

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#0A0A0A', border: '1px solid #1E1E1E' }}>
            <p className="t-mono" style={{ marginBottom: '0.75rem', color: '#FF4D00' }}>Start a discussion</p>
            <p style={{ color: '#555', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1rem' }}>Share news, opinions, or start a poll with the community.</p>
            {isAuth
              ? <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '0.7rem' }}>New Post →</button>
              : <Link to="/register"><button className="btn-outline" style={{ width: '100%', justifyContent: 'center', fontSize: '0.7rem' }}>Join to post →</button></Link>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
