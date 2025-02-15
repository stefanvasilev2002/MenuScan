// app/dashboard/layout.tsx
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { Menu } from '@/models/Menu';
import { connectToDatabase } from '@/lib/db';
import DashboardLayoutUI from '@/components/dashboard/DashboardLayoutUI';

export default async function DashboardLayout({ children }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let menuId = '';

    if (token) {
        const user = await getCurrentUser(token);
        if (user) {
            await connectToDatabase();
            const menu = await Menu.findOne({ userId: user._id });
            if (menu) {
                menuId = menu._id.toString();
            }
        }
    }

    return <DashboardLayoutUI menuId={menuId}>{children}</DashboardLayoutUI>;
}