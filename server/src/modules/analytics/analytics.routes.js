import { Router } from 'express';
const router = Router();
router.post('/track', (req, res) => res.json({ success: true }));
router.get('/dashboard', (req, res) => res.json({ success: true, data: {} }));
export default router;
