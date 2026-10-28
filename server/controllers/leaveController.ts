import { Response } from 'express';
import { DataService } from '../services/dataService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (All roles)
 */
export const applyLeave = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user?.id;

    if (!employeeId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required.',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
      return;
    }

    // Calculate days inclusive of start and end
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check user leave balance
    const employee = await DataService.findUserById(employeeId);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee record not found.' });
      return;
    }

    if (leaveType !== 'unpaid' && employee.leaveBalance) {
      const type = leaveType as 'annual' | 'sick' | 'casual';
      const available = employee.leaveBalance[type] || 0;
      if (totalDays > available) {
        res.status(400).json({
          success: false,
          message: `Insufficient leave balance. You requested ${totalDays} day(s), but only have ${available} ${leaveType} day(s) remaining.`,
        });
        return;
      }
    }

    const newLeave = await DataService.createLeave({
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave: newLeave,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get leave requests for current authenticated user
 * @route   GET /api/leaves/my
 * @access  Private
 */
export const getMyLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const leaves = await DataService.getAllLeaves({ employee: employeeId });
    const user = await DataService.findUserById(employeeId);

    res.status(200).json({
      success: true,
      leaveBalance: user?.leaveBalance || { annual: 15, sick: 10, casual: 7 },
      leaves,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all leave requests across the company or team
 * @route   GET /api/leaves
 * @access  Private (HR, Manager)
 */
export const getAllLeaves = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const filter: any = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const leaves = await DataService.getAllLeaves(filter);
    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Approve or reject a leave request
 * @route   PUT /api/leaves/:id/status
 * @access  Private (HR, Manager)
 */
export const updateLeaveStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    const reviewerId = req.user?.id;

    if (!reviewerId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'.",
      });
      return;
    }

    const updated = await DataService.updateLeaveStatus(id, status, reviewerId, reviewComments);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Leave application not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Leave application ${status} successfully.`,
      leave: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
