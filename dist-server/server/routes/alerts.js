"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Alert_1 = __importDefault(require("../models/Alert"));
const db_1 = __importDefault(require("../db"));
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    await (0, db_1.default)();
    const alerts = await Alert_1.default.find().sort({ timestamp: -1 }).limit(100);
    res.json({ data: alerts });
});
router.post('/', async (req, res) => {
    await (0, db_1.default)();
    const { type, severity, roadName } = req.body;
    if (!type || !severity || !roadName)
        return res.status(400).json({ message: 'Missing fields' });
    // avoid duplicate high-severity alerts for same road within short window
    const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);
    const existing = await Alert_1.default.findOne({ roadName, type, severity, timestamp: { $gt: tenMinutesAgo } });
    if (existing)
        return res.json({ data: existing });
    const a = await Alert_1.default.create({ type, severity, roadName });
    res.json({ data: a });
});
router.patch('/:id', async (req, res) => {
    await (0, db_1.default)();
    const { id } = req.params;
    const updated = await Alert_1.default.findByIdAndUpdate(id, { acknowledged: true }, { new: true });
    res.json({ data: updated });
});
exports.default = router;
