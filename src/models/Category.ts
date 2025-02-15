import mongoose from 'mongoose';
const CategorySchema = new mongoose.Schema({
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Menu',
        required: true,
    },
    nameMK: {
        type: String,
        required: true,
    },
    nameEN: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    icon: {
        type: String,
        default: null,
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
    strictPopulate: false,
});

CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId',
});

CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);