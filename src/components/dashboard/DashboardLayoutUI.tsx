'use client';
import { useRouter } from "next/navigation";
import Link from 'next/link';
import React from "react";

export default function DashboardLayoutUI({ menuId, children }) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                router.push('/login');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-100 p-6">
                <div className="mb-8">
                    <h1 className="text-xl font-bold">Menu App</h1>
                </div>

                <nav className="space-y-2">
                    <Link href="/dashboard"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                        <span className="mr-2">📋</span>
                        Мени
                    </Link>
                    <Link
                        href={menuId ? `/dashboard/categories?menuId=${menuId}` : '/dashboard'}
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                        <span className="mr-2">📑</span>
                        Категории
                    </Link>

                    <Link href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                        <span className="mr-2">⚙️</span>
                        Подесувања
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg mt-8"
                    >
                        <span className="mr-2">🚪</span>
                        Одјави се
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    );
}