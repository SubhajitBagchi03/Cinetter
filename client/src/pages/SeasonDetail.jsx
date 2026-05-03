import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import api from '../lib/api';
import ReviewForm from '../components/reviews/ReviewForm';
import ReviewCard from '../components/reviews/ReviewCard';
import { useAuth } from '../contexts/AuthContext';
import PulseWave from '../components/movies/PulseWave';

const IMG = (p, s = 'w500') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

export default function SeasonDetail() {
  const { id, seasonNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [show, setShow] = useState(null);
  const [season, setSeason] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState(true);

  const seasonDbId = `tv-${id}-s${seasonNumber}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    api.get(`/movies/${id}?type=tv`)
      .then(res => {
        const showData = res.data.data;
        setShow(showData);
        const sData = showData.seasons?.find(s => s.season_number.toString() === seasonNumber);
        setSeason(sData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    api.get(`/reviews/${seasonDbId}`)
      .then(r => setReviews(r.data.data || []))
      .catch(() => setReviews([]));

    api.get(`/cinepulse/${seasonDbId}`)
      .then(p => setPulse(p.data.data))
      .catch(() => setPulse(null));

  }, [id, seasonNumber, seasonDbId]);

  if (loading) return <div className="page" style={{ paddingTop: '8rem', color: '#fff', textAlign: 'center' }}><div className="skel" style={{ width: 100, height: 100, borderRadius: '50%', margin: '0 auto' }} /></div>;
  if (!show || !season) return <div className="page" style={{ paddingTop: '8rem', color: '#fff', textAlign: 'center' }}>Season not found</div>;

  const radius = 80;
  const circum = Math.PI * radius;
  const greenPct = 0.15; // Hardcoded 15% as per screenshot
  const purplePct = 0.85; // Hardcoded 85% as per screenshot

  return (
    <div className="page" style={{ background: '#000', minHeight: '100vh', paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(1.25rem, 4vw, 4rem)' }}>
        
        {/* Back Button */}
        <button onClick={() => navigate(`/movie/${id}?type=tv`)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#E5E5E5', marginBottom: '2rem', padding: 0 }}>
          <ArrowLeft size={18} /> Back to Content Page
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1fr)', gap: '4rem' }}>
          
          {/* LEFT COLUMN */}
          <div>
            <PulseWave 
              score={pulse?.score || 0} 
              category={pulse?.distribution ? Object.entries(pulse.distribution).reduce((a, b) => b[1] > a[1] ? b : a)[0] : 'Masterpiece'} 
              total={pulse?.total || 0} 
              distribution={pulse?.distribution} 
            />

            <h2 style={{ fontFamily: "Google Sans Flex", fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', marginTop: '3rem' }}>Write a Season Review</h2>
            {user && reviews.some(r => r.userId?._id?.toString() === user._id || r.userId === user._id) ? null : (
              <ReviewForm movieId={seasonDbId} mediaType="season" onSuccess={() => api.get(`/reviews/${seasonDbId}`).then(r => setReviews(r.data.data || []))} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4rem 0 2rem', borderBottom: '1px solid #1E1E1E', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>Season Reviews</h3>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <select style={{ background: '#0A0A0A', color: '#E5E5E5', border: '1px solid #222', padding: '6px 12px', borderRadius: 6, fontFamily: "Google Sans Flex", fontSize: '0.8rem', outline: 'none', cursor: 'pointer' }}>
                  <option style={{ background: '#111', color: '#fff' }}>Most Liked</option>
                  <option style={{ background: '#111', color: '#fff' }}>Recent</option>
                </select>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A3A3A3', fontSize: '0.8rem', fontFamily: "Google Sans Flex", cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#A855F7', width: 14, height: 14 }} /> Show Spoilers
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#A3A3A3', fontSize: '0.8rem', fontFamily: "Google Sans Flex", cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#A855F7', width: 14, height: 14 }} /> Following Only
                </label>
              </div>
            </div>

            {/* Tags for filtering reviews */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              {['All', 'Drop It', 'Chill Watch', 'Engage', 'Masterpiece'].map((tag, i) => (
                <button key={tag} style={{ background: i === 0 ? '#333' : '#111', color: i === 0 ? '#fff' : '#888', border: 'none', padding: '6px 16px', borderRadius: 30, fontSize: '0.8rem', cursor: 'pointer', fontFamily: "Google Sans Flex" }}>
                  {tag}
                </button>
              ))}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: '#333', background: '#050505', border: '1px dashed #1E1E1E', borderRadius: 8 }}>
                <MessageCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
                <p className="t-mono">No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviews.map(r => (
                  <ReviewCard key={r._id} review={r} onDelete={rid => setReviews(rv => rv.filter(x => x._id !== rid))} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div style={{ background: '#0A0A0A', border: '1px solid #1E1E1E', borderRadius: 12, padding: '1.25rem', position: 'sticky', top: '8rem' }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #1E1E1E', aspectRatio: '2/3', background: '#111' }}>
                {season.poster_path ? <img src={IMG(season.poster_path, 'w500')} alt={season.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
              </div>
              <h3 style={{ fontFamily: "Google Sans Flex", fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{show.name}</h3>
              <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.9rem', color: '#E5E5E5', fontWeight: 600, marginBottom: 8 }}>{season.name}</p>
              <p style={{ fontFamily: "Google Sans Flex", fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>Show • {season.air_date ? season.air_date.slice(0,4) : show.first_air_date?.slice(0,4)}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #1E1E1E', paddingTop: '1rem' }}>
                <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.85rem', color: '#A3A3A3' }}>Episodes</span>
                <span style={{ fontFamily: "Google Sans Flex", fontSize: '0.85rem', color: '#fff', fontWeight: 600 }}>{season.episode_count}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
