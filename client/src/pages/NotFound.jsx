import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Ghost 404 */}
      <div style={{ position: 'absolute', fontFamily: "Google Sans Flex", fontSize: 'clamp(10rem, 40vw, 32rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px #1A1A1A', userSelect: 'none', letterSpacing: '-0.02em', pointerEvents: 'none' }}>
        404
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', textAlign: 'center', padding: '2rem' }}
      >
        <p className="t-mono" style={{ marginBottom: '0.75rem', color: '#FF4D00' }}>— Error 404</p>
        <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.9, marginBottom: '1rem' }}>
          PAGE NOT FOUND
        </h1>
        <p className="t-body" style={{ maxWidth: 320, margin: '0 auto 2rem', color: '#555' }}>
          The reel you're looking for doesn't exist or has been moved to the cutting room floor.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/explore">
            <button className="btn-primary" style={{ fontSize: '0.75rem' }}>Back to Explore →</button>
          </Link>
          <Link to="/">
            <button className="btn-outline" style={{ fontSize: '0.75rem' }}>Home</button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
