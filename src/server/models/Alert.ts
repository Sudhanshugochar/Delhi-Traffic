import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  type: { type: String, enum: ['Accident','Congestion','Slowdown'], required: true },
  severity: { type: String, enum: ['Low','Medium','High'], required: true },
  roadName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  acknowledged: { type: Boolean, default: false }
});

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
