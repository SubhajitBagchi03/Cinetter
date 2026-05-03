import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, Calendar, BookMarked, Users, Search, Bell, User, MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import CommandSearch from '../motion/CommandSearch';

const NAV_LINKS = [
  { id: 'explore',     label: 'Explore',     path: '/explore' },
  { id: 'schedule',   label: 'Drop Radar',  path: '/schedule' },
  { id: 'spaces',     label: 'Spaces',      path: '/spaces' },
  { id: 'collections',label: 'Collections', path: '/collections' },
  { id: 'ai',         label: 'AI',          path: '/ai' },
];

export default function Navbar() {
  const { user, isAuth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 40));

  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(true); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (['/login', '/register'].includes(location.pathname)) return null;

  const active = NAV_LINKS.find(n => location.pathname.startsWith(n.path))?.id;

  return (
    <>
      <CommandSearch open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`nav${scrolled ? ' nav--solid' : ''}`}
      >
        {/* Logo wordmark */}
        <Link to={isAuth ? '/explore' : '/'} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Cinetter" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <span style={{ fontFamily: '"Google Sans Flex", sans-serif', fontSize: '1.4rem', letterSpacing: '0.08em', color: '#fff' }}>
            CINETTER
          </span>
        </Link>

        {/* Center — nav links */}
        {isAuth && (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {NAV_LINKS.map(n => {
              const isActive = active === n.id;
              return (
                <Link key={n.id} to={n.path}
                  style={{ position: 'relative', padding: '8px 16px', display: 'block' }}>
                  <span className="t-mono" style={{ color: isActive ? '#fff' : '#555555', transition: 'color 0.2s' }}>
                    {n.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 1, background: '#FF4D00' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right — actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isAuth ? (
            <>
              <button className="btn-ghost" onClick={() => setCmdOpen(true)} title="Search (Ctrl+K)">
                <Search size={17} />
              </button>
              <button className="btn-ghost">
                <Bell size={17} />
              </button>
              <button
                onClick={() => navigate(`/profile/${user?._id}`)}
                style={{ width: 30, height: 30, borderRadius: 0, border: '1px solid #1E1E1E', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: 6 }}
              >
                {user?.avatar
                  ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={14} color="#555" />
                }
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Login</Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.7rem' }}>Join Free</button>
              </Link>
            </>
          )}
        </div>
      </motion.header>
    </>
  );
}
