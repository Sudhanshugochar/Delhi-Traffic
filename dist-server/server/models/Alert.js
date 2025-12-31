"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AlertSchema = new mongoose_1.default.Schema({
    type: { type: String, enum: ['Accident', 'Congestion', 'Slowdown'], required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    roadName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false }
});
exports.default = mongoose_1.default.models.Alert || mongoose_1.default.model('Alert', AlertSchema);
