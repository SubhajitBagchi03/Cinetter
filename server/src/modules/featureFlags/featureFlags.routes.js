import { Router } from 'express';
import mongoose from 'mongoose';

// Feature Flag Model
const flagSchema = new mongoose.Schema({
  name:             { type: String, unique: true, required: true },
  enabled:          { type: Boolean, default: true },
  rolloutPercent:   { type: Number, default: 100 },
  description:      { type: String, default: '' },
}, { timestamps: true });
const FeatureFlag = mongoose.model('FeatureFlag', flagSchema);

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const flags = await FeatureFlag.find();
    res.json({ success: true, data: flags });
  } catch (err) { next(err); }
});

router.patch('/:name', async (req, res, next) => {
  try {
    const flag = await FeatureFlag.findOneAndUpdate(
      { name: req.params.name },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: flag });
  } catch (err) { next(err); }
});

export { FeatureFlag };
export default router;
