// models/Menu.ts
import mongoose, { Schema } from 'mongoose';

interface IMenu {
    name: string;
    userId: string;
    isActive: boolean;
    qrCodeUrl?: string;
    theme: string;
    settings: {
        showPrices: boolean;
        showDescriptions: boolean;
        showAllergens: boolean;
        showSpicyLevel: boolean;
        showDietaryInfo: boolean;
    };
    stats: {
        views: number;
        scans: number;
        lastViewed: Date | null;
        lastScanned: Date | null;
    };
}

const MenuSchema = new Schema<IMenu>({
    name: {
        type: String,
        required: [true, 'Menu name is required'],
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    qrCodeUrl: String,
    theme: {
        type: String,
        default: 'default'
    },
    settings: {
        showPrices: { type: Boolean, default: true },
        showDescriptions: { type: Boolean, default: true },
        showAllergens: { type: Boolean, default: true },
        showSpicyLevel: { type: Boolean, default: true },
        showDietaryInfo: { type: Boolean, default: true }
    },
    stats: {
        views: { type: Number, default: 0 },
        scans: { type: Number, default: 0 },
        lastViewed: { type: Date, default: null },
        lastScanned: { type: Date, default: null }
    }
}, {
    timestamps: true
});

export const Menu = mongoose.models.Menu || mongoose.model('Menu', MenuSchema);