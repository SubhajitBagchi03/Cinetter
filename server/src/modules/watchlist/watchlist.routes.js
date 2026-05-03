import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import User from '../auth/user.model.js';
import tmdbService from '../movies/tmdb.service.js';
import { ApiError } from '../../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('watchlist');
    if (!user.watchlist.length) return res.json({ success: true, data: [] });
    const movies = await Promise.allSettled(user.watchlist.map(id => tmdbService.getMovieDetail(id)));
    const data = movies.filter(r => r.status === 'fulfilled').map(r => r.value);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { movieId } = req.body;
    if (!movieId) throw new ApiError(400, 'movieId required');
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { watchlist: Number(movieId) } });
    res.json({ success: true, message: 'Added to watchlist' });
  } catch (err) { next(err); }
});

router.delete('/:movieId', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { watchlist: Number(req.params.movieId) } });
    res.json({ success: true, message: 'Removed from watchlist' });
  } catch (err) { next(err); }
});

export default router;
