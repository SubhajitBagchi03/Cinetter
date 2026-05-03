import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import { Home, Compass, Calendar, MessageSquare, BookMarked, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import CommandSearch from '../motion/CommandSearch';

const TABS = [
  { id: 'explore',     path: '/explore',     icon: Compass,      label: 'Explore' },
  { id: 'schedule',   path: '/schedule',    icon: Calendar,     label: 'Drop Radar' },
  { id: 'search',     path: null,           icon: Search,       label: 'Search',    action: true },
  { id: 'spaces',     path: '/spaces',      icon: MessageSquare, label: 'Spaces' },
  { id: 'collections',path: '/collections', icon: BookMarked,   label: 'Lists' },
];

export default function MobileNav() {
  const location = useLocation();
  const [cmdOpen, setCmdOpen] = useState(false);
  const hidden = ['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    // Push body up so content isn't under nav
    if (!hidden) document.body.style.paddingBottom = '64px';
    else document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = '0'; };
  }, [hidden]);

  if (hidden) return null;

  const active = TABS.find(t => !t.action && location.pathname.startsWith(t.path))?.id;

  return (
    <>
      <CommandSearch open={cmdOpen} onClose={() => setCmdOpen(false)} />

      <AnimatePresence>
        <motion.nav
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="mobile-nav"
        >
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.id;

            if (tab.action) {
              return (
                <button key={tab.id} onClick={() => setCmdOpen(true)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px' }}>
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    style={{ width: 40, height: 40, background: '#FF4D00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Icon size={18} color="#000" />
                  </motion.div>
                </button>
              );
            }

            return (
              <Link key={tab.id} to={tab.path}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, textDecoration: 'none', padding: '8px 4px', position: 'relative' }}>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-dot"
                    style={{ position: 'absolute', top: 6, width: 4, height: 4, background: '#FF4D00' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div whileTap={{ scale: 0.85 }}>
                  <Icon size={20} color={isActive ? '#fff' : '#444'} />
                </motion.div>
                <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? '#fff' : '#444' }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </motion.nav>
      </AnimatePresence>
    </>
  );
}
