import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
    try {
        if (cached.conn) {
            console.log('Using cached connection');
            return cached.conn;
        }

        if (!cached.promise) {
            const opts = {
                bufferCommands: false,
            };

            console.log('Connecting to MongoDB...');
            cached.promise = mongoose.connect(MONGODB_URI, opts);
        }

        cached.conn = await cached.promise;
        console.log('Connected to MongoDB!');
        return cached.conn;
    } catch (e) {
        console.error('MongoDB connection error:', e);
        cached.promise = null;
        throw e;
    }
}