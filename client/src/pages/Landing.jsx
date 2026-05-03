import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

// Floating poster positions for Infinite Canvas (Component 3)
const POSTERS = [
  { src: 'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV61RJLzvpOP.jpg',  x:'4%',  y:'5%',  w:150, rot:-4, op:0.55 },
  { src: 'https://image.tmdb.org/t/p/w342/qNBAXBIQlnOThrVvA6mA2B5ggkl.jpg',  x:'18%', y:'58%', w:120, rot:3,  op:0.4  },
  { src: 'https://image.tmdb.org/t/p/w342/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg',  x:'30%', y:'10%', w:170, rot:-2, op:0.6  },
  { src: 'https://image.tmdb.org/t/p/w342/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',  x:'52%', y:'65%', w:130, rot:4,  op:0.35 },
  { src: 'https://image.tmdb.org/t/p/w342/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',  x:'66%', y:'4%',  w:160, rot:-3, op:0.5  },
  { src: 'https://image.tmdb.org/t/p/w342/pFlaoHTZeyNkG83vxsAJiGzfSsa.jpg',  x:'80%', y:'48%', w:115, rot:2,  op:0.4  },
  { src: 'https://image.tmdb.org/t/p/w342/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg',  x:'8%',  y:'75%', w:140, rot:-1, op:0.3  },
  { src: 'https://image.tmdb.org/t/p/w342/xvk18d3ixfqsK7KszR3oByCR0dP.jpg',  x:'42%', y:'35%', w:155, rot:1,  op:0.5  },
  { src: 'https://image.tmdb.org/t/p/w342/gKkl37BQuKTanygYQG1pyYgLVgf.jpg',  x:'60%', y:'78%', w:125, rot:-3, op:0.32 },
  { src: 'https://image.tmdb.org/t/p/w342/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',  x:'88%', y:'18%', w:145, rot:3,  op:0.45 },
  { src: 'https://image.tmdb.org/t/p/w342/AoTFPxHhPUIMsRqPRpwKjdNPGOh.jpg', x:'24%', y:'82%', w:130, rot:2,  op:0.28 },
  { src: 'https://image.tmdb.org/t/p/w342/hek3koDUyRQk7FIhPXsa6mT2Zc3.jpg', x:'74%', y:'70%', w:150, rot:-2, op:0.38 },
];

const FEATURES = [
  { num: '01', title: 'CINEPULSE', sub: 'Drop · Chill · Engage · Masterpiece', body: 'Forget 5 stars. Vote with nuance — 4 emotional categories that actually describe how a movie hit you.' },
  { num: '02', title: 'AI MOOD ENGINE', sub: '"What to watch tonight?"', body: 'Tell us your mood. Get curated, real-time picks combining TMDB trending data with CinePulse community scores.' },
  { num: '03', title: 'SOCIAL CINEMA', sub: 'Spaces · Collections · Parties', body: 'Follow tastemakers, debate in Spaces, curate Collections, and host Watch Parties synced in real-time.' },
  { num: '04', title: 'UNIQUE AI TOOLS', sub: 'CineRoast · Déjà View · Director\'s Chair', body: 'AI features you won\'t find anywhere else. Generate roasts, match forgotten scenes, pitch your own film.' },
];

const STRIP_ITEMS = ['CinePulse Voting', 'AI Mood Engine', 'Watch Parties', 'Social Cinema', 'CineRoast', 'Déjà View', 'Director\'s Chair', 'Taste DNA', 'Live Reviews', 'Collections'];

export default function Landing() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const h = (e) => setMouse({
      x: (e.clientX / window.innerWidth - 0.5) * 40,
      y: (e.clientY / window.innerHeight - 0.5) * 25,
    });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div style={{ background: '#000', color: '#fff', overflow: 'hidden' }}>

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>

        {/* Infinite Canvas background — Component 3 */}
        <div style={{ position: 'absolute', inset: 0 }}>
          {POSTERS.map((p, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute', left: p.x, top: p.y,
                width: p.w, rotate: p.rot, opacity: p.op,
                x: mouse.x * (0.25 + i * 0.04),
                y: mouse.y * (0.15 + i * 0.03),
              }}
              transition={{ type: 'spring', stiffness: 40, damping: 18 }}
            >
              <img src={p.src} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
            </motion.div>
          ))}
          {/* Gradient — center clear, edges dark */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 65% at 50% 50%, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #000 0%, transparent 50%)' }} />
        </div>

        {/* Metadata top row */}
        <div style={{ position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 clamp(1.25rem, 4vw, 4rem)', zIndex: 2 }}>
          <span className="t-mono" style={{ color: '#555' }}>Cinetter® — 2026</span>
          <span className="t-mono" style={{ color: '#555' }}>AI-Powered Cinema</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="orange-dot" />
            <span className="t-mono" style={{ color: '#555' }}>BETA</span>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ position: 'relative', zIndex: 2, padding: 'clamp(1.25rem, 4vw, 4rem)', paddingBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="t-hero" style={{ fontSize: 'clamp(4.5rem, 14vw, 13rem)' }}>
              CINE
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
              <div className="t-hero-outline" style={{ fontSize: 'clamp(4.5rem, 14vw, 13rem)' }}>
                TTER
              </div>
              <div style={{ paddingBottom: '1.5rem', flex: 1, maxWidth: 380 }}>
                <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.95rem', color: '#A3A3A3', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  The social cinema platform built for people who actually care about film. Vote, debate, discover — all in real-time.
                </p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/register">
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem' }}>
                      Enter the Pulse <ArrowUpRight size={16} />
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="btn-outline" style={{ fontSize: '0.75rem' }}>Sign In</button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ ORANGE MARQUEE STRIP ══ Component 6 */}
      <div className="strip strip--orange">
        <div className="marquee">
          <div className="marquee__track">
            {[...STRIP_ITEMS, ...STRIP_ITEMS].map((item, i) => (
              <div key={i} className="strip__item">
                <span className="orange-dot" style={{ width: 6, height: 6, background: '#000', flexShrink: 0 }} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ FEATURES — SUPERDRY editorial grid ══ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 9rem) 0' }}>
        <div className="wrap" style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '2rem', borderBottom: '1px solid #1E1E1E', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 className="t-section">Why Cinetter</h2>
            <span className="t-mono">04 Features</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', borderTop: '1px solid #1E1E1E', borderLeft: '1px solid #1E1E1E' }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1 }}
              className="feat-card"
              style={{ borderRight: '1px solid #1E1E1E', borderBottom: '1px solid #1E1E1E' }}
            >
              {/* Number */}
              <div style={{ fontFamily: "Google Sans Flex", fontSize: '4rem', color: '#1A1A1A', lineHeight: 1, marginBottom: '1rem' }}>{f.num}</div>
              <h3 className="t-display" style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{f.title}</h3>
              <p className="t-mono" style={{ color: '#FF4D00', marginBottom: '1rem' }}>{f.sub}</p>
              <p className="t-body">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══ BIG NUMBERS SECTION — SUPERDRY oversized type ══ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '4rem 0', borderTop: '1px solid #1E1E1E' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { n: '100K+', label: 'Users' },
              { n: '4', label: 'Pulse Categories' },
              { n: '5', label: 'AI Features' },
              { n: '∞', label: 'Discoveries' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                <div style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(3rem, 8vw, 6rem)', color: i % 2 === 0 ? '#fff' : '#FF4D00', lineHeight: 1 }}>{s.n}</div>
                <div className="t-mono" style={{ marginTop: 8 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding: 'clamp(5rem, 10vw, 10rem) 0', borderTop: '1px solid #1E1E1E', position: 'relative', overflow: 'hidden' }}>
        {/* Big BG text */}
        <div style={{ position: 'absolute', bottom: -40, right: -20, fontFamily: "Google Sans Flex", fontSize: 'clamp(6rem, 20vw, 16rem)', lineHeight: 0.85, color: 'transparent', WebkitTextStroke: '1px #1E1E1E', userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.02em' }}>
          PULSE
        </div>
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <span className="t-mono" style={{ display: 'block', marginBottom: '1rem' }}>— Ready?</span>
          <h2 className="t-hero" style={{ fontSize: 'clamp(3rem, 10vw, 9rem)', marginBottom: '2.5rem' }}>
            FEEL THE<br />
            <span style={{ color: '#FF4D00' }}>PULSE.</span>
          </h2>
          <Link to="/register">
            <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '14px 36px', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              Create Free Account <ArrowUpRight size={18} />
            </button>
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop: '1px solid #1E1E1E', padding: '1.5rem clamp(1.25rem,4vw,4rem)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
          <span style={{ fontFamily: "Google Sans Flex", letterSpacing: '0.1em', fontSize: '1rem' }}>CINETTER</span>
        </div>
        <span className="t-mono">© 2026 Cinetter. All rights reserved.</span>
      </footer>
    </div>
  );
}
