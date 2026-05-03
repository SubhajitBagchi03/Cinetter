import { Router } from 'express';
import Collection from './collection.model.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';

const router = Router();

router.get('/discover', optionalAuth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const collections = await Collection.find({ isPublic: true })
      .sort({ likeCount: -1 }).skip((page - 1) * limit).limit(Number(limit))
      .populate('authorId', 'username avatar');
    res.json({ success: true, data: collections });
  } catch (err) { next(err); }
});

router.get('/my', authenticate, async (req, res, next) => {
  try {
    const data = await Collection.find({ authorId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.get('/saved', authenticate, async (req, res, next) => {
  try {
    const data = await Collection.find({ savedBy: req.user._id }).populate('authorId', 'username avatar');
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    if (!name) throw new ApiError(400, 'Name required');
    const col = await Collection.create({ name, description, isPublic, authorId: req.user._id });
    res.status(201).json({ success: true, data: col });
  } catch (err) { next(err); }
});

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const col = await Collection.findById(req.params.id).populate('authorId', 'username avatar');
    if (!col || (!col.isPublic && col.authorId._id.toString() !== req.user?._id?.toString()))
      throw new ApiError(404, 'Collection not found');
    res.json({ success: true, data: col });
  } catch (err) { next(err); }
});

router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const col = await Collection.findById(req.params.id);
    if (!col) throw new ApiError(404, 'Not found');
    const liked = col.likes.includes(req.user._id);
    if (liked) col.likes.pull(req.user._id);
    else col.likes.push(req.user._id);
    col.likeCount = col.likes.length;
    await col.save();
    res.json({ success: true, data: { liked: !liked, likeCount: col.likeCount } });
  } catch (err) { next(err); }
});

router.post('/:id/movies', authenticate, async (req, res, next) => {
  try {
    const { movieId } = req.body;
    const col = await Collection.findOne({ _id: req.params.id, authorId: req.user._id });
    if (!col) throw new ApiError(404, 'Collection not found');
    col.movies.addToSet ? col.movies.push(Number(movieId)) : col.movies.push(Number(movieId));
    await col.save();
    res.json({ success: true, data: col });
  } catch (err) { next(err); }
});

export default router;
