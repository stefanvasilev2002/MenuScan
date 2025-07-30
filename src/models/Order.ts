import mongoose, { Schema } from 'mongoose';

export interface IOrderItem {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
    modifications?: string[];
}

export interface IOrder extends mongoose.Document {
    orderNumber: string;
    restaurantId: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    orderType: 'dine-in' | 'takeout' | 'delivery';
    tableNumber?: number;
    deliveryAddress?: string;
    notes?: string;
    estimatedReadyTime?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
    menuItemId: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    notes: {
        type: String,
        maxlength: [200, 'Item notes cannot exceed 200 characters']
    },
    modifications: [{
        type: String,
        maxlength: [100, 'Modification cannot exceed 100 characters']
    }]
});

const OrderSchema = new Schema<IOrder>({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    customerName: {
        type: String,
        maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    customerPhone: {
        type: String,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    customerEmail: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    items: [OrderItemSchema],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderType: {
        type: String,
        enum: ['dine-in', 'takeout', 'delivery'],
        required: true
    },
    tableNumber: {
        type: Number,
        min: 1
    },
    deliveryAddress: {
        type: String,
        maxlength: [200, 'Delivery address cannot exceed 200 characters']
    },
    notes: {
        type: String,
        maxlength: [500, 'Order notes cannot exceed 500 characters']
    },
    estimatedReadyTime: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ restaurantId: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function(next) {
    if (this.isModified('items')) {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        // For now, tax is 0% - can be made configurable per restaurant
        this.tax = 0;
        this.total = this.subtotal + this.tax;
    }
    
    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    next();
});

// Static method to generate order number
OrderSchema.statics.generateOrderNumber = async function(restaurantId: string, prefix: string = 'ORD'): Promise<string> {
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0');
    
    // Find the highest order number for today
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const lastOrder = await this.findOne({
        restaurantId,
        createdAt: { $gte: todayStart, $lt: todayEnd }
    }).sort({ orderNumber: -1 });
    
    let sequence = 1;
    if (lastOrder) {
        const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop() || '0');
        sequence = lastSequence + 1;
    }
    
    return `${prefix}-${dateStr}-${sequence.toString().padStart(3, '0')}`;
};

// Instance method to update status
OrderSchema.methods.updateStatus = async function(newStatus: IOrder['status']) {
    this.status = newStatus;
    
    if (newStatus === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    if (newStatus === 'accepted' && !this.estimatedReadyTime) {
        // Set estimated ready time to 20 minutes from now
        this.estimatedReadyTime = new Date(Date.now() + 20 * 60 * 1000);
    }
    
    return this.save();
};

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema); 