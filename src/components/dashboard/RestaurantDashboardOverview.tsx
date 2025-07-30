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
    BarChart3,
    DollarSign,
    Users,
    QrCode,
    Sparkles,
    ArrowRight,
    Calendar,
    Star
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
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Dashboard</h3>
                    <p className="text-gray-600">Fetching your restaurant statistics...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-semibold text-red-800 mb-1">Error Loading Dashboard</h3>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <BarChart3 className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-lg text-gray-600 mb-8">
                    Start by creating menu items and accepting orders to see your statistics.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href={`/dashboard/${restaurantSlug}/menu`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Utensils className="w-5 h-5 mr-2" />
                        Create Menu
                    </Link>
                    <Link
                        href={`/dashboard/${restaurantSlug}/qr`}
                        className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                        <QrCode className="w-5 h-5 mr-2" />
                        Generate QR Codes
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-yellow-700 bg-yellow-100 border border-yellow-200';
            case 'accepted': return 'text-blue-700 bg-blue-100 border border-blue-200';
            case 'preparing': return 'text-orange-700 bg-orange-100 border border-orange-200';
            case 'ready': return 'text-green-700 bg-green-100 border border-green-200';
            case 'completed': return 'text-gray-700 bg-gray-100 border border-gray-200';
            case 'cancelled': return 'text-red-700 bg-red-100 border border-red-200';
            default: return 'text-gray-700 bg-gray-100 border border-gray-200';
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
                    <p className="text-lg text-gray-600">Monitor your restaurant's performance and track key metrics</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={`/dashboard/${restaurantSlug}/menu`}
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Menu Item
                    </Link>
                    <Link
                        href={`/dashboard/${restaurantSlug}/orders`}
                        className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        View Orders
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Today's Revenue</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {stats.todayRevenue.toLocaleString('mk-MK', {
                                style: 'currency',
                                currency: 'MKD'
                            })}
                        </p>
                        <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-white" />
                        </div>
                        <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                        <p className="text-xs text-blue-600 mt-1">+5 new today</p>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                        <p className="text-xs text-yellow-600 mt-1">Requires attention</p>
                    </div>
                </div>

                <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <Star className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
                        <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                            {stats.averageOrderValue.toLocaleString('mk-MK', {
                                style: 'currency',
                                currency: 'MKD'
                            })}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">+8% this week</p>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                            </div>
                            <Link
                                href={`/dashboard/${restaurantSlug}/orders`}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                View all
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentOrders.map((order) => (
                                    <div
                                        key={order._id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                {getStatusIcon(order.status)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {order.orderNumber}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">
                                                {order.total.toLocaleString('mk-MK', {
                                                    style: 'currency',
                                                    currency: 'MKD'
                                                })}
                                            </p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                                <p className="text-gray-500 mb-6">Start accepting orders to see them here</p>
                                <Link
                                    href={`/dashboard/${restaurantSlug}/orders`}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Order
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Popular Items */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                    <Star className="w-4 h-4 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Popular Items</h2>
                            </div>
                            <Link
                                href={`/dashboard/${restaurantSlug}/menu`}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                View menu
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        {stats.popularItems.length > 0 ? (
                            <div className="space-y-4">
                                {stats.popularItems.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                                                <Utensils className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {item.orderCount} orders
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star 
                                                        key={i} 
                                                        className={`w-4 h-4 ${i < Math.min(5, Math.floor(item.orderCount / 2)) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Utensils className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No popular items yet</h3>
                                <p className="text-gray-500 mb-6">Add menu items and start receiving orders</p>
                                <Link
                                    href={`/dashboard/${restaurantSlug}/menu`}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Menu Item
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 