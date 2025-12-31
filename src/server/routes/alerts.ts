import express from 'express';
import Alert from '../models/Alert';
import connect from '../db';

const router = express.Router();

router.get('/', async (req, res) => {
  await connect();
  const alerts = await Alert.find().sort({ timestamp: -1 }).limit(100);
  res.json({ data: alerts });
});

router.post('/', async (req, res) => {
  await connect();
  const { type, severity, roadName } = req.body;
  if (!type || !severity || !roadName) return res.status(400).json({ message: 'Missing fields' });
  // avoid duplicate high-severity alerts for same road within short window
  const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);
  const existing = await Alert.findOne({ roadName, type, severity, timestamp: { $gt: tenMinutesAgo } });
  if (existing) return res.json({ data: existing });
  const a = await Alert.create({ type, severity, roadName });
  res.json({ data: a });
});

router.patch('/:id', async (req, res) => {
  await connect();
  const { id } = req.params;
  const updated = await Alert.findByIdAndUpdate(id, { acknowledged: true }, { new: true });
  res.json({ data: updated });
});

export default router;
