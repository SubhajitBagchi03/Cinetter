import Interest from './interest.model.js';
import { ApiError } from '../../middleware/errorHandler.js';

// POST /api/v1/movies/interest — toggle interest
export const toggleInterest = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { movieId, movieTitle, releaseDate, mediaType = 'movie' } = req.body;
    if (!movieId || !movieTitle) throw new ApiError(400, 'movieId and movieTitle required');

    const existing = await Interest.findOne({ userId, movieId });

    if (existing) {
      await existing.deleteOne();
      const count = await Interest.countDocuments({ movieId });
      return res.json({ success: true, interested: false, count });
    }

    await Interest.create({
      userId,
      movieId,
      movieTitle,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      mediaType,
    });

    const count = await Interest.countDocuments({ movieId });
    res.json({ success: true, interested: true, count });
  } catch (err) { next(err); }
};

// GET /api/v1/movies/interest/:movieId — get count + user state
export const getInterest = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const count = await Interest.countDocuments({ movieId });
    const interested = req.user
      ? !!(await Interest.findOne({ userId: req.user._id, movieId }))
      : false;
    res.json({ success: true, data: { count, interested } });
  } catch (err) { next(err); }
};
