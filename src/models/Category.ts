import mongoose, { Schema } from 'mongoose';

interface ICategory {
    nameMK: string;
    nameEN: string;
    slug: string;
    order: number;
    parentId?: string;
    icon?: string;
    color?: string;
    isVisible: boolean;
    children?: ICategory[];
}

const CategorySchema = new Schema<ICategory>({
    nameMK: {
        type: String,
        required: [true, 'NameMK is required'],
    },
    nameEN: {
        type: String,
        required: [true, 'NameEN is required'],
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
    },
    order: {
        type: Number,
        default: 0,
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    icon: {
        type: String,
        default: null,
    },
    color: {
        type: String,
        default: '#3B82F6', // Default blue color
    },
    isVisible: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for children
CategorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentId'
});

export const Category = mongoose.models.Category as mongoose.Model<ICategory> || mongoose.model<ICategory>('Category', CategorySchema);