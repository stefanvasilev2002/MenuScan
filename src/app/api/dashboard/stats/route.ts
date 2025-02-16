// app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Menu } from '@/models/Menu';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const user = await getCurrentUser(token);
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        await connectToDatabase();

        // Get all menus for the user
        const menus = await Menu.find({ userId: user._id });

        // Calculate total stats
        const totalMenus = menus.length;
        const totalActiveMenus = menus.filter(menu => menu.isActive).length;
        const totalViews = menus.reduce((sum, menu) => sum + (menu.stats.views || 0), 0);
        const totalScans = menus.reduce((sum, menu) => sum + (menu.stats.scans || 0), 0);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await Menu.aggregate([
            {
                $match: {
                    userId: user._id,
                    'stats.lastViewed': { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$stats.lastViewed' } },
                    views: { $sum: '$stats.views' },
                    scans: { $sum: '$stats.scans' }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    views: 1,
                    scans: 1
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Get top performing menus
        const topMenus = await Menu.aggregate([
            {
                $match: { userId: user._id }
            },
            {
                $project: {
                    name: 1,
                    totalInteractions: { $add: ['$stats.views', '$stats.scans'] },
                    views: '$stats.views',
                    scans: '$stats.scans'
                }
            },
            { $sort: { totalInteractions: -1 } },
            { $limit: 5 }
        ]);

        return NextResponse.json({
            totalMenus,
            totalActiveMenus,
            totalViews,
            totalScans,
            recentActivity,
            topMenus
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}