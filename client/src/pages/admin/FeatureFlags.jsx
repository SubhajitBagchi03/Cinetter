import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Plus, Loader } from 'lucide-react';
import api from '../../lib/api';
import { notify } from '../../components/motion/DynamicIsland';

// Default flags if backend not yet ready
const DEFAULT_FLAGS = [
  { key: 'ai_cine_roast',       label: 'CineRoast AI',             description: 'Enable AI roast feature for all users',       enabled: true  },
  { key: 'directors_chair',     label: "Director's Chair",          description: 'AI film pitch generator feature',              enabled: true  },
  { key: 'live_cinepulse',      label: 'Live CinePulse Updates',   description: 'Real-time socket vote broadcasting',           enabled: true  },
  { key: 'watch_party',         label: 'Watch Party Rooms',        description: 'Synchronized watch party feature',             enabled: false },
  { key: 'taste_dna',           label: 'Taste DNA Radar',          description: 'Genre fingerprint chart on profiles',          enabled: true  },
  { key: 'deja_view',           label: 'Déjà View',                description: 'Scene-to-movie AI search',                    enabled: false },
  { key: 'spaces_polls',        label: 'Spaces Polls',             description: 'Poll post type in Spaces feed',               enabled: true  },
  { key: 'collections_public',  label: 'Public Collections',       description: 'Allow users to make collections public',      enabled: true  },
];

export default function FeatureFlags() {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    api.get('/admin/feature-flags')
      .then(({ data }) => { if (data.data?.length) setFlags(data.data); })
      .catch(() => {}); // Fall back to defaults silently
  }, []);

  const toggle = async (key) => {
    setSaving(key);
    const updated = flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f);
    setFlags(updated);
    try {
      const flag = updated.find(f => f.key === key);
      await api.patch(`/admin/feature-flags/${key}`, { enabled: flag.enabled });
      notify(`${flag.label} ${flag.enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch {
      // Revert on error
      setFlags(flags);
      notify('Failed to update flag', 'error');
    } finally { setSaving(null); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid #1E1E1E' }}>
        <p className="t-mono">Feature Flags <span style={{ marginLeft: 8, color: '#555' }}>— {flags.filter(f => f.enabled).length}/{flags.length} active</span></p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#1E1E1E' }}>
        {flags.map((flag, i) => (
          <motion.div key={flag.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ background: '#000', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <span style={{ fontFamily: "Google Sans Flex", fontWeight: 700, fontSize: '0.88rem', color: '#E5E5E5' }}>{flag.label}</span>
                <span style={{ padding: '2px 6px', border: `1px solid ${flag.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`, color: flag.enabled ? '#10B981' : '#333', fontFamily: "Google Sans Flex", fontSize: '0.55rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {flag.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <p style={{ color: '#555', fontSize: '0.78rem' }}>{flag.description}</p>
              <p className="t-mono" style={{ fontSize: '0.55rem', marginTop: 3, color: '#333' }}>{flag.key}</p>
            </div>

            <button onClick={() => toggle(flag.key)} disabled={saving === flag.key}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: flag.enabled ? '#10B981' : '#333', transition: 'color 0.2s', padding: 4 }}>
              {saving === flag.key
                ? <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
                : flag.enabled
                  ? <ToggleRight size={28} />
                  : <ToggleLeft size={28} />
              }
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
