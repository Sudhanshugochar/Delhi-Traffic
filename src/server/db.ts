import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGODB_URI || process.env.NEXT_PUBLIC_MONGODB_URI;

if (!MONGO_URI) {
  throw new Error('MONGODB_URI is not set in environment');
}

let cached: any = (globalThis as any).__mongoose;

if (!cached) {
  (globalThis as any).__mongoose = cached = { conn: null, promise: null };
}

export async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connect;
