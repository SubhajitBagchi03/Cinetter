import { Router } from 'express';
import User from '../auth/user.model.js';
import { authenticate } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';

const router = Router();

router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken -watchlist');
    if (!user) throw new ApiError(404, 'User not found');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { bio, avatar }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

router.post('/:id/follow', authenticate, async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'Cannot follow yourself');
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
    res.json({ success: true, message: 'Followed' });
  } catch (err) { next(err); }
});

router.delete('/:id/follow', authenticate, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
    await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
    res.json({ success: true, message: 'Unfollowed' });
  } catch (err) { next(err); }
});

export default router;
