import tmdbService from './tmdb.service.js';
import { ApiError } from '../../middleware/errorHandler.js';

export const getTrending = async (req, res, next) => {
  try {
    const { window = 'week' } = req.query;
    const data = await tmdbService.getTrending(window);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const search = async (req, res, next) => {
  try {
    const { q, page = 1 } = req.query;
    if (!q?.trim()) throw new ApiError(400, 'Search query required');
    const data = await tmdbService.search(q.trim(), page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getMovieDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'movie' } = req.query;
    const data = type === 'tv'
      ? await tmdbService.getShowDetail(id)
      : await tmdbService.getMovieDetail(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getCredits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getCredits(id, type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getSimilar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getSimilar(id, type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getPerson = async (req, res, next) => {
  try {
    const data = await tmdbService.getPerson(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getUpcoming = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbService.getUpcoming(page);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getNowPlaying = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbService.getNowPlaying(Number(page));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getAiringToday = async (req, res, next) => {
  try {
    const data = await tmdbService.getAiringToday();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getOnTheAir = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbService.getOnTheAir(Number(page));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getUpcomingTV = async (req, res, next) => {
  try {
    const { page = 1 } = req.query;
    const data = await tmdbService.getUpcomingTV(Number(page));
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getReleasingToday = async (req, res, next) => {
  try {
    const data = await tmdbService.getReleasingToday();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getPersonCredits = async (req, res, next) => {
  try {
    const data = await tmdbService.getPersonCredits(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getTopRated = async (req, res, next) => {
  try {
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getTopRated(type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getPopular = async (req, res, next) => {
  try {
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getPopular(type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const getGenres = async (req, res, next) => {
  try {
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getGenres(type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const discoverByGenre = async (req, res, next) => {
  try {
    const { genreId, type = 'movie' } = req.query;
    if (!genreId) throw new ApiError(400, 'genreId required');
    const data = await tmdbService.discoverByGenre(genreId, type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// OTT: discover movies/shows by streaming provider
export const discoverByProvider = async (req, res, next) => {
  try {
    const { providerId, region = 'IN', type = 'movie' } = req.query;
    if (!providerId) throw new ApiError(400, 'providerId required');
    const data = await tmdbService.discoverByProvider(Number(providerId), region, type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// OTT: get watch providers for a movie/show
export const getWatchProviders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type = 'movie' } = req.query;
    const data = await tmdbService.getWatchProviders(id, type);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

