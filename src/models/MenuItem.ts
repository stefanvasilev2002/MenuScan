import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
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
    isSpicy: {
        type: Boolean,
        default: false,
    },
    isVegetarian: {
        type: Boolean,
        default: false,
    },
    isVegan: {
        type: Boolean,
        default: false,
    },
    preparationTime: {
        type: Number,
        default: 0, // in minutes
    },
    order: {
        type: Number,
        default: 0,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    imagePublicId: {
        type: String,
        default: '',
    }
}, {
    timestamps: true,
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);