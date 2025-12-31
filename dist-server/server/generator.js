"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startGenerator = startGenerator;
const db_1 = __importDefault(require("./db"));
const Traffic_1 = __importDefault(require("./models/Traffic"));
const Alert_1 = __importDefault(require("./models/Alert"));
const roads = [
    { name: 'Ring Road', zone: 'Central' },
    { name: 'NH 24', zone: 'East' },
    { name: 'Outer Ring Road', zone: 'South' },
    { name: 'Minto Road', zone: 'North' },
    { name: 'Mathura Road', zone: 'East' }
];
function congestionLevelFromSpeed(speed) {
    if (speed < 20)
        return 'High';
    if (speed < 40)
        return 'Medium';
    return 'Low';
}
async function runOnce() {
    await (0, db_1.default)();
    const r = roads[Math.floor(Math.random() * roads.length)];
    const avgSpeed = Math.max(5, Math.round(70 * Math.random()));
    const vehicleCount = Math.round(50 + Math.random() * 500);
    const congestionLevel = congestionLevelFromSpeed(avgSpeed);
    const t = await Traffic_1.default.create({ roadName: r.name, zone: r.zone, avgSpeed, vehicleCount, congestionLevel });
    if (congestionLevel === 'High' || (vehicleCount > 400 && avgSpeed < 30)) {
        await Alert_1.default.create({ type: 'Congestion', severity: 'High', roadName: r.name });
    }
    return t;
}
function startGenerator(interval = 5000) {
    setInterval(() => runOnce().catch(console.error), interval);
}
if (require.main === module) {
    startGenerator(5000);
}
