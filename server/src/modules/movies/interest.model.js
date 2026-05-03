import mongoose from 'mongoose';

const interestSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId:     { type: String, required: true },
  movieTitle:  { type: String, required: true },
  releaseDate: { type: Date, default: null },
  mediaType:   { type: String, enum: ['movie', 'tv'], default: 'movie' },
  notified:    { type: Boolean, default: false },
}, { timestamps: true });

interestSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Interest', interestSchema);
