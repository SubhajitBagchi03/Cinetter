import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem', textAlign: 'center' }}>
        {/* Ghost text */}
        <div style={{ position: 'absolute', fontFamily: "Google Sans Flex", fontSize: 'clamp(8rem, 30vw, 24rem)', lineHeight: 1, color: 'transparent', WebkitTextStroke: '1px #1A1A1A', userSelect: 'none', letterSpacing: '-0.02em' }}>
          ERR
        </div>

        <div style={{ position: 'relative', maxWidth: 400 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="t-mono" style={{ color: '#EF4444', marginBottom: '0.75rem' }}>— Unexpected Error</p>
            <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 0.9, marginBottom: '1rem' }}>
              SOMETHING<br />BROKE THE REEL
            </h1>
            <p style={{ color: '#555', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              An unexpected error occurred. Don't worry — this happens even to great films sometimes.
            </p>
            {this.state.error && (
              <div style={{ padding: '10px 14px', background: '#0A0A0A', border: '1px solid #1E1E1E', marginBottom: '1.5rem', textAlign: 'left' }}>
                <p className="t-mono" style={{ color: '#555', fontSize: '0.58rem', wordBreak: 'break-all' }}>
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => this.setState({ hasError: false, error: null })} className="btn-primary" style={{ fontSize: '0.75rem' }}>
                Try Again →
              </button>
              <Link to="/explore">
                <button className="btn-outline" style={{ fontSize: '0.75rem' }}>Back to Explore</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }
}
