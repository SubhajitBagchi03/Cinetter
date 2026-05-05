import mongoose from 'mongoose';

const spaceCommentSchema = new mongoose.Schema({
  postId:          { type: mongoose.Schema.Types.ObjectId, ref: 'SpacePost', required: true },
  authorId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:         { type: String, required: true, maxlength: 600 },
  likes:           { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  likeCount:       { type: Number, default: 0 },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SpaceComment', default: null },
  replyCount:      { type: Number, default: 0 },
}, { timestamps: true });

spaceCommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 });
spaceCommentSchema.index({ postId: 1, likeCount: -1 });

export default mongoose.model('SpaceComment', spaceCommentSchema);
