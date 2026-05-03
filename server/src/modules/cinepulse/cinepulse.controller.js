import Vote from './vote.model.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { emitToMovie } from '../../sockets/index.js';
import { getRedis } from '../../config/redis.js';

const CATEGORY_SCORES = { drop: 0, chill: 33, engage: 66, masterpiece: 100 };

const calcScore = (distribution) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  if (!total) return { score: 0, distribution, total };
  const weighted = Object.entries(distribution).reduce(
    (sum, [cat, count]) => sum + CATEGORY_SCORES[cat] * count, 0
  );
  return { score: Math.round(weighted / total), distribution, total };
};

const invalidateCache = async (movieId) => {
  const redis = getRedis();
  if (redis) await redis.del(`cinepulse:${movieId}`).catch(() => {});
};

export const vote = async (req, res, next) => {
  try {
    const { movieId, category } = req.body;
    if (!movieId || !category) throw new ApiError(400, 'movieId and category required');

    await Vote.findOneAndUpdate(
      { userId: req.user._id, movieId },
      { category },
      { upsert: true, new: true }
    );

    await invalidateCache(movieId);

    const distribution = await Vote.aggregate([
      { $match: { movieId: Number(movieId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const dist = { drop: 0, chill: 0, engage: 0, masterpiece: 0 };
    distribution.forEach(({ _id, count }) => { dist[_id] = count; });
    const result = calcScore(dist);

    // Broadcast real-time update to movie room
    emitToMovie(movieId, 'cinepulse:update', result);

    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const getScore = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const redis = getRedis();
    const cacheKey = `cinepulse:${movieId}`;

    if (redis) {
      const cached = await redis.get(cacheKey).catch(() => null);
      if (cached) return res.json({ success: true, data: JSON.parse(cached), cached: true });
    }

    const distribution = await Vote.aggregate([
      { $match: { movieId: Number(movieId) } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const dist = { drop: 0, chill: 0, engage: 0, masterpiece: 0 };
    distribution.forEach(({ _id, count }) => { dist[_id] = count; });
    const result = calcScore(dist);

    // User's own vote
    if (req.user) {
      const userVote = await Vote.findOne({ userId: req.user._id, movieId: Number(movieId) });
      result.userVote = userVote?.category || null;
    }

    if (redis) await redis.setex(cacheKey, 300, JSON.stringify(result)).catch(() => {});
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const removeVote = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    await Vote.findOneAndDelete({ userId: req.user._id, movieId: Number(movieId) });
    await invalidateCache(movieId);
    res.json({ success: true, message: 'Vote removed' });
  } catch (err) { next(err); }
};
