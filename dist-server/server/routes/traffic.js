"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const Traffic_1 = __importDefault(require("../models/Traffic"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
router.get('/live', async (req, res) => {
    await (0, db_1.default)();
    const latest = await Traffic_1.default.find().sort({ timestamp: -1 }).limit(50);
    res.json({ data: latest });
});
router.post('/add', async (req, res) => {
    await (0, db_1.default)();
    await (0, express_validator_1.body)('roadName').isString().run(req);
    await (0, express_validator_1.body)('zone').isIn(['North', 'South', 'East', 'West', 'Central']).run(req);
    await (0, express_validator_1.body)('avgSpeed').isNumeric().run(req);
    await (0, express_validator_1.body)('vehicleCount').isInt().run(req);
    await (0, express_validator_1.body)('congestionLevel').isIn(['Low', 'Medium', 'High']).run(req);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });
    const { roadName, zone, avgSpeed, vehicleCount, congestionLevel } = req.body;
    const t = await Traffic_1.default.create({ roadName, zone, avgSpeed, vehicleCount, congestionLevel });
    res.json({ data: t });
});
router.get('/analytics', async (req, res) => {
    await (0, db_1.default)();
    const stats = await Traffic_1.default.aggregate([
        { $group: { _id: '$zone', avgSpeed: { $avg: '$avgSpeed' }, totalVehicles: { $sum: '$vehicleCount' } } }
    ]);
    res.json({ data: stats });
});
exports.default = router;
