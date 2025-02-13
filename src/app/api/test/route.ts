import { connectToDatabase } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Testing database connection...');
        const conn = await connectToDatabase();

        // Test the connection by listing databases
        const admin = conn.connection.db.admin();
        const dbInfo = await admin.listDatabases();

        return NextResponse.json({
            status: 'Connected to MongoDB!',
            databases: dbInfo.databases.map(db => db.name)
        });
    } catch (error) {
        console.error('Database connection error:', error);
        return NextResponse.json({
            error: 'Failed to connect to database',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, {
            status: 500
        });
    }
}