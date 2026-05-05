import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { upload, uploadToCloudinary } from '../../middleware/cloudinary.js';
import {
  getFeed, getPost, createPost, deletePost, toggleLikePost, togglePinPost,
  getComments, getReplies, addComment, toggleLikeComment, deleteComment,
} from './spaces.controller.js';

const router = Router();

// Feed & posts
router.get('/posts',             getFeed);
router.get('/posts/:id',         getPost);
router.post('/posts',            authenticate, createPost);
router.delete('/posts/:id',      authenticate, deletePost);
router.post('/posts/:id/like',   authenticate, toggleLikePost);
router.patch('/posts/:id/pin',   authenticate, authorize('admin'), togglePinPost);

// Comments
router.get('/posts/:id/comments',                    getComments);
router.get('/posts/:id/comments/:cid/replies',       getReplies);
router.post('/posts/:id/comments',                   authenticate, addComment);
router.post('/posts/:id/comments/:cid/like',         authenticate, toggleLikeComment);
router.delete('/posts/:id/comments/:cid',            authenticate, deleteComment);

// Image upload (Cloudinary) — max 4 images per post
router.post('/upload-images', authenticate, upload.array('images', 4), async (req, res, next) => {
  try {
    if (!req.files?.length) return res.status(400).json({ success: false, message: 'No files provided' });
    const urls = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer)));
    res.json({ success: true, data: urls });
  } catch (err) { next(err); }
});

// TMDB image proxy — allows crossOrigin canvas capture in Share modal
// Only proxies image.tmdb.org URLs for security
router.get('/proxy-image', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.startsWith('https://image.tmdb.org/')) {
    return res.status(400).json({ success: false, message: 'Invalid image URL' });
  }
  try {
    const upstream = await fetch(url);
    if (!upstream.ok) return res.status(404).end();
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.set('Content-Type', upstream.headers.get('content-type') || 'image/jpeg');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  } catch { res.status(502).end(); }
});

export default router;
