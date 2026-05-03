import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:   { type: String, required: true, maxlength: 500 },
  likes:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  userId:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId:           { type: Number, required: true, index: true },
  mediaType:         { type: String, enum: ['movie', 'tv'], default: 'movie' },
  title:             { type: String, maxlength: 200 },         // optional headline
  content:           { type: String, required: true, minlength: 20, maxlength: 2000 },
  rating:            { type: Number, min: 1, max: 10 },        // 1-10 star rating
  cinePulseCategory: { type: String, enum: ['drop', 'chill', 'engage', 'masterpiece'] }, // optional
  spoiler:           { type: Boolean, default: false },         // renamed from hasSpoiler for consistency
  likes:             [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount:         { type: Number, default: 0, index: true },
  replies:           [replySchema],
  isRemoved:         { type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ movieId: 1, createdAt: -1 });
reviewSchema.index({ movieId: 1, likeCount: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
