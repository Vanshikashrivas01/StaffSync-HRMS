export type UserRole = 'hr' | 'manager' | 'employee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  phone?: string;
  avatar?: string;
  joiningDate?: string;
  status: 'active' | 'inactive';
  leaveBalance: {
    annual: number;
    sick: number;
    casual: number;
  };
  managerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LeaveType = 'annual' | 'sick' | 'casual' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Leave {
  _id: string;
  employee: User | string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: string | null;
  reviewComments?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export type AttendanceStatus = 'present' | 'late' | 'half-day' | 'absent';
export type WorkMode = 'office' | 'remote' | 'hybrid';

export interface Attendance {
  _id: string;
  employee: User | string;
  date: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  workHours: number;
  status: AttendanceStatus;
  workMode: WorkMode;
  notes?: string;
  ipAddress?: string;
}

export type AnnouncementPriority = 'urgent' | 'high' | 'normal' | 'low';
export type AnnouncementCategory = 'general' | 'policy' | 'event' | 'holiday';

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  createdBy: {
    _id: string;
    name: string;
    designation: string;
    avatar?: string;
  } | string;
  pinned: boolean;
  targetRoles: string[];
  createdAt: string;
}

export interface TrainingParticipant {
  employee: User | string;
  status: 'enrolled' | 'in-progress' | 'completed';
  progressPercent: number;
  score?: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface Training {
  _id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  startDate: string;
  endDate: string;
  durationHours: number;
  status: 'upcoming' | 'in-progress' | 'completed';
  createdBy: {
    _id: string;
    name: string;
    designation: string;
  } | string;
  participants: TrainingParticipant[];
  createdAt: string;
}
