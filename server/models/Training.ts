import mongoose, { Schema, Document, Model } from 'mongoose';

export type TrainingStatus = 'upcoming' | 'in-progress' | 'completed';
export type EnrollmentStatus = 'enrolled' | 'in-progress' | 'completed';

export interface ITrainingParticipant {
  employee: mongoose.Types.ObjectId | string;
  status: EnrollmentStatus;
  progressPercent: number;
  score?: number;
  enrolledAt: Date;
  completedAt?: Date;
}

export interface ITraining extends Document {
  title: string;
  description: string;
  category: string;
  instructor: string;
  startDate: Date;
  endDate: Date;
  durationHours: number;
  status: TrainingStatus;
  createdBy: mongoose.Types.ObjectId | string;
  participants: ITrainingParticipant[];
  createdAt: Date;
  updatedAt: Date;
}

const TrainingParticipantSchema = new Schema<ITrainingParticipant>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'in-progress', 'completed'],
      default: 'enrolled',
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    score: {
      type: Number,
      default: null,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const TrainingSchema = new Schema<ITraining>(
  {
    title: {
      type: String,
      required: [true, 'Training title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Training description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Technical',
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      default: 'StaffSync Learning Hub',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    durationHours: {
      type: Number,
      required: [true, 'Duration in hours is required'],
      default: 10,
    },
    status: {
      type: String,
      enum: ['upcoming', 'in-progress', 'completed'],
      default: 'upcoming',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [TrainingParticipantSchema],
  },
  {
    timestamps: true,
  }
);

export const Training: Model<ITraining> =
  mongoose.models.Training ||
  mongoose.model<ITraining>('Training', TrainingSchema);

export default Training;
