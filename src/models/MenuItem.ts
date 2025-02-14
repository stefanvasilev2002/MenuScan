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
    descriptionMK: {
        type: String,
        default: '',
    },
    descriptionEN: {
        type: String,
        default: '',
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
    ingredients: {
        type: [String],
        default: [],
    },
    allergens: {
        type: [String],
        default: [],
    },
    spicyLevel: {
        type: Number,
        min: 0,
        max: 3,
        default: 0,
    },
    isVegetarian: {
        type: Boolean,
        default: false,
    },
    isVegan: {
        type: Boolean,
        default: false,
    },
    order: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);