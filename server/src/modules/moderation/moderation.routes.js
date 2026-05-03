import { Router } from 'express';
const router = Router();
router.get('/reported', (req, res) => res.json({ success: true, data: [] }));
router.patch('/approve/:id', (req, res) => res.json({ success: true }));
router.delete('/remove/:id', (req, res) => res.json({ success: true }));
export default router;
