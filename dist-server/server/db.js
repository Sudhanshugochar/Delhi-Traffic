"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;
if (!MONGO_URI) {
    throw new Error('MONGODB_URI is not set in environment');
}
let cached = globalThis.__mongoose;
if (!cached) {
    globalThis.__mongoose = cached = { conn: null, promise: null };
}
async function connect() {
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        cached.promise = mongoose_1.default.connect(MONGO_URI).then((mongoose) => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}
exports.default = connect;
