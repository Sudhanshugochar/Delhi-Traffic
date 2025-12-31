import mongoose from 'mongoose';

const TrafficSchema = new mongoose.Schema({
  roadName: { type: String, required: true },
  zone: { type: String, enum: ['North','South','East','West','Central'], required: true },
  avgSpeed: { type: Number, required: true },
  vehicleCount: { type: Number, required: true },
  congestionLevel: { type: String, enum: ['Low','Medium','High'], required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Traffic || mongoose.model('Traffic', TrafficSchema);
