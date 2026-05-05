import mongoose from 'mongoose';

const taggedMediaSchema = new mongoose.Schema({
  tmdbId:       { type: Number, required: true },
  title:        { type: String, required: true },
  poster_path:  { type: String, default: null },
  backdrop_path:{ type: String, default: null }, // fallback image when user uploads none
  media_type:   { type: String, enum: ['movie', 'tv'], default: 'movie' },
}, { _id: false });

const spacePostSchema = new mongoose.Schema({
  type:       { type: String, enum: ['normal', 'directors_chair'], required: true },
  authorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorRole: { type: String, enum: ['user', 'admin'], default: 'user' },

  // Content
  title:      { type: String, required: true, maxlength: 200 },
  content:    { type: String, maxlength: 800 },   // normal post body / shown in feed
  aiContent:  { type: String },                   // director's chair AI output, shown only in detail
  userTake:   { type: String, maxlength: 300 },   // user's short prompt that seeded the AI

  // Media
  images:     { type: [String], validate: v => v.length <= 4 },
  taggedMedia:{ type: taggedMediaSchema, default: null },

  // Taxonomy
  topics:     { type: [String], enum: ['Indian', 'International', 'Anime', 'Sports', 'Games'] },

  // Social
  likes:        { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
  likeCount:    { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  pinned:       { type: Boolean, default: false },
}, { timestamps: true });

// Indexes for efficient feed queries
spacePostSchema.index({ createdAt: -1 });
spacePostSchema.index({ likeCount: -1 });
spacePostSchema.index({ topics: 1, createdAt: -1 });
spacePostSchema.index({ pinned: -1, createdAt: -1 });

export default mongoose.model('SpacePost', spacePostSchema);
