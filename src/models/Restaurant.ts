import mongoose, { Schema } from 'mongoose';

export interface IRestaurant extends mongoose.Document {
    name: string;
    slug: string;
    userId: string;
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

const RestaurantSchema = new Schema<IRestaurant>({
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

// Create index on userId for faster queries
RestaurantSchema.index({ userId: 1 });

// Pre-save middleware to ensure slug uniqueness
RestaurantSchema.pre('save', async function(next) {
    if (this.isModified('slug')) {
        const existingRestaurant = await mongoose.model('Restaurant').findOne({
            slug: this.slug,
            _id: { $ne: this._id }
        });
        
        if (existingRestaurant) {
            const error = new Error('Restaurant with this slug already exists');
            return next(error);
        }
    }
    next();
});

// Static method to generate unique slug
RestaurantSchema.statics.generateUniqueSlug = async function(name: string, userId: string): Promise<string> {
    let baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
        const existingRestaurant = await this.findOne({ slug, userId });
        if (!existingRestaurant) {
            break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return slug;
};

export const Restaurant = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema); 