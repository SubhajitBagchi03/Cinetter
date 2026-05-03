import Review from './review.model.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { emitToMovie } from '../../sockets/index.js';

export const createReview = async (req, res, next) => {
  try {
    const { movieId, mediaType = 'movie', title, content, rating, cinePulseCategory, spoiler } = req.body;

    if (!movieId) throw new ApiError(400, 'movieId is required');
    if (!content || content.trim().length < 20) throw new ApiError(400, 'Review must be at least 20 characters');

    const existing = await Review.findOne({ userId: req.user._id, movieId: Number(movieId), isRemoved: false });
    if (existing) throw new ApiError(409, 'You have already reviewed this movie');

    const review = await Review.create({
      userId: req.user._id,
      movieId: Number(movieId),
      mediaType,
      title: title?.trim(),
      content: content.trim(),
      rating: rating ? Number(rating) : undefined,
      cinePulseCategory: cinePulseCategory || undefined,
      spoiler: Boolean(spoiler),
    });

    await review.populate('userId', 'username avatar');
    emitToMovie(movieId, 'review:new', review);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

export const getReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    const { sort = 'liked', page = 1, limit = 20 } = req.query;

    const sortMap = { liked: { likeCount: -1 }, newest: { createdAt: -1 } };
    const reviews = await Review.find({ movieId: Number(movieId), isRemoved: false })
      .sort(sortMap[sort] || sortMap.liked)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('userId', 'username avatar')
      .populate('replies.userId', 'username avatar');

    const total = await Review.countDocuments({ movieId: Number(movieId), isRemoved: false });
    res.json({
      success: true,
      data: reviews,
      pagination: { page: Number(page), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

export const toggleLike = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review || review.isRemoved) throw new ApiError(404, 'Review not found');

    const uid = req.user._id;
    const liked = review.likes.some(id => id.toString() === uid.toString());
    if (liked) review.likes = review.likes.filter(id => id.toString() !== uid.toString());
    else review.likes.push(uid);

    review.likeCount = review.likes.length;
    await review.save();

    emitToMovie(review.movieId, 'review:liked', { reviewId: review._id, likeCount: review.likeCount });
    res.json({ success: true, data: { liked: !liked, likeCount: review.likeCount } });
  } catch (err) { next(err); }
};

export const addReply = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) throw new ApiError(400, 'Reply text is required');

    const review = await Review.findById(req.params.id);
    if (!review || review.isRemoved) throw new ApiError(404, 'Review not found');

    review.replies.push({ userId: req.user._id, text: text.trim() });
    await review.save();
    await review.populate('replies.userId', 'username avatar');

    const reply = review.replies[review.replies.length - 1];
    emitToMovie(review.movieId, 'review:reply', { reviewId: review._id, reply });
    res.status(201).json({ success: true, data: reply });
  } catch (err) { next(err); }
};

export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) throw new ApiError(404, 'Review not found');

    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = ['admin', 'moderator'].includes(req.user.role);
    if (!isOwner && !isAdmin) throw new ApiError(403, 'Not authorized to delete this review');

    review.isRemoved = true;
    await review.save();
    res.json({ success: true, message: 'Review removed' });
  } catch (err) { next(err); }
};
