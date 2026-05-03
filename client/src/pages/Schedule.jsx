import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronDown } from 'lucide-react';
import api from '../lib/api';

const IMG = (p) => p ? `https://image.tmdb.org/t/p/w342${p}` : null;
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const NOW    = () => new Date().toISOString().slice(0,10);

const fmtDate = (d) => {
  const dt = new Date(d + 'T12:00:00');
  return `${DAYS[dt.getDay()]} · ${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

// Group items by their actual release_date / first_air_date, sorted ascending
const groupByDate = (items) => {
  const map = {};
  items.forEach(m => {
    const d = m.release_date || m.first_air_date || 'TBD';
    (map[d] = map[d] || []).push(m);
  });
  return Object.entries(map).sort(([a],[b]) => {
    if (a==='TBD') return 1; if (b==='TBD') return -1;
    return new Date(a) - new Date(b);
  });
};

// Deduplicate array by id
const dedup = (arr) => {
  const seen = new Set();
  return arr.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
};

// ── Poster card (badge from real date only) ──────────────────────────────
function DropCard({ movie }) {
  const title  = movie.title || movie.name || '';
  const year   = (movie.release_date || movie.first_air_date || '').slice(0,4);
  const mtype  = movie.media_type === 'tv' ? 'tv' : 'movie';
  const relStr = movie.release_date || movie.first_air_date;
  const showBadge = relStr ? relStr > NOW() : false; // strictly future date only

  return (
    <Link to={`/movie/${movie.id}?type=${mtype}`} style={{textDecoration:'none',display:'block'}}>
      <motion.div whileHover={{y:-4}} transition={{duration:0.16}}>
        <div style={{position:'relative',borderRadius:6,overflow:'hidden',background:'#111',marginBottom:'0.55rem'}}>
          {IMG(movie.poster_path)
            ? <img src={IMG(movie.poster_path)} alt={title} loading="lazy"
                style={{width:'100%',aspectRatio:'2/3',objectFit:'cover',display:'block'}} />
            : <div style={{aspectRatio:'2/3',background:'linear-gradient(135deg,rgba(255,77,0,.08)0%,#0A0A0A 70%)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <img src="/logo.png" alt="" style={{width:26,opacity:0.15}} />
              </div>
          }
          {showBadge && (
            <div style={{position:'absolute',top:7,right:7,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(6px)',border:'1px solid rgba(255,77,0,.5)',borderRadius:5,padding:'3px 7px',display:'flex',alignItems:'center',gap:4}}>
              <Zap size={10} fill="#FF4D00" color="#FF4D00" />
            </div>
          )}
        </div>
        <p style={{fontFamily:"'Google Sans Flex',sans-serif",fontWeight:700,fontSize:'0.74rem',color:'#E5E5E5',lineHeight:1.3,marginBottom:2,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{title}</p>
        <p style={{fontFamily:"'Google Sans Flex',sans-serif",fontSize:'0.62rem',color:'#555'}}>{mtype==='tv'?'Show':'Film'} · {year||'TBD'}</p>
      </motion.div>
    </Link>
  );
}

// ── Flat card grid ───────────────────────────────────────────────────────
function CardGrid({ items }) {
  if (!items.length) return null;
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'1rem'}}>
      {items.map((m,i) => (
        <motion.div key={`${m.id}-${i}`} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:Math.min(i*0.025,0.35)}}>
          <DropCard movie={m} />
        </motion.div>
      ))}
    </div>
  );
}

// ── Date group (with date header + grid) ────────────────────────────────
function DateGroup({ date, items }) {
  const isToday = date === NOW();
  const dt = date !== 'TBD' ? new Date(date + 'T12:00:00') : null;
  return (
    <div style={{marginBottom:'2.5rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'1.25rem'}}>
        {dt && (
          <div style={{textAlign:'center',width:44,flexShrink:0}}>
            <div style={{fontFamily:"'Google Sans Flex',sans-serif",fontSize:'1.6rem',fontWeight:900,lineHeight:1,color:isToday?'#FF4D00':'#fff'}}>{dt.getDate()}</div>
            <div className="t-mono" style={{fontSize:'0.5rem',color:isToday?'#FF4D00':'#555'}}>{MONTHS[dt.getMonth()]}</div>
          </div>
        )}
        <div style={{flex:1,height:1,background:'#1E1E1E'}} />
        <span className="t-mono" style={{fontSize:'0.57rem',color:isToday?'#FF4D00':'#333',display:'flex',alignItems:'center',gap:6}}>
          {date==='TBD' ? 'DATE TBD' : fmtDate(date)}
          {isToday && <span style={{background:'#FF4D00',color:'#000',padding:'1px 6px',borderRadius:3,fontWeight:700}}>TODAY</span>}
        </span>
      </div>
      <CardGrid items={items} />
    </div>
  );
}

// ── Filter pill ─────────────────────────────────────────────────────────
function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{padding:'5px 14px',borderRadius:20,border:`1px solid ${active?'#fff':'#1E1E1E'}`,background:active?'#fff':'transparent',color:active?'#000':'#555',fontFamily:"'Google Sans Flex',sans-serif",fontSize:'0.7rem',fontWeight:600,cursor:'pointer',transition:'all .15s'}}>
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:'1rem'}}>
      {Array(12).fill(0).map((_,i) => <div key={i} className="skel" style={{aspectRatio:'2/3',borderRadius:6}} />)}
    </div>
  );
}

// ── Past Drops button ────────────────────────────────────────────────────
function PastDropsBtn({ onClick, loading }) {
  return (
    <motion.button onClick={onClick} whileHover={{y:-2}} whileTap={{scale:0.98}}
      style={{width:'100%',padding:'14px',marginTop:'1rem',background:'#0A0A0A',border:'1px solid #1E1E1E',color:'#555',fontFamily:"'Google Sans Flex',sans-serif",fontSize:'0.75rem',fontWeight:600,letterSpacing:'0.06em',cursor:'pointer',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}
      onMouseEnter={e=>e.currentTarget.style.borderColor='#333'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='#1E1E1E'}
    >
      {loading ? <span style={{color:'#333'}}>Loading...</span> : <><ChevronDown size={14} /> VIEW PAST DROPS</>}
    </motion.button>
  );
}

// ════════════════════════════════════════════════════════════════════════
export default function DropRadar() {
  const [section,    setSection]    = useState('today');
  const [type,       setType]       = useState('all');
  const [subFilter,  setSubFilter]  = useState(null);
  const [todayData,  setTodayData]  = useState({ movies:[], tv:[] });
  const [soonData,   setSoonData]   = useState({ movies:[], tv:[] });
  const [past,       setPast]       = useState([]);
  const [pastPage,   setPastPage]   = useState(1);
  const [loadingPast,setLoadingPast]= useState(false);
  const [hasMorePast,setHasMorePast]= useState(true);
  const [loading,    setLoading]    = useState(true);

  // ── Fetch on mount ────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const today = NOW();
    // "Recent" = last 14 days
    const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate()-14);
    const recentCutoff = fourteenDaysAgo.toISOString().slice(0,10);
    // "Soon" = within 12 months
    const twelveMonthsOut = new Date(); twelveMonthsOut.setMonth(twelveMonthsOut.getMonth()+12);
    const soonCutoff = twelveMonthsOut.toISOString().slice(0,10);
    // "New TV" cutoff no longer needed — upcoming-tv already guarantees future dates

    Promise.all([
      api.get('/movies/now-playing'),          // movies recently in theaters
      api.get('/movies/airing-today'),         // TV airing today specifically
      api.get('/movies/upcoming'),             // upcoming movies p1
      api.get('/movies/upcoming?page=2'),      // upcoming movies p2
      api.get('/movies/upcoming-tv'),          // TV with future premiere dates (discover)
    ]).then(([np, at, up1, up2, utv]) => {
      // ── RELEASING TODAY movies ──
      // now-playing = movies currently in theaters (past ~3 weeks)
      // Filter to last 14 days so we don't show very old stuff under "today"
      const todayMovies = (np.data.data?.results || np.data.data || [])
        .map(m => ({ ...m, media_type:'movie' }))
        .filter(m => m.release_date >= recentCutoff); // last 14 days

      // ── RELEASING TODAY TV ──
      // airing-today = shows with episodes airing exactly today — no filtering needed
      const todayTV = (at.data.data?.results || at.data.data || [])
        .map(m => ({ ...m, media_type:'tv' }));

      // ── DROPPING SOON movies ──
      // upcoming = confirmed future releases — deduplicate p1+p2, keep only future dates within 12 months
      const upcomingRaw = dedup([
        ...(up1.data.data?.results || up1.data.data || []),
        ...(up2.data.data?.results || up2.data.data || []),
      ].map(m => ({ ...m, media_type:'movie' })));

      const soonMovies = upcomingRaw.filter(m =>
        m.release_date && m.release_date > today && m.release_date <= soonCutoff
      );

      // ── DROPPING SOON TV ──
      // upcoming-tv = /discover/tv?first_air_date.gte=today — genuinely future TV premieres only
      // No extra filtering needed — TMDB already guarantees first_air_date >= today
      const soonTV = (utv.data.data?.results || utv.data.data || [])
        .map(m => ({ ...m, media_type:'tv' }));

      setTodayData({ movies: todayMovies, tv: todayTV });
      setSoonData({ movies: soonMovies, tv: soonTV });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // ── Load past drops (older now-playing pages) ─────────────────────────
  const loadMorePast = async () => {
    if (loadingPast) return;
    setLoadingPast(true);
    try {
      const next = pastPage + 1;
      const { data: d } = await api.get(`/movies/now-playing?page=${next}`);
      const results = (d.data?.results || d.data || [])
        .map(m => ({ ...m, media_type:'movie' }));
      setPast(p => dedup([...p, ...results]));
      setPastPage(next);
      if (next >= 4 || results.length === 0) setHasMorePast(false);
    } catch { setHasMorePast(false); }
    finally { setLoadingPast(false); }
  };

  // ── Filter + sub-filter (applied to any list) ─────────────────────────
  const applySubFilter = (items) => {
    if (!subFilter) return items;
    const ago3m = new Date(); ago3m.setMonth(ago3m.getMonth() - 3);
    const ago3mStr = ago3m.toISOString().slice(0, 10);
    const ago1y = new Date(); ago1y.setFullYear(ago1y.getFullYear() - 1);
    const ago1yStr = ago1y.toISOString().slice(0, 10);
    const todayStr = NOW();
    if (subFilter === 'theatre') {
      // In Theatres: releasing within next 3 months (near-term theatrical window)
      const in3m = new Date(); in3m.setMonth(in3m.getMonth() + 3);
      const in3mStr = in3m.toISOString().slice(0, 10);
      return items.filter(m => { const d = m.release_date || m.first_air_date; return d && d > todayStr && d <= in3mStr; });
    }
    if (subFilter === 'streaming') {
      // On Streaming: releasing beyond 3 months (wider streaming release window)
      const in3m = new Date(); in3m.setMonth(in3m.getMonth() + 3);
      const in3mStr = in3m.toISOString().slice(0, 10);
      return items.filter(m => { const d = m.release_date || m.first_air_date; return !d || d > in3mStr; });
    }
    if (subFilter === 'newshow') {
      // New Show: first_air_date in the future (brand new premiere)
      return items.filter(m => { const d = m.first_air_date || m.release_date; return d && d > todayStr; });
    }
    if (subFilter === 'newseason') {
      // New Season: show premiered over a year ago (returning series)
      return items.filter(m => { const d = m.first_air_date || m.release_date; return d && d < ago1yStr; });
    }
    return items;
  };

  const handleTypeChange = (t) => { setType(t); setSubFilter(null); setPast([]); setPastPage(1); setHasMorePast(true); };

  const today = NOW();

  // ── RELEASING TODAY derived ───────────────────────────────────────────
  const todayFiltered = applySubFilter(
    type === 'movie' ? todayData.movies :
    type === 'tv'    ? todayData.tv :
    dedup([...todayData.movies, ...todayData.tv])
  );

  // ── VIEW PAST DROPS derived (movies only, newest first) ───────────────
  const pastFiltered = past.filter(m => m.release_date < today);
  const pastGroups   = groupByDate(pastFiltered).reverse();

  // ── DROPPING SOON derived — flat lists, no date grouping ─────────────
  const soonAll    = dedup([...soonData.movies, ...soonData.tv]);
  const soonItems  = applySubFilter(
    type === 'movie' ? soonData.movies :
    type === 'tv'    ? soonData.tv :
    soonAll
  );

  return (
    <div style={{background:'#000',minHeight:'100vh',paddingTop:'var(--nav-h)',display:'flex'}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:270,flexShrink:0,borderRight:'1px solid #1E1E1E',padding:'2.5rem 0',position:'sticky',top:'var(--nav-h)',height:'calc(100vh - var(--nav-h))',overflowY:'auto'}}>
        <div style={{padding:'0 0.85rem'}}>
            {[
            {key:'today',label:'RELEASING TODAY'},
            {key:'soon', label:'DROPPING SOON'},
          ].map(s => {
            const active = section === s.key;
            return (
              <motion.button key={s.key} onClick={()=>{ setSection(s.key); setSubFilter(null); }} whileHover={{x:active?0:3}}
                style={{width:'100%',textAlign:'left',padding:'0.9rem 1rem',background:active?'#fff':'transparent',border:'none',borderRadius:8,cursor:'pointer',marginBottom:3,transition:'background .2s',display:'flex',flexDirection:'column',gap:4}}
              >
                <span style={{fontFamily:"'Google Sans Flex',sans-serif",fontWeight:800,fontSize:'0.76rem',letterSpacing:'0.06em',color:active?'#000':'#E5E5E5'}}>{s.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,padding:'2rem clamp(1.5rem,3vw,3rem)',overflowY:'auto',maxWidth:'calc(100vw - 270px)'}}>

        {/* Type filter row */}
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem',marginBottom:type!=='all'?'0.6rem':'2rem',flexWrap:'wrap'}}>
          {[{k:'all',l:'All'},{k:'movie',l:'Films'},{k:'tv',l:'Shows'}].map(f =>
            <Pill key={f.k} active={type===f.k} onClick={()=>handleTypeChange(f.k)}>{f.l}</Pill>
          )}
        </div>

        {/* Sub-filter row — only when Films or Shows active */}
        {type !== 'all' && (
          <div style={{display:'flex',gap:'0.4rem',marginBottom:'2rem',flexWrap:'wrap'}}>
            {type==='movie' && [{k:'theatre',l:'In Theatres'},{k:'streaming',l:'On Streaming'}].map(f =>
              <Pill key={f.k} active={subFilter===f.k} onClick={()=>setSubFilter(sf=>sf===f.k?null:f.k)}>{f.l}</Pill>
            )}
            {type==='tv' && [{k:'newshow',l:'New Show'},{k:'newseason',l:'New Season'}].map(f =>
              <Pill key={f.k} active={subFilter===f.k} onClick={()=>setSubFilter(sf=>sf===f.k?null:f.k)}>{f.l}</Pill>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key={section+type+subFilter} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.18}}>

            {/* ══ RELEASING TODAY ═══════════════════════════════════════ */}
            {section === 'today' && (
              loading ? <SkeletonGrid /> : (
                <>
                  {/* Single date header for today */}
                  {todayFiltered.length > 0 ? (
                    <DateGroup date={today} items={todayFiltered} />
                  ) : (
                    <p className="t-mono" style={{color:'#333',textAlign:'center',paddingTop:'4rem'}}>
                      Nothing tracked for today
                    </p>
                  )}

                  {/* Past drops (paginated, grouped by actual date, descending) */}
                  {pastGroups.map(([d,items]) => (
                    <DateGroup key={d} date={d} items={items} />
                  ))}

                  {/* Only show past drops button for Films/All (no past TV data) */}
                  {type !== 'tv' && hasMorePast && (
                    <PastDropsBtn onClick={loadMorePast} loading={loadingPast} />
                  )}
                </>
              )
            )}

            {/* ══ DROPPING SOON — flat grid, no date grouping ════════ */}
            {section === 'soon' && (
              loading ? <SkeletonGrid /> : (
                soonItems.length === 0 ? (
                  <p className="t-mono" style={{color:'#333',textAlign:'center',paddingTop:'4rem'}}>Nothing dropping soon</p>
                ) : (
                  <CardGrid items={soonItems} />
                )
              )
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
