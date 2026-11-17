export const AVAILABILITY_STATUSES = ['available', 'sold_out', 'hidden'] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
    available: 'Available',
    sold_out: 'Sold out',
    hidden: 'Hidden',
};

export function availabilityOf(item: { isAvailable?: boolean; isHidden?: boolean }): AvailabilityStatus {
    if (item.isHidden) {
        return 'hidden';
    }
    return item.isAvailable === false ? 'sold_out' : 'available';
}

export function availabilityPatch(status: AvailabilityStatus): { isAvailable: boolean; isHidden: boolean } {
    switch (status) {
        case 'hidden':
            return { isAvailable: true, isHidden: true };
        case 'sold_out':
            return { isAvailable: false, isHidden: false };
        default:
            return { isAvailable: true, isHidden: false };
    }
}
