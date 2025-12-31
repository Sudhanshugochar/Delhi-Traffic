"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const router = express_1.default.Router();
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!email || !password || !name)
            return res.status(400).json({ message: 'Missing fields' });
        const existing = await User_1.default.findOne({ email });
        if (existing)
            return res.status(400).json({ message: 'Email already exists' });
        const hash = await bcrypt_1.default.hash(password, 12);
        const user = await User_1.default.create({ name, email, password: hash, role });
        const token = (0, jwt_1.signToken)({ id: user._id, email: user.email, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ message: 'Missing fields' });
        const user = await User_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = (0, jwt_1.signToken)({ id: user._id, email: user.email, role: user.role });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    }
    catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/logout', async (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});
exports.default = router;
