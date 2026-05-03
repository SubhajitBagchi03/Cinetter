import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setStep(1), 200),
      setTimeout(() => setStep(2), 700),
      setTimeout(() => setStep(3), 1200),
      setTimeout(() => setShow(false), 2200),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="preloader"
        >
          {/* Giant BG letter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: step >= 1 ? 0.06 : 0 }}
            style={{
              position: 'absolute',
              fontFamily: "Google Sans Flex",
              fontSize: 'clamp(10rem, 40vw, 32rem)',
              lineHeight: 1,
              color: '#fff',
              userSelect: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            C
          </motion.div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <motion.img
              src="/logo.png"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: step >= 0 ? 1 : 0, scale: step >= 0 ? 1 : 0.6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: 72, height: 72, objectFit: 'contain' }}
            />

            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontFamily: "Google Sans Flex", fontSize: '3rem', letterSpacing: '0.15em', color: '#fff', lineHeight: 1 }}>
                    CINETTER
                  </div>
                  <div className="t-mono" style={{ marginTop: 6 }}>Feel the Pulse of Cinema</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom progress line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: step >= 2 ? 1 : 0 }}
            transition={{ duration: 0.8 }}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: '#FF4D00', transformOrigin: 'left' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
