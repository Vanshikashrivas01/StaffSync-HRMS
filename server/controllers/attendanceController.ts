import { Response } from 'express';
import { DataService } from '../services/dataService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

/**
 * @desc    Check in for the current workday
 * @route   POST /api/attendance/check-in
 * @access  Private (All roles)
 */
export const checkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { workMode, notes } = req.body;
    const record = await DataService.checkInEmployee(employeeId, workMode || 'office', notes || '');

    res.status(200).json({
      success: true,
      message: 'Check-in recorded successfully. Have a productive day!',
      attendance: record,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing daily check-in.',
    });
  }
};

/**
 * @desc    Check out at end of workday
 * @route   POST /api/attendance/check-out
 * @access  Private (All roles)
 */
export const checkOut = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const record = await DataService.checkOutEmployee(employeeId);
    res.status(200).json({
      success: true,
      message: `Checked out successfully! Total work time: ${record.workHours} hours.`,
      attendance: record,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Error processing check-out.',
    });
  }
};

/**
 * @desc    Get today's check-in/out status for current user
 * @route   GET /api/attendance/today
 * @access  Private
 */
export const getTodayStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const employeeId = req.user?.id;
    if (!employeeId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const record = await DataService.getTodayAttendanceForEmployee(employeeId);
    res.status(200).json({
      success: true,
      attendance: record || null,
      isCheckedIn: !!(record && record.checkInTime && !record.checkOutTime),
      isCheckedOut: !!(record && record.checkOutTime),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get company-wide attendance for HR and Managers
 * @route   GET /api/attendance
 * @access  Private (HR, Manager)
 */
export const getAllAttendance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const dateQuery = req.query.date as string;
    const records = await DataService.getAllAttendance(dateQuery);

    const totalPresent = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const totalLate = records.filter(r => r.status === 'late').length;
    const remoteWorkers = records.filter(r => r.workMode === 'remote').length;

    res.status(200).json({
      success: true,
      summary: {
        totalRecords: records.length,
        totalPresent,
        totalLate,
        remoteWorkers,
      },
      records,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
