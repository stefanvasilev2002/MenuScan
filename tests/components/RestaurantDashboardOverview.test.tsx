import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import RestaurantDashboardOverview from '@/components/dashboard/RestaurantDashboardOverview';
import type { MenuCounts } from '@/lib/stats';

const counts: MenuCounts = {
    categories: 5,
    topLevelCategories: 3,
    subcategories: 2,
    hiddenCategories: 1,
    items: 12,
    availableItems: 9,
    soldOutItems: 2,
    hiddenItems: 1,
    itemsWithoutImage: 4,
};

describe('RestaurantDashboardOverview', () => {
    it('shows menu structure and availability counts', () => {
        render(<RestaurantDashboardOverview restaurantSlug="kafana" restaurantName="Kafana" counts={counts} />);

        const structure = screen.getByRole('region', { name: 'Menu structure' });
        expect(within(structure).getByLabelText('Categories: 5')).toBeInTheDocument();
        expect(within(structure).getByText('3 top-level, 2 nested, 1 hidden')).toBeInTheDocument();
        expect(within(structure).getByLabelText('Menu items: 12')).toBeInTheDocument();

        const availability = screen.getByRole('region', { name: 'Item availability' });
        expect(within(availability).getByLabelText('Available: 9')).toBeInTheDocument();
        expect(within(availability).getByLabelText('Sold out: 2')).toBeInTheDocument();
        expect(within(availability).getByLabelText('Hidden: 1')).toBeInTheDocument();
    });

    it('links to the menu builder, QR page and public menu', () => {
        render(<RestaurantDashboardOverview restaurantSlug="kafana" restaurantName="Kafana" counts={counts} />);
        expect(screen.getByRole('link', { name: /edit menu/i })).toHaveAttribute('href', '/dashboard/kafana/menu');
        expect(screen.getByRole('link', { name: /qr code/i })).toHaveAttribute('href', '/dashboard/kafana/qr');
        expect(screen.getByRole('link', { name: /view public menu/i })).toHaveAttribute('href', '/menu/kafana');
    });

    it('shows a getting-started message for an empty menu', () => {
        render(
            <RestaurantDashboardOverview
                restaurantSlug="kafana"
                restaurantName="Kafana"
                counts={{ ...counts, categories: 0, topLevelCategories: 0, subcategories: 0, items: 0 }}
            />,
        );
        expect(screen.getByText('Your menu is empty')).toBeInTheDocument();
        expect(screen.queryByRole('region', { name: 'Menu structure' })).not.toBeInTheDocument();
    });
});
