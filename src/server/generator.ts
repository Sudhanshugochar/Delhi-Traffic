import connect from './db.js';
import Traffic from './models/Traffic.js';
import Alert from './models/Alert.js';

const roads = [
  { name: 'Ring Road', zone: 'Central' },
  { name: 'NH 24', zone: 'East' },
  { name: 'Outer Ring Road', zone: 'South' },
  { name: 'Minto Road', zone: 'North' },
  { name: 'Mathura Road', zone: 'East' }
];

function congestionLevelFromSpeed(speed: number) {
  if (speed < 20) return 'High';
  if (speed < 40) return 'Medium';
  return 'Low';
}

async function runOnce() {
  await connect();
  const r = roads[Math.floor(Math.random() * roads.length)];
  const avgSpeed = Math.max(5, Math.round(70 * Math.random()));
  const vehicleCount = Math.round(50 + Math.random() * 500);
  const congestionLevel = congestionLevelFromSpeed(avgSpeed as number);
  const t = await Traffic.create({ roadName: r.name, zone: r.zone, avgSpeed, vehicleCount, congestionLevel });
  if (congestionLevel === 'High' || (vehicleCount > 400 && avgSpeed < 30)) {
    await Alert.create({ type: 'Congestion', severity: 'High', roadName: r.name });
  }
  return t;
}

export function startGenerator(interval = 5000) {
  setInterval(() => runOnce().catch(console.error), interval);
}

if (require.main === module) {
  startGenerator(5000);
}
