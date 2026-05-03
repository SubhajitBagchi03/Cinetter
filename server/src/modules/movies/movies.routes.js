import { Router } from 'express';
import {
  getTrending, search, getMovieDetail, getCredits, getSimilar,
  getPerson, getPersonCredits, getUpcoming, getNowPlaying,
  getTopRated, getPopular, getGenres, discoverByGenre,
  discoverByProvider, getWatchProviders, getAiringToday, getOnTheAir, getUpcomingTV,
} from './movies.controller.js';

const router = Router();

// Lists
router.get('/trending',    getTrending);
router.get('/upcoming',    getUpcoming);
router.get('/now-playing', getNowPlaying);
router.get('/airing-today',  getAiringToday);
router.get('/on-air',        getOnTheAir);
router.get('/upcoming-tv',   getUpcomingTV);
router.get('/top-rated',   getTopRated);
router.get('/popular',     getPopular);
router.get('/genres',      getGenres);
router.get('/discover',    discoverByGenre);
router.get('/streaming',   discoverByProvider);   // OTT rows

// Search
router.get('/search', search);

// Person
router.get('/person/:id',         getPerson);
router.get('/person/:id/credits', getPersonCredits);

// Movie / TV — must come AFTER named routes to avoid path conflicts
router.get('/:id/watch-providers', getWatchProviders);  // OTT for detail page
router.get('/:id',         getMovieDetail);
router.get('/:id/credits', getCredits);
router.get('/:id/similar', getSimilar);

export default router;
