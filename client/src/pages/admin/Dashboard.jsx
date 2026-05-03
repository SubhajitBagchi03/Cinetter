import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, Film, AlertTriangle, TrendingUp, Shield, Trash2, Ban } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../../components/motion/DynamicIsland';
import FeatureFlags from './FeatureFlags';

const STAT_CARDS = [
  { key: 'users',   label: 'Total Users',   icon: Users,      color: '#3B82F6' },
  { key: 'votes',   label: 'Votes Cast',    icon: TrendingUp, color: '#FF4D00' },
  { key: 'reviews', label: 'Reviews',       icon: Film,       color: '#10B981' },
  { key: 'reports', label: 'Reports',       icon: AlertTriangle, color: '#F59E0B' },
];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ padding: '1.5rem', border: '1px solid #1E1E1E', background: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `${color}08`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <p className="t-mono" style={{ marginBottom: '0.5rem' }}>{label}</p>
      <div style={{ fontFamily: "Google Sans Flex", fontSize: '2.5rem', lineHeight: 1, color: '#fff' }}>{value ?? '—'}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: { data: {} } })),
      api.get('/admin/users?limit=20').catch(() => ({ data: { data: [] } })),
    ]).then(([s, u]) => {
      setStats(s.data.data || {});
      setUsers(u.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const banUser = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/ban`);
      setUsers(u => u.map(user => user._id === userId ? { ...user, banned: !user.banned } : user));
      notify('User status updated', 'success');
    } catch { notify('Action failed', 'error'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(u => u.filter(user => user._id !== userId));
      notify('User deleted', 'info');
    } catch { notify('Delete failed', 'error'); }
  };

  const TABS = ['overview', 'users', 'reports', 'feature-flags'];

  return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem) 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #1E1E1E' }}>
        <div>
          <p className="t-mono" style={{ marginBottom: '0.4rem', color: '#FF4D00' }}>— Admin</p>
          <h1 style={{ fontFamily: "Google Sans Flex", fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.9 }}>
            CONTROL PANEL
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid rgba(255,77,0,0.3)', background: 'rgba(255,77,0,0.05)' }}>
          <Shield size={14} color="#FF4D00" />
          <span className="t-mono" style={{ color: '#FF4D00' }}>ADMIN ACCESS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '2rem' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`} style={{ textTransform: 'capitalize' }}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: '#1E1E1E', marginBottom: '2rem' }}>
            {STAT_CARDS.map(s => (
              <motion.div key={s.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#000' }}>
                <StatCard {...s} value={loading ? null : (stats[s.key] ?? 0)} />
              </motion.div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1E1E1E' }}>
            <div style={{ background: '#000', padding: '1.5rem' }}>
              <p className="t-mono" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E' }}>Recent Registrations</p>
              {users.slice(0, 6).map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '8px 0', borderBottom: '1px solid #0A0A0A' }}>
                  <div style={{ width: 28, height: 28, background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#555' }}>{u.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.82rem', fontWeight: 600 }}>{u.username}</span>
                  <span className="t-mono" style={{ marginLeft: 'auto', fontSize: '0.58rem', color: '#555' }}>{u.email}</span>
                  {u.banned && <span style={{ padding: '2px 6px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', fontFamily: "Google Sans Flex", fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>BANNED</span>}
                </div>
              ))}
            </div>
            <div style={{ background: '#000', padding: '1.5rem' }}>
              <p className="t-mono" style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E' }}>Quick Actions</p>
              {[
                { label: 'View All Reports', color: '#F59E0B' },
                { label: 'Manage Feature Flags', color: '#3B82F6' },
                { label: 'Flush Cache', color: '#10B981' },
                { label: 'Export Analytics', color: '#A855F7' },
              ].map(a => (
                <button key={a.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 0', borderBottom: '1px solid #0A0A0A', background: 'none', border: 'none', borderBottom: '1px solid #0A0A0A', cursor: 'pointer', textAlign: 'left', color: a.color, fontFamily: "Google Sans Flex", fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <span>→</span> {a.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div style={{ border: '1px solid #1E1E1E' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 80px', gap: 0, padding: '8px 16px', borderBottom: '1px solid #1E1E1E', background: '#0A0A0A' }}>
            {['Username', 'Email', 'Role', 'Status', 'Actions'].map(h => (
              <span key={h} className="t-mono" style={{ fontSize: '0.6rem' }}>{h}</span>
            ))}
          </div>
          {loading ? Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #0A0A0A' }}>
              <div className="skel" style={{ height: 14 }} />
            </div>
          )) : users.map(u => (
            <div key={u._id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 80px 80px', gap: 0, padding: '10px 16px', borderBottom: '1px solid #0A0A0A', alignItems: 'center', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0A0A0A'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontFamily: "Google Sans Flex", fontWeight: 600, fontSize: '0.82rem', color: '#E5E5E5' }}>{u.username}</span>
              <span className="t-mono" style={{ fontSize: '0.65rem', color: '#555' }}>{u.email}</span>
              <span className="t-mono" style={{ fontSize: '0.6rem', color: u.role === 'admin' ? '#FF4D00' : '#555' }}>{u.role}</span>
              <span style={{ padding: '2px 6px', background: u.banned ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${u.banned ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`, color: u.banned ? '#EF4444' : '#10B981', fontFamily: "Google Sans Flex", fontSize: '0.55rem', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block' }}>
                {u.banned ? 'Banned' : 'Active'}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => banUser(u._id)} title={u.banned ? 'Unban' : 'Ban'}
                  style={{ width: 26, height: 26, background: 'none', border: '1px solid #1E1E1E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F59E0B20'; e.currentTarget.style.borderColor = '#F59E0B40'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#1E1E1E'; }}
                >
                  <Ban size={12} />
                </button>
                <button onClick={() => deleteUser(u._id)} title="Delete"
                  style={{ width: 26, height: 26, background: 'none', border: '1px solid #1E1E1E', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EF444420'; e.currentTarget.style.borderColor = '#EF444440'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#1E1E1E'; }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(tab === 'reports') && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#555' }}>
          <p className="t-mono">Reports module coming soon</p>
        </div>
      )}

      {tab === 'feature-flags' && <FeatureFlags />}
    </div>
  );
}
