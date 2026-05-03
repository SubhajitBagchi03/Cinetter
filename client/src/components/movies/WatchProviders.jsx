/**
 * WatchProviders — shows OTT availability for a movie/show
 * Displayed on MovieDetail overview tab
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import api from '../../lib/api';

const IMG = (p) => p ? `https://image.tmdb.org/t/p/w92${p}` : null;

const TYPE_LABELS = {
  flatrate: 'Streaming',
  rent:     'Rent',
  buy:      'Buy',
};

const TYPE_COLORS = {
  flatrate: '#10B981',
  rent:     '#F59E0B',
  buy:      '#3B82F6',
};

export default function WatchProviders({ movieId, type = 'movie', region = 'IN' }) {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;
    api.get(`/movies/${movieId}/watch-providers?type=${type}`)
      .then(({ data }) => {
        const regionData = data.data?.[region] || null;
        setProviders(regionData);
      })
      .catch(() => setProviders(null))
      .finally(() => setLoading(false));
  }, [movieId, type, region]);

  if (loading) return (
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
      {Array(3).fill(0).map((_, i) => <div key={i} className="skel" style={{ width: 40, height: 40, borderRadius: 4 }} />)}
    </div>
  );

  if (!providers) return (
    <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px dashed #1E1E1E', background: '#050505', color: '#555', textAlign: 'center', fontSize: '0.8rem', fontFamily: "Google Sans Flex" }}>
      Not currently available to stream in your region.
    </div>
  );

  const flatrate = providers.flatrate || providers.free || [];
  
  if (flatrate.length === 0) return (
    <div style={{ color: '#555', fontSize: '0.85rem', fontFamily: "Google Sans Flex" }}>Not available to stream.</div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.85rem', color: '#A3A3A3' }}>Streaming On</p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {flatrate.map(p => (
          <div key={p.provider_id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#111', padding: '10px 16px', borderRadius: 8, border: '1px solid #1E1E1E' }}>
            {IMG(p.logo_path) ? (
              <img src={IMG(p.logo_path)} alt={p.provider_name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
            ) : null}
            <div>
              <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{p.provider_name}</p>
              <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.75rem', color: '#888' }}>Subscription</p>
            </div>
          </div>
        ))}
      </div>
      
      {providers.link && (
        <a href={providers.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#FF4D00', fontSize: '0.8rem', fontFamily: "Google Sans Flex", marginTop: '0.5rem', textDecoration: 'none' }}>
          See all options <ExternalLink size={14} />
        </a>
      )}
    </motion.div>
  );
}
