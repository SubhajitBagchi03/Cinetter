import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import User from '../auth/user.model.js';
import Review from '../reviews/review.model.js';

const router = Router();

router.get('/users', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = search ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] } : {};
    const users = await User.find(query).select('-password -refreshToken')
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (err) { next(err); }
});

router.patch('/ban-user/:id', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned: req.body.isBanned }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.delete('/review/:id', authenticate, authorize('admin', 'moderator'), async (req, res, next) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, { isRemoved: true });
    res.json({ success: true, message: 'Review removed' });
  } catch (err) { next(err); }
});

router.get('/analytics', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const [totalUsers, totalReviews] = await Promise.all([
      User.countDocuments(),
      Review.countDocuments({ isRemoved: false }),
    ]);
    res.json({ success: true, data: { totalUsers, totalReviews } });
  } catch (err) { next(err); }
});

export default router;
