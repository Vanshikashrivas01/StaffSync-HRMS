import mongoose, { Schema, Document, Model } from 'mongoose';

export type AttendanceStatus = 'present' | 'late' | 'half-day' | 'absent';
export type WorkMode = 'office' | 'remote' | 'hybrid';

export interface IAttendance extends Document {
  employee: mongoose.Types.ObjectId | string;
  date: Date;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  workHours: number;
  status: AttendanceStatus;
  workMode: WorkMode;
  notes?: string;
  ipAddress?: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
      default: Date.now,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    workHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'half-day', 'absent'],
      default: 'present',
    },
    workMode: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office',
    },
    notes: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to avoid duplicate check-ins on the same day for an employee
AttendanceSchema.index({ employee: 1, date: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ||
  mongoose.model<IAttendance>('Attendance', AttendanceSchema);

export default Attendance;
