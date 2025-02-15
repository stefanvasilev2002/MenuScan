import React from 'react';
import Link from 'next/link';
import { connectToDatabase } from '@/lib/db';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/menu';

async function getMenu(userId: string) {
    await connectToDatabase();
    return await Menu.findOne({ userId });
}

export default async function DashboardLayout({
                                                  children,
                                              }: {
    children: React.ReactNode
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let menuId = '';

    if (token) {
        const user = await getCurrentUser(token);
        if (user) {
            const menu = await getMenu(user._id);
            if (menu) {
                menuId = menu._id.toString();
            }
        }
    }

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
                    <Link
                        href={menuId ? `/dashboard/menu/${menuId}/qr` : '/dashboard'}
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