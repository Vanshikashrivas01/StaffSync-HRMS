import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'hr' | 'manager' | 'employee';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  designation: string;
  phone?: string;
  avatar?: string;
  joiningDate: Date;
  status: 'active' | 'inactive';
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
  managerId?: mongoose.Types.ObjectId | string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide full employee name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in standard queries
    },
    role: {
      type: String,
      enum: ['hr', 'manager', 'employee'],
      default: 'employee',
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      default: 'Engineering',
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      default: 'Associate',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    leaveBalance: {
      annual: { type: Number, default: 15 },
      sick: { type: Number, default: 10 },
      casual: { type: Number, default: 7 },
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
