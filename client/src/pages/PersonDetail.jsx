import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import api from '../lib/api';

const IMG = (p, s = 'w185') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

// Fallback card when no poster is available
function NoPosterCard({ title, character, job }) {
  return (
    <div style={{
      aspectRatio: '2/3',
      background: 'linear-gradient(135deg, rgba(255,77,0,0.08) 0%, #000 60%)',
      border: '1px solid rgba(255,77,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 4,
    }}>
      <img src="/logo.png" alt="Cinetter" style={{ width: 28, opacity: 0.35, objectFit: 'contain' }} />
    </div>
  );
}

export default function PersonDetail() {
  const { id } = useParams();
  const [person, setPerson]   = useState(null);
  const [cast, setCast]       = useState([]);
  const [crew, setCrew]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPerson(null);

    const fetchPerson = async (attempt = 0) => {
      try {
        const [p, c] = await Promise.all([
          api.get(`/movies/person/${id}`),
          api.get(`/movies/person/${id}/credits`),
        ]);
        setPerson(p.data.data);
        const rawCast = c.data.data?.cast || [];
        const rawCrew = c.data.data?.crew || [];
        const seenCrew = new Set();
        const dedupedCrew = rawCrew.filter(cr => {
          const key = `${cr.id}-${cr.job}`;
          if (seenCrew.has(key)) return false;
          seenCrew.add(key);
          return true;
        });
        setCast(rawCast.slice(0, 30));
        setCrew(dedupedCrew.slice(0, 20));
      } catch (e) {
        if (attempt < 2) {
          setTimeout(() => fetchPerson(attempt + 1), 800);
          return;
        }
        console.error('Person fetch failed after retries:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [id]);

  if (loading) return (
    <div className="page" style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem)' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="skel" style={{ width: 200, height: 280 }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 48, width: 300, marginBottom: 12 }} />
          <div className="skel" style={{ height: 16, width: 150, marginBottom: 24 }} />
          <div className="skel" style={{ height: 80, width: '70%' }} />
        </div>
      </div>
    </div>
  );
  if (!person) return <div style={{ textAlign: 'center', paddingTop: '25vh', color: '#555' }} className="t-mono">Person not found</div>;

  const bio = person.biography || '';
  const BIO_LIMIT = 420;
  const isLong = bio.length > BIO_LIMIT;
  const displayBio = expanded ? bio : bio.slice(0, BIO_LIMIT);

  const allCredits = [
    ...cast.map(m => ({ ...m, _role: m.character ? `as ${m.character}` : null })),
    ...crew.map(m => ({ ...m, _role: m.job || null })),
  ];
  // deduplicate by id
  const seenIds = new Set();
  const uniqueCredits = allCredits.filter(m => {
    if (seenIds.has(m.id)) return false;
    seenIds.add(m.id);
    return true;
  });

  return (
    <div className="page" style={{ background: '#000', minHeight: '100vh' }}>
      <div style={{ padding: 'calc(var(--nav-h) + 2.5rem) clamp(1.25rem, 4vw, 4rem) 4rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Header row — NO bottom border */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '3rem' }}>
          {/* Photo */}
          <div style={{ flexShrink: 0, overflow: 'hidden', width: 200 }}>
            {IMG(person.profile_path, 'w342')
              ? <img src={IMG(person.profile_path, 'w342')} alt={person.name} style={{ width: '100%', objectFit: 'cover', border: '1px solid #1E1E1E', display: 'block' }} />
              : <div style={{ width: 200, height: 280, background: '#111', border: '1px solid #1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '4rem', color: '#333' }}>{person.name?.[0]}</span>
                </div>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <p className="t-mono" style={{ marginBottom: '0.4rem' }}>— {person.known_for_department}</p>
            <h1 style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 0.9, letterSpacing: '0.01em', marginBottom: '1.25rem' }}>
              {person.name}
            </h1>

            {/* Quick facts */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {[
                person.birthday && { k: 'Born', v: person.birthday },
                person.deathday && { k: 'Died', v: person.deathday },
                person.place_of_birth && { k: 'From', v: person.place_of_birth },
              ].filter(Boolean).map(d => (
                <div key={d.k}>
                  <p className="t-mono" style={{ marginBottom: 2 }}>{d.k}</p>
                  <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 600, fontSize: '0.875rem' }}>{d.v}</p>
                </div>
              ))}
            </div>

            {/* Biography with Read more / Read less */}
            {bio && (
              <div>
                <p style={{ color: '#A3A3A3', fontSize: '0.875rem', lineHeight: 1.8, maxWidth: 600 }}>
                  {displayBio}{isLong && !expanded ? '' : ''}
                </p>
                {isLong && (
                  <button
                    onClick={() => setExpanded(e => !e)}
                    style={{ marginTop: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#FF4D00', fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.8rem', fontWeight: 600, padding: 0, letterSpacing: '0.02em' }}
                  >
                    {expanded ? 'Read less ↑' : 'Read more ↓'}
                  </button>
                )}
              </div>
            )}

            {person.homepage && (
              <a href={person.homepage} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '1rem', fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FF4D00', textDecoration: 'none' }}>
                Official Site <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>

        {/* ── Filmography grid — 3 columns, vertical poster cards */}
        {uniqueCredits.length > 0 && (
          <div>
            <p className="t-mono" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1E1E1E' }}>
              Filmography &nbsp;<span style={{ color: '#555' }}>({uniqueCredits.length})</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              {uniqueCredits.map((m, i) => (
                <motion.div
                  key={`${m.id}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.025, 0.5) }}
                  whileHover={{ y: -4 }}
                  style={{ cursor: 'pointer' }}
                >
                  <Link to={`/movie/${m.id}?type=${m.media_type || 'movie'}`} style={{ textDecoration: 'none', display: 'block' }}>
                    {/* Poster */}
                    <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: '0.75rem', aspectRatio: '2/3', background: '#111' }}>
                      {IMG(m.poster_path)
                        ? <img src={IMG(m.poster_path)} alt={m.title || m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, rgba(255,77,0,0.12) 0%, #0A0A0A 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src="/logo.png" alt="Cinetter" style={{ width: 32, opacity: 0.25, objectFit: 'contain' }} />
                          </div>
                      }
                    </div>
                    {/* Text below poster */}
                    <div>
                      <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: '#E5E5E5', lineHeight: 1.35, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {m.title || m.name}
                      </p>
                      <p className="t-mono" style={{ fontSize: '0.58rem', color: '#555', marginBottom: m._role ? 3 : 0 }}>
                        {m.media_type === 'tv' ? 'TV' : 'Movie'}{(m.release_date || m.first_air_date) ? ` • ${(m.release_date || m.first_air_date).slice(0, 4)}` : ''}
                      </p>
                      {m._role && (
                        <p style={{ fontFamily: "'Google Sans Flex', sans-serif", fontSize: '0.72rem', color: '#737373', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {m._role}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
