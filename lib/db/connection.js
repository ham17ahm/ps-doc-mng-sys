import mongoose from 'mongoose';
import { env } from '@/lib/config/env';

// Global cached connection — avoids re-connecting on every request in dev
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: env.MONGODB_DB_NAME,
    };

    cached.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((m) => {
        console.log('MongoDB connected');
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
