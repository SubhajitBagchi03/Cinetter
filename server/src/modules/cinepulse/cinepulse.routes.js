import { Router } from 'express';
import { vote, getScore, removeVote } from './cinepulse.controller.js';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { voteLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/vote', authenticate, voteLimiter, vote);
router.get('/:movieId', optionalAuth, getScore);
router.delete('/vote/:movieId', authenticate, removeVote);

export default router;
