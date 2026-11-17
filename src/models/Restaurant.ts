import mongoose, { Schema, type Model, type Types } from 'mongoose';
import { uniqueSlug } from '@/lib/slug';

export interface IRestaurant {
    name: string;
    slug: string;
    userId: Types.ObjectId;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    logo?: string;
    logoPublicId?: string;
    isActive: boolean;
    settings: {
        currency: string;
        timezone: string;
        orderNumberPrefix: string;
        autoAcceptOrders: boolean;
        allowTakeout: boolean;
        allowDelivery: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

interface RestaurantModel extends Model<IRestaurant> {
    generateUniqueSlug(name: string): Promise<string>;
}

const RestaurantSchema = new Schema<IRestaurant, RestaurantModel>({
    name: {
        type: String,
        required: [true, 'Restaurant name is required'],
        trim: true,
        maxlength: [100, 'Restaurant name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        required: [true, 'Restaurant slug is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    address: {
        type: String,
        maxlength: [200, 'Address cannot exceed 200 characters']
    },
    phone: {
        type: String,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    logo: {
        type: String
    },
    logoPublicId: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    settings: {
        currency: {
            type: String,
            default: 'MKD',
            enum: ['MKD', 'EUR', 'USD']
        },
        timezone: {
            type: String,
            default: 'Europe/Skopje'
        },
        orderNumberPrefix: {
            type: String,
            default: 'ORD',
            maxlength: [10, 'Order prefix cannot exceed 10 characters']
        },
        autoAcceptOrders: {
            type: Boolean,
            default: false
        },
        allowTakeout: {
            type: Boolean,
            default: true
        },
        allowDelivery: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

RestaurantSchema.index({ userId: 1 });

RestaurantSchema.statics.generateUniqueSlug = function (name: string): Promise<string> {
    return uniqueSlug(name, async (slug) => (await this.exists({ slug })) !== null);
};

export const Restaurant =
    (mongoose.models.Restaurant as RestaurantModel | undefined) ||
    mongoose.model<IRestaurant, RestaurantModel>('Restaurant', RestaurantSchema);
