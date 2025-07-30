'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    TrendingUp, 
    ShoppingCart, 
    Clock, 
    CheckCircle,
    AlertCircle,
    Plus,
    Utensils,
    BarChart3
} from 'lucide-react';

interface RestaurantStats {
    totalOrders: number;
    pendingOrders: number;
    todayRevenue: number;
    averageOrderValue: number;
    popularItems: Array<{
        name: string;
        orderCount: number;
    }>;
    recentOrders: Array<{
        _id: string;
        orderNumber: string;
        status: string;
        total: number;
        customerName?: string;
        createdAt: string;
    }>;
}

interface RestaurantDashboardOverviewProps {
    restaurantSlug: string;
}

export default function RestaurantDashboardOverview({ restaurantSlug }: RestaurantDashboardOverviewProps) {
    const [stats, setStats] = useState<RestaurantStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/restaurant/${restaurantSlug}/stats`);
                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant statistics');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [restaurantSlug]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No data available</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'accepted': return 'text-blue-600 bg-blue-100';
            case 'preparing': return 'text-orange-600 bg-orange-100';
            case 'ready': return 'text-green-600 bg-green-100';
            case 'completed': return 'text-gray-600 bg-gray-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'accepted': return <AlertCircle className="h-4 w-4" />;
            case 'preparing': return <Clock className="h-4 w-4" />;
            case 'ready': return <CheckCircle className="h-4 w-4" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'cancelled': return <AlertCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-600">Monitor your restaurant's performance</p>
                </div>
                <div className="flex space-x-3">
                    <Link
                        href={`/dashboard/${restaurantSlug}/menu/new`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Menu Item
                    </Link>
                    <Link
                        href={`/dashboard/${restaurantSlug}/orders/new`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        New Order
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.todayRevenue.toLocaleString('mk-MK', {
                                    style: 'currency',
                                    currency: 'MKD'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.averageOrderValue.toLocaleString('mk-MK', {
                                    style: 'currency',
                                    currency: 'MKD'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                            <Link
                                href={`/dashboard/${restaurantSlug}/orders`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                View all
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(order.status)}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {order.orderNumber}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {order.customerName || 'Walk-in customer'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">
                                                {order.total.toLocaleString('mk-MK', {
                                                    style: 'currency',
                                                    currency: 'MKD'
                                                })}
                                            </p>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">
                                No recent orders
                            </p>
                        )}
                    </div>
                </div>

                {/* Popular Items */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Popular Items</h2>
                            <Link
                                href={`/dashboard/${restaurantSlug}/menu`}
                                className="text-sm text-blue-600 hover:text-blue-700"
                            >
                                View menu
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.popularItems.length > 0 ? (
                            <div className="space-y-4">
                                {stats.popularItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <Utensils className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {item.orderCount} orders
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-4">
                                No popular items yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 