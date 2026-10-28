import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { DataService } from '../services/dataService.ts';
import { generateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { UserRole } from '../models/User.ts';

/**
 * @desc    Register a new employee / user
 * @route   POST /api/auth/register
 * @access  Public (or HR Admin)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    // Basic Input Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
      return;
    }

    // Check duplicate email
    const existingUser = await DataService.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An employee account with this email already exists.',
      });
      return;
    }

    // Allowed roles
    const validRoles: UserRole[] = ['hr', 'manager', 'employee'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'employee';

    const newUser = await DataService.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: assignedRole,
      department: department || 'Engineering',
      designation: designation || 'Associate Specialist',
      phone: phone || '+1 (555) 000-0000',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
      leaveBalance: { annual: 15, sick: 10, casual: 7 },
    });

    const token = generateToken({
      id: String(newUser._id || newUser.id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      designation: newUser.designation,
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully.',
      token,
      user: {
        id: newUser._id || newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        designation: newUser.designation,
        avatar: newUser.avatar,
        phone: newUser.phone,
        leaveBalance: newUser.leaveBalance,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during employee registration.',
    });
  }
};

/**
 * @desc    Authenticate user and get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    // Find user including password
    const user = await DataService.findUserByEmail(email, true);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    // Verify bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    const token = generateToken({
      id: String(user._id || user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        avatar: user.avatar,
        phone: user.phone,
        leaveBalance: user.leaveBalance,
        status: user.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication.',
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (JWT required)
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const user = await DataService.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching user profile.',
    });
  }
};

/**
 * @desc    Update employee personal record
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { name, phone, avatar, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (avatar) updates.avatar = avatar;
    if (password && password.length >= 6) updates.password = password;

    const updatedUser = await DataService.updateUser(req.user.id, updates);
    res.status(200).json({
      success: true,
      message: 'Personal profile updated successfully.',
      user: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update personal records.',
    });
  }
};

/**
 * @desc    Get pre-configured demo user accounts for rapid testing
 * @route   GET /api/auth/demo-accounts
 * @access  Public
 */
export const getDemoAccounts = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Pre-seeded demo credentials for instant testing',
    accounts: [
      {
        role: 'hr',
        title: 'HR Administrator',
        email: 'hr@staffsync.io',
        password: 'StaffSync@123',
        description: 'Full administrative control over employees, leave approvals, attendance, announcements.',
      },
      {
        role: 'manager',
        title: 'Team Manager',
        email: 'manager@staffsync.io',
        password: 'StaffSync@123',
        description: 'Oversees team leave approvals and manages training programs.',
      },
      {
        role: 'employee',
        title: 'Staff Employee',
        email: 'alex@staffsync.io',
        password: 'StaffSync@123',
        description: 'Applies for leaves, clocks in/out daily, checks announcements, tracks training.',
      },
    ],
  });
};
