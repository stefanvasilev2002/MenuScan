// components/dashboard/MainDashboard.tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
    totalMenus: number;
    totalActiveMenus: number;
    totalViews: number;
    totalScans: number;
    recentActivity: {
        date: string;
        views: number;
        scans: number;
    }[];
    topMenus: {
        _id: string;
        name: string;
        views: number;
        scans: number;
    }[];
}

export function MainDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/dashboard/stats');
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard statistics');
            }
            const data = await response.json();
            setStats(data);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to fetch dashboard statistics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
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
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total Menus</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalMenus}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {stats.totalActiveMenus} active
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total Views</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Total QR Scans</h3>
                    <p className="text-3xl font-bold mt-2">{stats.totalScans}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm">Conversion Rate</h3>
                    <p className="text-3xl font-bold mt-2">
                        {stats.totalScans > 0
                            ? Math.round((stats.totalViews / stats.totalScans) * 100)
                            : 0}%
                    </p>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.recentActivity}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="views" fill="#3B82F6" name="Views" />
                            <Bar dataKey="scans" fill="#10B981" name="Scans" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Performing Menus */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Top Performing Menus</h2>
                </div>
                <div className="p-6">
                    {stats.topMenus.length > 0 ? (
                        <div className="space-y-4">
                            {stats.topMenus.map((menu) => (
                                <div
                                    key={menu._id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg"
                                >
                                    <Link
                                        href={`/dashboard/menus/${menu._id}/items`}
                                        className="font-semibold hover:text-blue-500"
                                    >
                                        {menu.name}
                                    </Link>
                                    <div className="flex space-x-6">
                                        <div className="text-sm">
                                            <span className="text-gray-500">Views:</span>{' '}
                                            <span className="font-medium">{menu.views}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="text-gray-500">Scans:</span>{' '}
                                            <span className="font-medium">{menu.scans}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">
                            No menu data available yet
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}