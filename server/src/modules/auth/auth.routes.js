import { Router } from 'express';
import { register, login, refreshToken, logout, getMe } from './auth.controller.js';
import { registerSchema, loginSchema, validate } from './auth.validation.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);

export default router;
