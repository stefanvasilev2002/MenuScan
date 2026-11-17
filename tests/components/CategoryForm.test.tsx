import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryForm from '@/components/dashboard/menu/CategoryForm';
import type { Category } from '@/types/menu';

vi.mock('@/components/EmojiPicker', () => ({
    EmojiPicker: () => null,
}));

const category = (id: string, name: string, parentId: string | null = null): Category => ({
    _id: id,
    name,
    parentId,
    order: 0,
    isVisible: true,
    icon: '🍽️',
    color: '#3B82F6',
    restaurantId: 'r1',
    createdAt: new Date(),
    updatedAt: new Date(),
});

const ids = {
    drinks: '64b7f9f1c2a4b5d6e7f80001',
    hot: '64b7f9f1c2a4b5d6e7f80002',
    coffee: '64b7f9f1c2a4b5d6e7f80003',
    food: '64b7f9f1c2a4b5d6e7f80004',
};

const categories = [
    category(ids.drinks, 'Drinks'),
    category(ids.hot, 'Hot', ids.drinks),
    category(ids.coffee, 'Coffee', ids.hot),
    category(ids.food, 'Food'),
];

describe('CategoryForm', () => {
    it('shows a validation error and does not submit an empty name', async () => {
        const onSubmit = vi.fn();
        render(<CategoryForm categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Create" />);

        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(screen.getByText('Category name is required')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('submits parsed data including the chosen parent and icon', async () => {
        const onSubmit = vi.fn();
        render(<CategoryForm categories={categories} onSubmit={onSubmit} onCancel={vi.fn()} submitLabel="Create" />);

        await userEvent.type(screen.getByLabelText(/category name/i), '  Cold drinks ');
        await userEvent.selectOptions(screen.getByLabelText(/parent category/i), ids.drinks);
        await userEvent.click(screen.getByRole('button', { name: 'Use 🍷 as icon' }));
        await userEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'Cold drinks', parentId: ids.drinks, icon: '🍷', isVisible: true }),
        );
    });

    it('does not offer the category itself, its descendants or full-depth categories as parents', () => {
        render(
            <CategoryForm
                category={categories[0]}
                categories={categories}
                onSubmit={vi.fn()}
                onCancel={vi.fn()}
                submitLabel="Save"
            />,
        );

        const options = Array.from((screen.getByLabelText(/parent category/i) as HTMLSelectElement).options).map((o) => o.value);
        expect(options).toEqual(['', ids.food]);
    });

    it('excludes categories already at maximum depth when creating', () => {
        render(<CategoryForm categories={categories} onSubmit={vi.fn()} onCancel={vi.fn()} submitLabel="Create" />);
        const options = Array.from((screen.getByLabelText(/parent category/i) as HTMLSelectElement).options).map((o) => o.value);
        expect(options).toEqual(['', ids.drinks, ids.hot, ids.food]);
    });
});
