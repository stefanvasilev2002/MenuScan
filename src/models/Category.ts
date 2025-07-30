import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        default: 0,
    },
    icon: {
        type: String,
        default: '🍽️',
    },
    color: {
        type: String,
        default: '#3B82F6',
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Create a compound index for restaurantId and name to ensure unique names per restaurant
CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);