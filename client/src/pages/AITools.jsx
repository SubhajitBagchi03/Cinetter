import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Flame, Clapperboard, Brain, Eye, ChevronRight } from 'lucide-react';
import CineRoast from '../components/ai/CineRoast';
import DirectorsChair from '../components/ai/DirectorsChair';

const TOOLS = [
  {
    id: 'roast',
    icon: Flame,
    label: 'CineRoast',
    tagline: 'Roast any film into oblivion',
    desc: 'Feed a movie to our AI and get a devastating, witty roast. Zero mercy. All laughs.',
    color: '#EF4444',
  },
  {
    id: 'directors-chair',
    icon: Clapperboard,
    label: "Director's Chair",
    tagline: 'Pitch your dream film',
    desc: 'Choose genre, vibe, and premise. The AI produces a complete film concept with cast, budget, and poster direction.',
    color: '#3B82F6',
  },
  {
    id: 'mood',
    icon: Brain,
    label: 'Mood Engine',
    tagline: 'Watch what you feel',
    desc: 'Tell us how you feel and get perfectly matched movie recommendations from our AI.',
    color: '#10B981',
  },
  {
    id: 'deja',
    icon: Eye,
    label: 'Déjà View',
    tagline: 'Describe a scene, find the film',
    desc: 'Half-remember a movie? Describe a scene or moment and our AI will hunt it down.',
    color: '#A855F7',
    comingSoon: true,
  },
];

export default function AITools() {
  const [activeTool, setActiveTool] = useState(null);

  return (
    <div className="page" style={{ minHeight: '100vh', background: '#000' }}>
      <div style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem) 4rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1E1E1E' }}>
          <div className="ai-border" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <div style={{ background: '#000', padding: '4px 12px' }}>
              <p className="t-mono" style={{ color: '#FF4D00' }}>AI-Powered</p>
            </div>
          </div>
          <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(3rem, 8vw, 6rem)', lineHeight: 0.9, letterSpacing: '0.01em' }}>
            AI TOOLS
          </h1>
          <p style={{ color: '#555', fontSize: '0.95rem', marginTop: '0.75rem', maxWidth: 500 }}>
            Cinetter's AI suite. Roast films. Pitch ideas. Find what to watch.
          </p>
        </div>

        {/* No active tool — show tool grid */}
        <AnimatePresence mode="wait">
          {!activeTool ? (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1px', background: '#1E1E1E' }}>
                {TOOLS.map((t, i) => {
                  const Icon = t.icon;
                  return (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => !t.comingSoon && setActiveTool(t.id)}
                      style={{ background: '#000', padding: '2rem', cursor: t.comingSoon ? 'default' : 'pointer', position: 'relative', overflow: 'hidden', transition: 'background 0.2s' }}
                      onMouseEnter={e => !t.comingSoon && (e.currentTarget.style.background = '#0A0A0A')}
                      onMouseLeave={e => e.currentTarget.style.background = '#000'}
                    >
                      {t.comingSoon && (
                        <span style={{ position: 'absolute', top: 12, right: 12, padding: '3px 8px', border: '1px solid #1E1E1E', fontFamily: "Google Sans Flex", fontSize: '0.55rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>
                          Soon
                        </span>
                      )}

                      <div style={{ width: 44, height: 44, background: `${t.color}15`, border: `1px solid ${t.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                        <Icon size={20} color={t.color} />
                      </div>

                      <p className="t-mono" style={{ color: t.color, marginBottom: '0.4rem', fontSize: '0.6rem' }}>{t.tagline}</p>
                      <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '1.75rem', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>{t.label}</h2>
                      <p style={{ color: '#555', fontSize: '0.825rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{t.desc}</p>

                      {!t.comingSoon && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#333', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'color 0.2s' }}>
                          Open tool <ChevronRight size={12} />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="tool" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <button onClick={() => setActiveTool(null)}
                style={{ marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "Google Sans Flex", fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555', display: 'flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#555'}
              >
                ← Back to AI Tools
              </button>

              {activeTool === 'roast'            && <CineRoast />}
              {activeTool === 'directors-chair'  && <DirectorsChair />}
              {activeTool === 'mood'             && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                  <Brain size={40} color="#1E1E1E" style={{ margin: '0 auto 1rem' }} />
                  <p className="t-mono">Use the 🧠 FAB button in the bottom-right to open Mood Engine</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
