import { NextResponse } from 'next/server';
import { requireOwnedRestaurant, route } from '@/lib/api';
import { Order } from '@/models/Order';
import { MenuItem } from '@/models/MenuItem';

type Params = { restaurantSlug: string };

export const GET = route<Params>(async (request, { restaurantSlug }) => {
    const { restaurant } = await requireOwnedRestaurant(request, restaurantSlug);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
        totalOrders,
        pendingOrders,
        todayOrders,
        popularItems,
        recentOrders
    ] = await Promise.all([
        Order.countDocuments({ restaurantId: restaurant._id }),
        
        Order.countDocuments({ 
            restaurantId: restaurant._id,
            status: { $in: ['pending', 'accepted', 'preparing'] }
        }),
        
        Order.find({ 
            restaurantId: restaurant._id,
            createdAt: { $gte: today, $lt: tomorrow }
        }),
        
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
        
        Order.find({ restaurantId: restaurant._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('items.menuItemId', 'name')
    ]);

    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);

    const averageOrderValue = totalOrders > 0 
        ? (await Order.aggregate([
            { $match: { restaurantId: restaurant._id } },
            { $group: { _id: null, avgTotal: { $avg: '$total' } } }
        ]))[0]?.avgTotal || 0
        : 0;

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
});
