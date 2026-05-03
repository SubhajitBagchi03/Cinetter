import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  movieId:  { type: Number, required: true, index: true },
  category: { type: String, enum: ['drop', 'chill', 'engage', 'masterpiece'], required: true },
}, { timestamps: true });

// One vote per user per movie
voteSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
