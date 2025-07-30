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
    Menu as MenuIcon
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
    { name: 'Dashboard', href: '', icon: LayoutDashboard },
    { name: 'Menu Builder', href: '/menu', icon: Utensils },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function RestaurantDashboardLayout({ children, restaurant }: RestaurantDashboardLayoutProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-md bg-white shadow-md"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{restaurant.name}</h1>
                            <p className="text-sm text-gray-500">Restaurant Dashboard</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const href = `/dashboard/${restaurant.slug}${item.href}`;
                            const isActive = isActiveRoute(item.href);
                            
                            return (
                                <Link
                                    key={item.name}
                                    href={href}
                                    className={`
                                        flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                        ${isActive 
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                                    `}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Mobile overlay */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Content area */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
} 