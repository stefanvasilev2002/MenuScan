'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Utensils,
    ShoppingCart,
    BarChart3,
    Settings,
    LogOut,
    Plus,
    Menu as MenuIcon,
    Building2,
    QrCode,
    Users,
    Bell,
    Search,
    ChevronDown,
    Home,
    ArrowLeft
} from 'lucide-react';

interface RestaurantData {
    _id: string;
    name: string;
    slug: string;
    userId: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    isActive: boolean;
    settings: {
        currency: string;
        timezone: string;
        orderNumberPrefix: string;
        autoAcceptOrders: boolean;
        takeoutEnabled: boolean;
        deliveryEnabled: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

interface RestaurantDashboardLayoutProps {
    children: React.ReactNode;
    restaurant: RestaurantData;
}

const navigation = [
    { name: 'Overview', href: '', icon: LayoutDashboard },
    { name: 'Menu Builder', href: '/menu', icon: Utensils },
    { name: 'QR Codes', href: '/qr', icon: QrCode },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Team', href: '/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RestaurantDashboardLayout({ children, restaurant }: RestaurantDashboardLayoutProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            });

            if (response.ok) {
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const isActiveRoute = (href: string) => {
        if (href === '') {
            return pathname === `/dashboard/${restaurant.slug}`;
        }
        return pathname.includes(`/dashboard/${restaurant.slug}${href}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 lg:flex">
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg bg-white shadow-md border"
                >
                    <MenuIcon className="h-5 w-5 text-gray-700" />
                </button>
            </div>

            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:translate-x-0 lg:z-auto
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-lg font-semibold text-gray-900 truncate">{restaurant.name}</h1>
                                <p className="text-xs text-gray-500">Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                restaurant.isActive
                                    ? 'text-green-700 bg-green-100'
                                    : 'text-gray-600 bg-gray-100'
                            }`}>
                                {restaurant.isActive ? '● Active' : '○ Inactive'}
                            </span>
                            <Link
                                href="/dashboard"
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ArrowLeft className="w-3 h-3 inline mr-1" />
                                All
                            </Link>
                        </div>
                    </div>

                    <nav className="flex-1 px-3 py-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const href = `/dashboard/${restaurant.slug}${item.href}`;
                            const isActive = isActiveRoute(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className={`
                                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                                        ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-3 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                            <span className="truncate">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="lg:flex-1">
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className="bg-white border-b sticky top-0 z-20">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-xl font-semibold text-gray-900 hidden sm:block">
                                {navigation.find(item => isActiveRoute(item.href))?.name || 'Dashboard'}
                            </h2>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </div>

                            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                                <Bell className="h-5 w-5" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-1 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-semibold">
                                            {restaurant.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{restaurant.name}</p>
                                            <p className="text-xs text-gray-500">Restaurant Owner</p>
                                        </div>
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <Home className="w-4 h-4 inline mr-2" />
                                            All Restaurants
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="w-4 h-4 inline mr-2" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}