import mongoose, { Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
    email: string;
    password: string;
    businessName: string;
    plan: 'free' | 'basic' | 'premium';
    isActive: boolean;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    plan: {
        type: String,
        enum: ['free', 'basic', 'premium'],
        default: 'free'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        console.log('Hashing password for user:', this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password hashed successfully');
        next();
    } catch (error) {
        console.error('Error hashing password:', error);
        next(error as Error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    try {
        console.log('Comparing passwords for user:', this.email);
        console.log('Stored hash:', this.password);
        console.log('Candidate password:', candidatePassword);

        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match:', isMatch);

        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return false;
    }
};

// Check if the model exists before creating a new one
let User: Model<IUser>;

try {
    User = mongoose.model<IUser>('User');
} catch {
    User = mongoose.model<IUser>('User', userSchema);
}

export { User };