import { Router } from 'express';
import { authenticate, optionalAuth } from '../../middleware/auth.js';
import { toggleInterest, getInterest } from './interest.controller.js';

const router = Router();

// GET /api/v1/interest/:movieId — count + current user state
router.get('/:movieId', optionalAuth, getInterest);

// POST /api/v1/interest — toggle (requires login)
router.post('/', authenticate, toggleInterest);

export default router;
