"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const requireAuth = (req, res, next) => {
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Unauthorized' });
    const payload = (0, jwt_1.verifyToken)(token);
    if (!payload)
        return res.status(401).json({ message: 'Invalid token' });
    req.user = payload;
    next();
};
exports.requireAuth = requireAuth;
