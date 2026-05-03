import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import tmdbService from '../movies/tmdb.service.js';

const router = Router();

const MOOD_GENRE_MAP = {
  '😊': [35, 10751],     // Happy → Comedy, Family
  '😢': [18, 10749],     // Emotional → Drama, Romance
  '😤': [28, 53],        // Action → Action, Thriller
  '🤔': [9648, 878],     // Curious → Mystery, Sci-Fi
  '😱': [27, 53],        // Thrills → Horror, Thriller
  '😍': [10749, 35],     // Romantic → Romance, Comedy
  '🎉': [35, 12],        // Festive → Comedy, Adventure
  '😴': [99, 10751],     // Tired → Documentary, Family
  '🔥': [28, 12, 878],   // Hyped → Action, Adventure, Sci-Fi
};

// ── Mood Recommend ─────────────────────────────────────────────────────
router.post('/mood-recommend', async (req, res, next) => {
  try {
    const { mood } = req.body;
    const genres = MOOD_GENRE_MAP[mood] || [28, 12];
    const data = await tmdbService.discoverByGenre(genres[0]);
    // Mix from secondary genre too for variety
    let results = data || [];
    if (genres[1]) {
      const data2 = await tmdbService.discoverByGenre(genres[1]).catch(() => []);
      const combined = [...results, ...(data2 || [])];
      // Deduplicate
      const seen = new Set();
      results = combined.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
    }
    res.json({ success: true, data: results.slice(0, 12) });
  } catch (err) { next(err); }
});

// ── CineRoast ──────────────────────────────────────────────────────────
router.post('/cine-roast', async (req, res, next) => {
  try {
    const { movieTitle, overview } = req.body;
    if (!movieTitle) return res.status(400).json({ success: false, message: 'movieTitle required' });

    const templates = [
      `${movieTitle} had more plot holes than a Swiss cheese factory. The writers clearly Googled "what is a story arc?" at 2am. 🧀`,
      `Watching ${movieTitle} felt like being charged ₹500 for tap water. Technically it works, but you feel robbed. 💸`,
      `${movieTitle}: where the script budget was clearly ₹0 and everything went to the catering. The pizza was probably great. 🍕`,
      `${movieTitle} is what happens when studio execs say "trust the process" and the process has trust issues. 💀`,
      `${movieTitle} was so predictable I wrote the ending in the first 10 minutes and made chai. The chai was better. ☕`,
      `Somewhere in ${movieTitle}'s runtime, the film forgot it was supposed to have a point. We never found it. 🔍`,
    ];
    const roast = templates[Math.floor(Math.random() * templates.length)];
    res.json({ success: true, data: { roast, movie: movieTitle } });
  } catch (err) { next(err); }
});

// ── Director's Chair ───────────────────────────────────────────────────
router.post('/directors-chair', async (req, res, next) => {
  try {
    const { genre = 'Drama', premise = 'An unlikely hero', vibe = 'Epic' } = req.body;

    const genreTaglines = {
      Drama:    'Nothing is the same after the credits roll.',
      Horror:   'You asked for it. You shouldn\'t have.',
      SciFi:    'The universe had other plans.',
      Comedy:   'Laugh. Then laugh again. Then cry.',
      Action:   'They pushed. Now it\'s their problem.',
      Romance:  'Some stories don\'t have happy endings. This one does. Barely.',
      Thriller: 'Everyone has a secret. Some are deadlier than others.',
    };

    const castPool = [
      ['Timothée Chalamet', 'Zendaya', 'Pedro Pascal'],
      ['Ranveer Singh', 'Alia Bhatt', 'Hrithik Roshan'],
      ['Prabhas', 'Deepika Padukone', 'Mahesh Babu'],
      ['Cillian Murphy', 'Florence Pugh', 'Barry Keoghan'],
    ];

    const pitch = {
      title: `${vibe}: ${premise.split(' ').slice(0, 3).join(' ')}`,
      tagline: genreTaglines[genre] || `${premise} — nothing will ever be the same.`,
      genre,
      vibe,
      runtime: `${90 + Math.floor(Math.random() * 60)} mins`,
      castSuggestions: castPool[Math.floor(Math.random() * castPool.length)],
      predictedCinePulse: ['Masterpiece', 'Engage', 'Chill Watch'][Math.floor(Math.random() * 3)],
      posterConcept: `A ${vibe.toLowerCase()} ${genre.toLowerCase()} visual — dramatic lighting, bold typography, stark contrast. Think IMAX poster meets magazine editorial.`,
      productionBudget: `$${20 + Math.floor(Math.random() * 180)}M`,
    };
    res.json({ success: true, data: pitch });
  } catch (err) { next(err); }
});

// ── Déjà View — "describe a scene, find the movie" ────────────────────
router.post('/deja-view', async (req, res, next) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ success: false, message: 'description required' });
    // Smart keyword extraction → TMDB search
    const keywords = description.split(' ').filter(w => w.length > 4).slice(0, 3).join(' ');
    const results = await tmdbService.search(keywords);
    res.json({ success: true, data: { query: keywords, results: results.results?.slice(0, 6) || [] } });
  } catch (err) { next(err); }
});

export default router;
