import mongoose, { Schema, Document, Model } from 'mongoose';

export type AnnouncementPriority = 'urgent' | 'high' | 'normal' | 'low';
export type AnnouncementCategory = 'general' | 'policy' | 'event' | 'holiday';

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  createdBy: mongoose.Types.ObjectId | string;
  pinned: boolean;
  targetRoles: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    content: {
      type: String,
      required: [true, 'Announcement content is required'],
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'normal', 'low'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['general', 'policy', 'event', 'holiday'],
      default: 'general',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    targetRoles: {
      type: [String],
      default: ['hr', 'manager', 'employee'],
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement: Model<IAnnouncement> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);

export default Announcement;
