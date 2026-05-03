import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const checks = [
    { ok: form.password.length >= 8, label: 'Min 8 chars' },
    { ok: /[A-Z]/.test(form.password), label: 'Uppercase' },
    { ok: /[0-9]/.test(form.password), label: 'Number' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); 
    if (!checks.every(c => c.ok)) { setError('Password requirements not met'); return; }
    setLoading(true);
    try { await register(form.username, form.email, form.password); navigate('/explore'); }
    catch (err) { setError(err.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#000', overflow: 'hidden' }}>

      {/* Left panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem', borderRight: '1px solid #1E1E1E', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -40, left: -20, fontFamily: "Google Sans Flex", fontSize: 'clamp(8rem, 18vw, 15rem)', lineHeight: 0.85, color: 'transparent', WebkitTextStroke: '1px #1A1A1A', userSelect: 'none', letterSpacing: '-0.02em' }}>
          JOIN<br />THE<br />PULSE
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Cinetter" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: "Google Sans Flex", fontSize: '1.4rem', letterSpacing: '0.1em' }}>CINETTER</span>
        </div>
        <div style={{ position: 'relative' }}>
          <p className="t-mono" style={{ marginBottom: '0.75rem' }}>— New here?</p>
          <h1 className="t-display" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: 1.1 }}>
            YOUR CINEMA<br /><span style={{ color: '#FF4D00' }}>IDENTITY</span><br />STARTS HERE.
          </h1>
          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '2rem' }}>
            {['Free forever', 'CinePulse voting', 'AI recommendations', 'Watch Parties'].map(t => (
              <span key={t} style={{ padding: '4px 10px', border: '1px solid #1E1E1E', fontFamily: "Google Sans Flex", fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#555' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: '0 0 clamp(340px, 40%, 480px)', display: 'flex', alignItems: 'center', padding: '3rem' }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <p className="t-mono" style={{ marginBottom: '0.5rem' }}>02 / Register</p>
          <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '2rem', textTransform: 'uppercase' }}>
            Create account
          </h2>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', borderLeft: '2px solid #EF4444', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#EF4444', fontFamily: "Google Sans Flex" }}>{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
              <input className="input" name="username" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required minLength={3} placeholder="yourcinename" />
            </div>
            <div>
              <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
              <input className="input" type="email" name="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required placeholder="you@example.com" />
            </div>
            <div>
              <label className="t-mono" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} name="password" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required placeholder="Strong password" style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {form.password && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {checks.map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.ok ? '#10B981' : '#333' }} />
                      <span className="t-mono" style={{ color: c.ok ? '#10B981' : '#333', fontSize: '0.55rem' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit" disabled={loading}
              whileHover={!loading ? { x: 3 } : {}}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Creating...' : 'Create Account →'}
            </motion.button>
          </form>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1E1E1E' }}>
            <p className="t-mono">Already a member? <Link to="/login" style={{ color: '#FF4D00' }}>Sign in →</Link></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
