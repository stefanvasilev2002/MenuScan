import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
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
                    <Link href="/dashboard/categories"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                        <span className="mr-2">📑</span>
                        Категории
                    </Link>
                    <Link href="/dashboard/qr"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                        <span className="mr-2">📱</span>
                        QR Код
                    </Link>

                    <Link href="/dashboard/settings"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg">
                        <span className="mr-2">⚙️</span>
                        Подесувања
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 bg-gray-50">
                {children}
            </main>
        </div>
    );
}