import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  description:  { type: String, maxlength: 500, default: '' },
  movies:       [{ type: Number }],
  authorId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  isPublic:     { type: Boolean, default: true },
  likes:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  likeCount:    { type: Number, default: 0 },
  savedBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

collectionSchema.index({ isPublic: 1, likeCount: -1 });

const Collection = mongoose.model('Collection', collectionSchema);
export default Collection;
