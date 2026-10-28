import mongoose, { Schema, Document, Model } from 'mongoose';

export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface ILeave extends Document {
  employee: mongoose.Types.ObjectId | string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: mongoose.Types.ObjectId | string;
  reviewComments?: string;
  appliedAt: Date;
  reviewedAt?: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    leaveType: {
      type: String,
      enum: ['annual', 'sick', 'casual', 'unpaid'],
      required: [true, 'Leave type is required'],
      default: 'annual',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days count is required'],
      min: [1, 'Leave must be at least 1 day'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for leave is required'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewComments: {
      type: String,
      default: '',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
