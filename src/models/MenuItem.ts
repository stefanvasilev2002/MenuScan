import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    nameMK: {
        type: String,
        required: true,
    },
    nameEN: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);