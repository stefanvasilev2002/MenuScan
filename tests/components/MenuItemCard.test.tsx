import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuItemCard from '@/components/dashboard/menu/MenuItemCard';
import type { MenuItem } from '@/types/menu';

const baseItem: MenuItem = {
    _id: 'i1',
    name: 'Burek',
    description: 'With cheese',
    price: 120,
    categoryId: 'c1',
    isAvailable: true,
    isHidden: false,
    order: 1,
    restaurantId: 'r1',
    createdAt: new Date(),
    updatedAt: new Date(),
};

function renderCard(item: Partial<MenuItem> = {}) {
    const onAvailabilityChange = vi.fn();
    render(
        <MenuItemCard
            item={{ ...baseItem, ...item }}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
            onAvailabilityChange={onAvailabilityChange}
        />,
    );
    return { onAvailabilityChange };
}

describe('MenuItemCard availability control', () => {
    it('shows the current status as the checked option', () => {
        renderCard({ isAvailable: false });
        expect(screen.getByRole('radio', { name: 'Sold out' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByText('Sold out', { selector: 'div' })).toBeInTheDocument();
    });

    it('labels hidden items', () => {
        renderCard({ isHidden: true });
        expect(screen.getByRole('radio', { name: 'Hidden' })).toHaveAttribute('aria-checked', 'true');
        expect(screen.getByText('Hidden from menu')).toBeInTheDocument();
    });

    it('reports a new status and ignores clicks on the current one', async () => {
        const { onAvailabilityChange } = renderCard();

        await userEvent.click(screen.getByRole('radio', { name: 'Available' }));
        expect(onAvailabilityChange).not.toHaveBeenCalled();

        await userEvent.click(screen.getByRole('radio', { name: 'Hidden' }));
        expect(onAvailabilityChange).toHaveBeenCalledWith('hidden');
    });
});
