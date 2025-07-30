import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { Restaurant } from '@/models/Restaurant';
import { Order } from '@/models/Order';
import { MenuItem } from '@/models/MenuItem';
import { connectToDatabase } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ restaurantSlug: string }> }
) {
    try {
        const { restaurantSlug } = await params;
        
        // Get user from headers (set by middleware)
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Verify restaurant ownership
        const restaurant = await Restaurant.findOne({ 
            slug: restaurantSlug, 
            userId 
        });

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch statistics
        const [
            totalOrders,
            pendingOrders,
            todayOrders,
            popularItems,
            recentOrders
        ] = await Promise.all([
            // Total orders
            Order.countDocuments({ restaurantId: restaurant._id }),
            
            // Pending orders
            Order.countDocuments({ 
                restaurantId: restaurant._id,
                status: { $in: ['pending', 'accepted', 'preparing'] }
            }),
            
            // Today's orders
            Order.find({ 
                restaurantId: restaurant._id,
                createdAt: { $gte: today, $lt: tomorrow }
            }),
            
            // Popular items (aggregation)
            Order.aggregate([
                { $match: { restaurantId: restaurant._id } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.menuItemId',
                        orderCount: { $sum: '$items.quantity' }
                    }
                },
                { $sort: { orderCount: -1 } },
                { $limit: 5 }
            ]),
            
            // Recent orders
            Order.find({ restaurantId: restaurant._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('items.menuItemId', 'name')
        ]);

        // Calculate today's revenue
        const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

        // Calculate average order value
        const averageOrderValue = totalOrders > 0 
            ? (await Order.aggregate([
                { $match: { restaurantId: restaurant._id } },
                { $group: { _id: null, avgTotal: { $avg: '$total' } } }
            ]))[0]?.avgTotal || 0
            : 0;

        // Get popular items with names
        const popularItemsWithNames = await Promise.all(
            popularItems.map(async (item) => {
                const menuItem = await MenuItem.findById(item._id);
                return {
                    name: menuItem?.name || 'Unknown Item',
                    orderCount: item.orderCount
                };
            })
        );

        return NextResponse.json({
            totalOrders,
            pendingOrders,
            todayRevenue,
            averageOrderValue,
            popularItems: popularItemsWithNames,
            recentOrders: recentOrders.map(order => ({
                _id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                customerName: order.customerName,
                createdAt: order.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching restaurant stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 