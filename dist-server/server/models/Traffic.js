"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TrafficSchema = new mongoose_1.default.Schema({
    roadName: { type: String, required: true },
    zone: { type: String, enum: ['North', 'South', 'East', 'West', 'Central'], required: true },
    avgSpeed: { type: Number, required: true },
    vehicleCount: { type: Number, required: true },
    congestionLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    timestamp: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.models.Traffic || mongoose_1.default.model('Traffic', TrafficSchema);
