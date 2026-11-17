import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicMenuView from '@/components/menu/PublicMenuView';
import type { PublicMenu, PublicMenuItem } from '@/lib/public-menu';

const item = (overrides: Partial<PublicMenuItem> & Pick<PublicMenuItem, '_id' | 'name' | 'categoryId'>): PublicMenuItem => ({
    description: '',
    price: 100,
    imageUrl: '',
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    allergens: [],
    ingredients: [],
    preparationTime: null,
    order: 0,
    ...overrides,
});

const sampleMenu: PublicMenu = {
    restaurant: { name: 'Kafana Ohrid', slug: 'kafana-ohrid', description: 'Lake-side food', currency: 'MKD' },
    categories: [
        { _id: 'drinks', parentId: null, name: 'Drinks', description: '', icon: '🥤', color: '#3B82F6', order: 2 },
        { _id: 'hot', parentId: 'drinks', name: 'Hot drinks', description: '', icon: '☕', color: '#3B82F6', order: 1 },
        { _id: 'food', parentId: null, name: 'Food', description: '', icon: '🍲', color: '#3B82F6', order: 1 },
        { _id: 'empty', parentId: null, name: 'Empty category', description: '', icon: '', color: '#3B82F6', order: 3 },
    ],
    items: [
        item({ _id: 'i1', name: 'Turkish coffee', categoryId: 'hot', price: 80, isAvailable: false }),
        item({ _id: 'i2', name: 'Ohrid trout', categoryId: 'food', price: 500, isVegetarian: false, allergens: ['Fish'] }),
        item({ _id: 'i3', name: 'Shopska salad', categoryId: 'food', price: 180, isVegetarian: true }),
    ],
};

describe('PublicMenuView', () => {
    it('renders top-level categories in order with nested subcategories', () => {
        render(<PublicMenuView menu={sampleMenu} />);

        const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
        expect(headings).toEqual(['🍲Food', '🥤Drinks']);

        const drinks = screen.getByRole('region', { name: 'Drinks' });
        expect(within(drinks).getByRole('heading', { level: 3, name: /Hot drinks/ })).toBeInTheDocument();
        expect(within(drinks).getByRole('article', { name: 'Turkish coffee' })).toBeInTheDocument();
    });

    it('skips categories without any items', () => {
        render(<PublicMenuView menu={sampleMenu} />);
        expect(screen.queryByText('Empty category')).not.toBeInTheDocument();
    });

    it('marks sold out items', () => {
        render(<PublicMenuView menu={sampleMenu} />);
        expect(within(screen.getByRole('article', { name: 'Turkish coffee' })).getByText('Sold out')).toBeInTheDocument();
        expect(within(screen.getByRole('article', { name: 'Ohrid trout' })).queryByText('Sold out')).not.toBeInTheDocument();
    });

    it('switches the displayed currency', async () => {
        render(<PublicMenuView menu={sampleMenu} />);
        const trout = screen.getByRole('article', { name: 'Ohrid trout' });
        expect(within(trout).getByText('500 ден.')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: 'EUR' }));
        expect(within(trout).getByText('€8.00')).toBeInTheDocument();
    });

    it('filters dishes by search text and hides empty categories', async () => {
        render(<PublicMenuView menu={sampleMenu} />);

        await userEvent.type(screen.getByRole('searchbox'), 'trout');

        expect(screen.getByRole('article', { name: 'Ohrid trout' })).toBeInTheDocument();
        expect(screen.queryByRole('article', { name: 'Shopska salad' })).not.toBeInTheDocument();
        expect(screen.queryByRole('heading', { name: /Drinks/ })).not.toBeInTheDocument();
        expect(screen.getByText('1 dish found')).toBeInTheDocument();
    });

    it('shows an empty state and clears filters', async () => {
        render(<PublicMenuView menu={sampleMenu} />);

        await userEvent.type(screen.getByRole('searchbox'), 'pizza');
        expect(screen.getByText('No dishes match your search.')).toBeInTheDocument();

        await userEvent.click(screen.getByRole('button', { name: /clear filters/i }));
        expect(screen.getAllByRole('article')).toHaveLength(3);
    });

    it('filters by category including subcategories and by dietary toggles', async () => {
        render(<PublicMenuView menu={sampleMenu} />);
        await userEvent.click(screen.getByRole('button', { name: /filters/i }));

        await userEvent.selectOptions(screen.getByLabelText('Category'), 'drinks');
        expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(['Turkish coffee']);

        await userEvent.selectOptions(screen.getByLabelText('Category'), '');
        await userEvent.click(screen.getByRole('button', { name: /vegetarian/i }));
        expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(['Shopska salad']);
    });

    it('can hide sold out dishes', async () => {
        render(<PublicMenuView menu={sampleMenu} />);
        await userEvent.click(screen.getByRole('button', { name: /filters/i }));
        await userEvent.click(screen.getByRole('button', { name: 'Hide sold out' }));
        expect(screen.queryByRole('article', { name: 'Turkish coffee' })).not.toBeInTheDocument();
    });

    it('switches labels to Macedonian', async () => {
        render(<PublicMenuView menu={sampleMenu} />);
        await userEvent.click(screen.getByRole('button', { name: /switch to macedonian/i }));
        expect(screen.getByText('Распродадено')).toBeInTheDocument();
    });
});
