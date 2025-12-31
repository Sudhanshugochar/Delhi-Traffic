import express from 'express';
import { body, validationResult } from 'express-validator';
import Traffic from '../models/Traffic';
import connect from '../db';

const router = express.Router();

router.get('/live', async (req, res) => {
  await connect();
  const latest = await Traffic.find().sort({ timestamp: -1 }).limit(50);
  res.json({ data: latest });
});

router.post('/add', async (req, res) => {
  await connect();
  await body('roadName').isString().run(req);
  await body('zone').isIn(['North','South','East','West','Central']).run(req);
  await body('avgSpeed').isNumeric().run(req);
  await body('vehicleCount').isInt().run(req);
  await body('congestionLevel').isIn(['Low','Medium','High']).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const { roadName, zone, avgSpeed, vehicleCount, congestionLevel } = req.body;
  const t = await Traffic.create({ roadName, zone, avgSpeed, vehicleCount, congestionLevel });
  res.json({ data: t });
});

router.get('/analytics', async (req, res) => {
  await connect();
  const stats = await Traffic.aggregate([
    { $group: { _id: '$zone', avgSpeed: { $avg: '$avgSpeed' }, totalVehicles: { $sum: '$vehicleCount' } } }
  ]);
  res.json({ data: stats });
});

export default router;
