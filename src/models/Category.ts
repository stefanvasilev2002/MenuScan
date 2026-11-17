import mongoose, { Schema, type Model, type Types } from 'mongoose';

export interface ICategory {
    restaurantId: Types.ObjectId;
    parentId: Types.ObjectId | null;
    name: string;
    description: string;
    order: number;
    icon: string;
    color: string;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        restaurantId: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
            index: true,
        },
        parentId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            default: null,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 50,
        },
        description: {
            type: String,
            default: '',
            maxlength: 200,
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
    },
    {
        timestamps: true,
    },
);

CategorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

export const Category =
    (mongoose.models.Category as Model<ICategory> | undefined) || mongoose.model<ICategory>('Category', CategorySchema);
