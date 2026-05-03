import { Router } from 'express';
import { createReview, getReviews, toggleLike, addReply, deleteReview } from './reviews.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { reviewLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/', authenticate, reviewLimiter, createReview);
router.get('/:movieId', getReviews);
router.post('/:id/like', authenticate, toggleLike);
router.post('/:id/reply', authenticate, addReply);
router.delete('/:id', authenticate, deleteReview);

export default router;
