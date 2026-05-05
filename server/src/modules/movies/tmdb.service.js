import axios from 'axios';
import config from '../../config/index.js';
import { getRedis } from '../../config/redis.js';
import logger from '../../utils/logger.js';

// Use Bearer token (Read Access Token) if available, fall back to api_key param
const tmdb = axios.create({
  baseURL: config.tmdb.baseUrl,
  timeout: 20000,
  headers: config.tmdb.readAccessToken
    ? { Authorization: `Bearer ${config.tmdb.readAccessToken}` }
    : {},
  params: {
    ...(!config.tmdb.readAccessToken && { api_key: config.tmdb.apiKey }),
    language: 'en-US',
  },
});

// Timezone-safe local date string  YYYY-MM-DD
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const cache = async (key, ttl, fetcher) => {
  const redis = getRedis();
  if (redis) {
    try {
      const cached = await redis.get(key);
      if (cached) return JSON.parse(cached);
    } catch {}
  }
  const data = await fetcher();
  if (redis) {
    try { await redis.setex(key, ttl, JSON.stringify(data)); } catch {}
  }
  return data;
};

const tmdbService = {
  getTrending: (timeWindow = 'week') =>
    cache('trending:movies', 3600, async () => {
      const { data } = await tmdb.get(`/trending/all/${timeWindow}`);
      return data.results;
    }),

  refreshTrending: async () => {
    const { data } = await tmdb.get('/trending/all/week');
    const redis = getRedis();
    if (redis) await redis.setex('trending:movies', 3600, JSON.stringify(data.results));
    return data.results;
  },

  search: (query, page = 1) =>
    cache(`search:${query}:${page}`, 1800, async () => {
      const { data } = await tmdb.get('/search/multi', { params: { query, page } });
      return data;
    }),

  getMovieDetail: (id) =>
    cache(`movie:detail_v2:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/movie/${id}`, { params: { append_to_response: 'videos,release_dates,external_ids,keywords' } });
      return data;
    }),

  getShowDetail: (id) =>
    cache(`show:detail_v2:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/tv/${id}`, { params: { append_to_response: 'videos,content_ratings,external_ids,keywords' } });
      return data;
    }),

  getCredits: (id, type = 'movie') =>
    cache(`${type}:credits:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/${type}/${id}/credits`);
      return data;
    }),

  getSimilar: (id, type = 'movie') =>
    cache(`${type}:similar:${id}`, 21600, async () => {
      let { data } = await tmdb.get(`/${type}/${id}/similar`);
      if (!data.results || data.results.length === 0) {
        const recs = await tmdb.get(`/${type}/${id}/recommendations`);
        data = recs.data;
      }
      return data.results || [];
    }),

  getPerson: (id) =>
    cache(`person:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/person/${id}`, { params: { append_to_response: 'movie_credits,tv_credits' } });
      return data;
    }),

  getUpcoming: (page = 1) =>
    cache(`upcoming:${page}`, 3600, async () => {
      const { data } = await tmdb.get('/movie/upcoming', { params: { page } });
      return data;
    }),

  getNowPlaying: (page = 1) =>
    cache(`now_playing:${page}`, 3600, async () => {
      const { data } = await tmdb.get('/movie/now_playing', { params: { page } });
      return data;
    }),

  getAiringToday: () =>
    cache('tv:airing_today', 3600, async () => {
      const { data } = await tmdb.get('/tv/airing_today');
      return data;
    }),

  getOnTheAir: (page = 1) =>
    cache(`tv:on_the_air:${page}`, 3600, async () => {
      const { data } = await tmdb.get('/tv/on_the_air', { params: { page } });
      return data;
    }),

  // Genuinely upcoming TV: shows with future premiere dates not yet aired
  getUpcomingTV: (page = 1) =>
    cache(`tv:upcoming:${page}`, 3600, async () => {
      const today = localDate();   // local date, not UTC
      const { data } = await tmdb.get('/discover/tv', {
        params: {
          'first_air_date.gte': today,
          sort_by: 'popularity.desc',
          page,
        },
      });
      return data;
    }),

  // Movies releasing on exactly today's date (discover, not now_playing)
  getReleasingToday: () =>
    cache(`releasing_today:${localDate()}`, 1800, async () => {
      const today = localDate();
      const { data } = await tmdb.get('/discover/movie', {
        params: {
          'primary_release_date.gte': today,
          'primary_release_date.lte': today,
          sort_by: 'popularity.desc',
        },
      });
      return data;
    }),

  getPersonCredits: (id) =>
    cache(`person:credits:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/person/${id}/combined_credits`);
      return data;
    }),

  getTopRated: (type = 'movie') =>
    cache(`top_rated:${type}`, 7200, async () => {
      const { data } = await tmdb.get(`/${type}/top_rated`);
      return data.results;
    }),

  getPopular: (type = 'movie') =>
    cache(`popular:${type}`, 3600, async () => {
      const { data } = await tmdb.get(`/${type}/popular`);
      return data.results;
    }),

  getGenres: (type = 'movie') =>
    cache(`genres:${type}`, 86400 * 7, async () => {
      const { data } = await tmdb.get(`/genre/${type}/list`);
      return data.genres;
    }),

  discoverByGenre: (genreId, type = 'movie') =>
    cache(`discover:${type}:${genreId}`, 3600, async () => {
      const { data } = await tmdb.get(`/discover/${type}`, { params: { with_genres: genreId, sort_by: 'popularity.desc' } });
      return data.results;
    }),

  // Discover by streaming provider (Netflix=8, Prime=119, Hotstar=122, JioCinema=220)
  discoverByProvider: (providerId, region = 'IN', type = 'movie') =>
    cache(`provider:${providerId}:${region}:${type}`, 3600, async () => {
      const { data } = await tmdb.get(`/discover/${type}`, {
        params: {
          with_watch_providers: providerId,
          watch_region: region,
          sort_by: 'popularity.desc',
        },
      });
      return data.results || [];
    }),


  // Get watch providers for a specific movie/show
  getWatchProviders: (id, type = 'movie') =>
    cache(`watch_providers:${type}:${id}`, 86400, async () => {
      const { data } = await tmdb.get(`/${type}/${id}/watch/providers`);
      return data.results || {};
    }),

  getImageUrl: (path, size = 'w500') =>
    path ? `${config.tmdb.imageBaseUrl}/${size}${path}` : null,

  // Fetch movie/show with credits appended (for AI context — short TTL)
  fetchWithCredits: (id, type = 'movie') =>
    cache(`credits_context:${type}:${id}`, 3600, async () => {
      const { data } = await tmdb.get(`/${type}/${id}`, {
        params: { append_to_response: 'credits' },
      });
      return data;
    }),
};

export default tmdbService;
