import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { connectToDatabase } from '@/lib/db';

export function setupTestDatabase() {
    let server: MongoMemoryServer;

    beforeAll(async () => {
        server = await MongoMemoryServer.create();
        process.env.MONGODB_URI = server.getUri('menuscan-test');
        await connectToDatabase();
        await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
    });

    afterEach(async () => {
        const collections = await mongoose.connection.db!.collections();
        await Promise.all(collections.map((c) => c.deleteMany({})));
    });

    afterAll(async () => {
        await mongoose.disconnect();
        const cache = (globalThis as unknown as { mongooseCache?: { conn: unknown; promise: unknown } }).mongooseCache;
        if (cache) {
            cache.conn = null;
            cache.promise = null;
        }
        await server?.stop();
    });
}
