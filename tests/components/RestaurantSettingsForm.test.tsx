import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RestaurantSettingsForm from '@/components/dashboard/RestaurantSettingsForm';
import type { RestaurantData } from '@/types/restaurant';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh }) }));

const restaurant: RestaurantData = {
    _id: 'r1',
    name: 'Kafana',
    slug: 'kafana',
    description: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
    currency: 'MKD',
    createdAt: new Date(0).toISOString(),
};

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('RestaurantSettingsForm', () => {
    it('validates on the client before sending', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        render(<RestaurantSettingsForm restaurant={restaurant} />);

        await userEvent.clear(screen.getByLabelText(/^name/i));
        await userEvent.type(screen.getByLabelText(/phone/i), 'not a phone');
        await userEvent.click(screen.getByRole('button', { name: /save settings/i }));

        expect(screen.getByText('Restaurant name is required')).toBeInTheDocument();
        expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends normalised changes and refreshes the page', async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);
        render(<RestaurantSettingsForm restaurant={restaurant} />);

        await userEvent.type(screen.getByLabelText(/phone/i), '070 123 456');
        await userEvent.selectOptions(screen.getByLabelText(/menu currency/i), 'EUR');
        await userEvent.click(screen.getByLabelText(/menu is online/i));
        await userEvent.click(screen.getByRole('button', { name: /save settings/i }));

        expect(fetchMock).toHaveBeenCalledWith('/api/restaurant/kafana', expect.objectContaining({ method: 'PATCH' }));
        const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
        expect(JSON.parse(String(init.body))).toMatchObject({ phone: '070123456', currency: 'EUR', isActive: false });
        expect(await screen.findByRole('status')).toHaveTextContent('Settings saved');
        expect(refresh).toHaveBeenCalled();
    });

    it('shows server-side errors next to the field', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () =>
                new Response(JSON.stringify({ error: 'Validation failed', details: { email: 'Email already used' } }), { status: 400 }),
            ),
        );
        render(<RestaurantSettingsForm restaurant={restaurant} />);

        await userEvent.click(screen.getByRole('button', { name: /save settings/i }));

        expect(await screen.findAllByText('Email already used')).not.toHaveLength(0);
    });
});
