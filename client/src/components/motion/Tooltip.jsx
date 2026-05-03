import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';

/**
 * Vercel-style tooltip — Component 13
 * Usage: <Tooltip content="Hover me"><button>...</button></Tooltip>
 */
export default function Tooltip({ content, side = 'top', children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0 });
  const ref = useRef(null);

  const handleEnter = (e) => {
    setVisible(true);
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ x: 0 }); // centered by default
  };

  const positions = {
    top:    { bottom: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', originY: 1 },
    bottom: { top:    'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)', originY: 0 },
    left:   { right:  'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)', originX: 1 },
    right:  { left:   'calc(100% + 8px)', top:  '50%', transform: 'translateY(-50%)', originX: 0 },
  };

  const p = positions[side] || positions.top;

  return (
    <div
      ref={ref}
      className="tt"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-flex' }}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: side === 'top' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: side === 'top' ? 4 : -4 }}
            transition={{ duration: 0.12 }}
            style={{
              position: 'absolute',
              ...p,
              background: '#0A0A0A',
              border: '1px solid #2A2A2A',
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 99,
              fontFamily: "Google Sans Flex",
              fontSize: '0.6rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#A3A3A3',
            }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
