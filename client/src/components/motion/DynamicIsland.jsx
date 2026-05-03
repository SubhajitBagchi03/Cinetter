import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const notify = (() => {
  let _add = null;
  const fn = (message, type = 'info') => { if (_add) _add({ message, type, id: Date.now() }); };
  fn._setAdd = (f) => { _add = f; };
  return fn;
})();

const TYPE_COLOR = { info: '#FF4D00', success: '#10B981', error: '#EF4444', warning: '#F59E0B' };

export default function DynamicIsland() {
  const [current, setCurrent] = useState(null);
  useEffect(() => {
    notify._setAdd((item) => { setCurrent(item); setTimeout(() => setCurrent(null), 4000); });
  }, []);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          className="island"
          initial={{ width: 100, height: 32, borderRadius: 99, opacity: 0.8 }}
          animate={{ width: 340, height: 48, borderRadius: 6, opacity: 1 }}
          exit={{ width: 100, height: 32, borderRadius: 99, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}
          onClick={() => setCurrent(null)}
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[current.type], flexShrink: 0 }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: "Google Sans Flex", fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#A3A3A3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {current.message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
