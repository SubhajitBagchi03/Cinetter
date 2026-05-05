import SpacePost    from './spacePost.model.js';
import SpaceComment from './spaceComment.model.js';
import { getIO }    from '../../sockets/index.js';

const POPULATE_AUTHOR = { path: 'authorId', select: 'username role' };

// ── GET /posts ────────────────────────────────────────────────────────────
export const getFeed = async (req, res, next) => {
  try {
    const { topic, type, sort = 'latest', page = 1, limit = 12, author } = req.query;
    const query = {};
    if (topic && topic !== 'all') query.topics = topic;
    if (type)   query.type = type;
    if (author) query.authorId = author;   // "My Posts" filter

    const sortObj = sort === 'top'
      ? { pinned: -1, likeCount: -1, createdAt: -1 }
      : { pinned: -1, createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      SpacePost.find(query).sort(sortObj).skip(skip).limit(Number(limit))
        .populate(POPULATE_AUTHOR).lean(),
      SpacePost.countDocuments(query),
    ]);

    res.json({ success: true, data: posts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── GET /posts/:id ────────────────────────────────────────────────────────
export const getPost = async (req, res, next) => {
  try {
    const post = await SpacePost.findById(req.params.id).populate(POPULATE_AUTHOR).lean();
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, data: post });
  } catch (err) { next(err); }
};

// ── POST /posts ───────────────────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { type, title, content, aiContent, userTake, images, taggedMedia, topics } = req.body;

    if (!taggedMedia?.tmdbId) {
      return res.status(400).json({ success: false, message: 'taggedMedia is required' });
    }
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }
    if (type === 'directors_chair' && !aiContent) {
      return res.status(400).json({ success: false, message: 'aiContent is required for Director\'s Chair posts' });
    }

    const post = await SpacePost.create({
      type,
      authorId:   req.user._id,
      authorRole: req.user.role === 'admin' ? 'admin' : 'user',
      title:      title.trim(),
      content:    content?.trim(),
      aiContent,
      userTake,
      images:     images || [],
      taggedMedia,
      topics:     topics || [],
    });

    await post.populate(POPULATE_AUTHOR);
    res.status(201).json({ success: true, data: post });
  } catch (err) { next(err); }
};

// ── DELETE /posts/:id ─────────────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await SpacePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const isOwner = post.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    await Promise.all([
      post.deleteOne(),
      SpaceComment.deleteMany({ postId: req.params.id }),
    ]);
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

// ── POST /posts/:id/like ──────────────────────────────────────────────────
export const toggleLikePost = async (req, res, next) => {
  try {
    const post = await SpacePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const uid = req.user._id.toString();
    const liked = post.likes.map(l => l.toString()).includes(uid);

    if (liked) {
      post.likes.pull(req.user._id);
      post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
      post.likes.push(req.user._id);
      post.likeCount += 1;
    }
    await post.save();
    res.json({ success: true, liked: !liked, likeCount: post.likeCount });
  } catch (err) { next(err); }
};

// ── PATCH /posts/:id/pin (admin) ──────────────────────────────────────────
export const togglePinPost = async (req, res, next) => {
  try {
    const post = await SpacePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    post.pinned = !post.pinned;
    await post.save();
    res.json({ success: true, pinned: post.pinned });
  } catch (err) { next(err); }
};

// ── GET /posts/:id/comments ───────────────────────────────────────────────
export const getComments = async (req, res, next) => {
  try {
    const { sort = 'newest', page = 1, limit = 20 } = req.query;
    const postId = req.params.id;

    const sortObj = sort === 'top' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch top-level comments only
    const [comments, total] = await Promise.all([
      SpaceComment.find({ postId, parentCommentId: null })
        .sort(sortObj).skip(skip).limit(Number(limit))
        .populate(POPULATE_AUTHOR).lean(),
      SpaceComment.countDocuments({ postId, parentCommentId: null }),
    ]);

    // For each comment, attach up to 3 preview replies
    const withReplies = await Promise.all(comments.map(async c => {
      const replies = await SpaceComment.find({ postId, parentCommentId: c._id })
        .sort({ createdAt: 1 }).limit(3).populate(POPULATE_AUTHOR).lean();
      return { ...c, replies };
    }));

    res.json({ success: true, data: withReplies, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// ── GET /posts/:id/comments/:cid/replies ──────────────────────────────────
export const getReplies = async (req, res, next) => {
  try {
    const replies = await SpaceComment.find({
      postId: req.params.id,
      parentCommentId: req.params.cid,
    }).sort({ createdAt: 1 }).populate(POPULATE_AUTHOR).lean();
    res.json({ success: true, data: replies });
  } catch (err) { next(err); }
};

// ── POST /posts/:id/comments ──────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { content, parentCommentId } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'content required' });

    const post = await SpacePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await SpaceComment.create({
      postId:          req.params.id,
      authorId:        req.user._id,
      content:         content.trim(),
      parentCommentId: parentCommentId || null,
    });

    // Update counts
    if (parentCommentId) {
      await SpaceComment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
    } else {
      post.commentCount += 1;
      await post.save();
    }

    await comment.populate(POPULATE_AUTHOR);

    // Emit real-time event to everyone viewing this post
    const io = getIO();
    if (io) io.to(`space:${req.params.id}`).emit('new_comment', comment);

    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

// ── POST /posts/:id/comments/:cid/like ───────────────────────────────────
export const toggleLikeComment = async (req, res, next) => {
  try {
    const comment = await SpaceComment.findById(req.params.cid);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const uid = req.user._id.toString();
    const liked = comment.likes.map(l => l.toString()).includes(uid);

    if (liked) {
      comment.likes.pull(req.user._id);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
    } else {
      comment.likes.push(req.user._id);
      comment.likeCount += 1;
    }
    await comment.save();
    res.json({ success: true, liked: !liked, likeCount: comment.likeCount });
  } catch (err) { next(err); }
};

// ── DELETE /posts/:id/comments/:cid ──────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await SpaceComment.findById(req.params.cid);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isOwner = comment.authorId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    await comment.deleteOne();

    // Decrement counts
    if (comment.parentCommentId) {
      await SpaceComment.findByIdAndUpdate(comment.parentCommentId, { $inc: { replyCount: -1 } });
    } else {
      await SpacePost.findByIdAndUpdate(req.params.id, { $inc: { commentCount: -1 } });
    }

    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};
