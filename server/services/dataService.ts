import User, { IUser, UserRole } from '../models/User.ts';
import Leave, { ILeave } from '../models/Leave.ts';
import Attendance, { IAttendance } from '../models/Attendance.ts';
import Announcement, { IAnnouncement } from '../models/Announcement.ts';
import Training, { ITraining } from '../models/Training.ts';

/**
 * Seeds initial users (1 HR, 1 Manager, 1 Employee) and sample HRMS records
 * into the in-memory MongoDB database on startup.
 */
export const initializeSeedData = async (): Promise<void> => {
  const existingUsersCount = await User.countDocuments();
  if (existingUsersCount > 0) {
    return;
  }

  console.log('🌱 Seeding initial HR, Manager, and Employee accounts into MongoDB...');

  // 1. Seed 1 HR, 1 Manager, 1 Employee
  // Note: UserSchema pre-save hook handles bcrypt password hashing automatically.
  const hrUser = await User.create({
    name: 'Sarah Jenkins',
    email: 'hr@staffsync.io',
    password: 'StaffSync@123',
    role: 'hr' as UserRole,
    department: 'Human Resources',
    designation: 'Head of People Operations',
    phone: '+1 (555) 234-5678',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joiningDate: new Date('2022-01-15'),
    status: 'active',
    leaveBalance: { annual: 18, sick: 10, casual: 7 },
  });

  const managerUser = await User.create({
    name: 'Marcus Chen',
    email: 'manager@staffsync.io',
    password: 'StaffSync@123',
    role: 'manager' as UserRole,
    department: 'Engineering',
    designation: 'VP of Engineering',
    phone: '+1 (555) 345-6789',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joiningDate: new Date('2022-04-10'),
    status: 'active',
    leaveBalance: { annual: 15, sick: 9, casual: 6 },
  });

  const employeeUser = await User.create({
    name: 'Alex Rivera',
    email: 'alex@staffsync.io',
    password: 'StaffSync@123',
    role: 'employee' as UserRole,
    department: 'Engineering',
    designation: 'Senior Full Stack Developer',
    phone: '+1 (555) 456-7890',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joiningDate: new Date('2023-02-01'),
    status: 'active',
    leaveBalance: { annual: 12, sick: 8, casual: 5 },
    managerId: managerUser._id,
  });

  // 2. Seed Announcements
  await Announcement.create([
    {
      title: 'Company All-Hands Meeting & Q4 Roadmap Review',
      content: 'Join us this Thursday at 3:00 PM EST for our quarterly company-wide gathering. We will celebrate team milestones, review Q4 deliverables, and introduce new wellness benefits.',
      priority: 'high',
      category: 'event',
      pinned: true,
      createdBy: hrUser._id,
      targetRoles: ['hr', 'manager', 'employee'],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 2),
    },
    {
      title: 'Updated Remote Work & Expense Reimbursement Policy',
      content: 'Effective next Monday, team members can claim up to $150/quarter for home workstation and internet connectivity stipends through the finance portal.',
      priority: 'normal',
      category: 'policy',
      pinned: false,
      createdBy: hrUser._id,
      targetRoles: ['hr', 'manager', 'employee'],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 5),
    },
    {
      title: 'Annual Health Screening & Flu Shot Camp',
      content: 'On-site health checkups and seasonal vaccinations will be available at Headquarters Medical Room B on November 5th. Sign up via the clinic link.',
      priority: 'urgent',
      category: 'holiday',
      pinned: true,
      createdBy: hrUser._id,
      targetRoles: ['hr', 'manager', 'employee'],
      createdAt: new Date(Date.now() - 24 * 3600 * 1000 * 1),
    },
  ]);

  // 3. Seed Leaves
  const today = new Date();
  await Leave.create([
    {
      employee: employeeUser._id,
      leaveType: 'annual',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      totalDays: 3,
      reason: 'Family reunion and annual personal vacation.',
      status: 'pending',
      appliedAt: new Date(Date.now() - 3600 * 1000 * 12),
    },
    {
      employee: employeeUser._id,
      leaveType: 'sick',
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3),
      totalDays: 2,
      reason: 'Acute viral flu and physician advised rest.',
      status: 'approved',
      appliedAt: new Date(Date.now() - 24 * 3600 * 1000 * 6),
      reviewedBy: managerUser._id,
      reviewedAt: new Date(Date.now() - 24 * 3600 * 1000 * 5),
      reviewComments: 'Approved. Get well soon!',
    },
  ]);

  // 4. Seed Attendance
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  await Attendance.create({
    employee: employeeUser._id,
    date: todayDateOnly,
    checkInTime: new Date(new Date().setHours(9, 5, 0)),
    checkOutTime: null,
    workHours: 0,
    status: 'present',
    workMode: 'remote',
    notes: 'Morning sprint standup',
    ipAddress: '192.168.1.42',
  });

  // 5. Seed Training Program
  await Training.create([
    {
      title: 'Cloud Architecture & Distributed Microservices (2026)',
      description: 'Advanced patterns in Kubernetes, event-driven messaging with Kafka, and zero-downtime deployment strategies.',
      category: 'Engineering',
      instructor: 'Dr. Evelyn Vance (Cloud Architect)',
      startDate: new Date(today.getFullYear(), today.getMonth(), 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      durationHours: 24,
      status: 'in-progress',
      createdBy: managerUser._id,
      participants: [
        {
          employee: employeeUser._id,
          status: 'in-progress',
          progressPercent: 65,
          score: 88,
          enrolledAt: new Date(today.getFullYear(), today.getMonth(), 2),
        },
      ],
    },
    {
      title: 'Executive Leadership & Mentorship for Modern Managers',
      description: 'High-performance team coaching, emotional intelligence, and strategic delegation.',
      category: 'Leadership',
      instructor: 'Sarah Jenkins',
      startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
      endDate: new Date(today.getFullYear(), today.getMonth() + 2, 1),
      durationHours: 12,
      status: 'upcoming',
      createdBy: hrUser._id,
      participants: [
        {
          employee: managerUser._id,
          status: 'enrolled',
          progressPercent: 0,
          enrolledAt: new Date(),
        },
      ],
    },
  ]);

  console.log('✅ Initial HR, Manager, and Employee accounts successfully seeded in MongoDB.');
};

/**
 * DataService operating directly on Mongoose models connected to mongodb-memory-server
 */
export const DataService = {
  // --- USERS ---
  async findUserByEmail(email: string, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) query.select('+password');
    return await query.exec();
  },

  async findUserById(id: string) {
    return await User.findById(id).select('-password').exec();
  },

  async getAllUsers() {
    return await User.find().select('-password').sort({ createdAt: -1 }).exec();
  },

  async createUser(userData: any) {
    const user = new User(userData);
    return await user.save();
  },

  async updateUser(id: string, updates: any) {
    const user = await User.findById(id);
    if (!user) return null;

    Object.assign(user, updates);
    return await user.save();
  },

  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id).exec();
  },

  // --- LEAVES ---
  async getAllLeaves(filters: any = {}) {
    return await Leave.find(filters)
      .populate('employee', 'name email department designation avatar leaveBalance')
      .sort({ createdAt: -1 })
      .exec();
  },

  async createLeave(leaveData: any) {
    const leave = new Leave(leaveData);
    return await leave.save();
  },

  async updateLeaveStatus(id: string, status: 'approved' | 'rejected', reviewerId: string, comments?: string) {
    const leave = await Leave.findById(id);
    if (!leave) return null;

    leave.status = status;
    leave.reviewedBy = reviewerId as any;
    leave.reviewedAt = new Date();
    if (comments) leave.reviewComments = comments;

    // Deduct leave balance if approved
    if (status === 'approved' && leave.leaveType !== 'unpaid') {
      const emp = await User.findById(leave.employee);
      if (emp && emp.leaveBalance) {
        const type = leave.leaveType as 'annual' | 'sick' | 'casual';
        emp.leaveBalance[type] = Math.max(0, (emp.leaveBalance[type] || 0) - leave.totalDays);
        await emp.save();
      }
    }

    return await leave.save();
  },

  // --- ATTENDANCE ---
  async getTodayAttendanceForEmployee(employeeId: string) {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await Attendance.findOne({
      employee: employeeId,
      date: { $gte: start, $lt: end },
    }).exec();
  },

  async checkInEmployee(employeeId: string, workMode: 'office' | 'remote' | 'hybrid' = 'office', notes = '') {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const existing = await this.getTodayAttendanceForEmployee(employeeId);
    if (existing && existing.checkInTime) {
      throw new Error('Employee has already checked in for today');
    }

    const checkInTime = new Date();
    const hours = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    const att = new Attendance({
      employee: employeeId,
      date: start,
      checkInTime,
      status: isLate ? 'late' : 'present',
      workMode,
      notes,
    });

    return await att.save();
  },

  async checkOutEmployee(employeeId: string) {
    const att = await this.getTodayAttendanceForEmployee(employeeId);
    if (!att || !att.checkInTime) {
      throw new Error('No active check-in record found for today');
    }
    if (att.checkOutTime) {
      throw new Error('Employee has already checked out for today');
    }

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - new Date(att.checkInTime).getTime();
    const durationHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

    att.checkOutTime = checkOutTime;
    att.workHours = durationHours;
    return await att.save();
  },

  async getAllAttendance(dateQuery?: string) {
    const filter: any = {};
    if (dateQuery) {
      const parts = dateQuery.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const start = new Date(year, month, day);
        const end = new Date(year, month, day + 1);
        filter.date = { $gte: start, $lt: end };
      }
    }

    return await Attendance.find(filter)
      .populate('employee', 'name email department designation avatar')
      .sort({ date: -1, createdAt: -1 })
      .exec();
  },

  // --- ANNOUNCEMENTS ---
  async getAllAnnouncements() {
    return await Announcement.find()
      .populate('createdBy', 'name email designation avatar')
      .sort({ pinned: -1, createdAt: -1 })
      .exec();
  },

  async createAnnouncement(data: any) {
    const ann = new Announcement(data);
    return await ann.save();
  },

  async deleteAnnouncement(id: string) {
    return await Announcement.findByIdAndDelete(id).exec();
  },

  // --- TRAININGS ---
  async getAllTrainings() {
    return await Training.find()
      .populate('createdBy', 'name email designation')
      .populate('participants.employee', 'name email department designation avatar')
      .sort({ createdAt: -1 })
      .exec();
  },

  async createTraining(data: any) {
    const training = new Training(data);
    return await training.save();
  },

  async assignParticipantsToTraining(trainingId: string, employeeIds: string[]) {
    const trn = await Training.findById(trainingId);
    if (!trn) return null;

    const existingIds = new Set(trn.participants.map((p) => p.employee.toString()));
    employeeIds.forEach((id) => {
      if (!existingIds.has(id)) {
        trn.participants.push({
          employee: id as any,
          status: 'enrolled',
          progressPercent: 0,
          enrolledAt: new Date(),
        });
      }
    });

    return await trn.save();
  },

  async updateParticipantProgress(trainingId: string, employeeId: string, progressPercent: number, score?: number) {
    const trn = await Training.findById(trainingId);
    if (!trn) return null;

    const participant = trn.participants.find(
      (p) => p.employee.toString() === employeeId || (p.employee as any)._id?.toString() === employeeId
    );

    if (participant) {
      const isComplete = progressPercent >= 100;
      participant.progressPercent = progressPercent;
      participant.status = isComplete ? 'completed' : progressPercent > 0 ? 'in-progress' : 'enrolled';
      if (score !== undefined) participant.score = score;
      if (isComplete && !participant.completedAt) participant.completedAt = new Date();
    }

    return await trn.save();
  },
};
