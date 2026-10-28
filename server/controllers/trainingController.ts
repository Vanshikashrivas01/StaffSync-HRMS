import { Response } from 'express';
import { DataService } from '../services/dataService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

/**
 * @desc    Get all training programs
 * @route   GET /api/trainings
 * @access  Private (All roles)
 */
export const getAllTrainings = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const trainings = await DataService.getAllTrainings();
    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new training program
 * @route   POST /api/trainings
 * @access  Private (Manager, HR)
 */
export const createTraining = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, instructor, startDate, endDate, durationHours } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!title || !description || !startDate || !endDate) {
      res.status(400).json({
        success: false,
        message: 'Title, description, startDate, and endDate are required.',
      });
      return;
    }

    const newTraining = await DataService.createTraining({
      title: title.trim(),
      description: description.trim(),
      category: category || 'Engineering',
      instructor: instructor || 'StaffSync Learning Academy',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      durationHours: Number(durationHours) || 12,
      createdBy: authorId,
      status: 'upcoming',
      participants: [],
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully.',
      training: newTraining,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Assign employees to training program
 * @route   POST /api/trainings/:id/assign
 * @access  Private (Manager, HR)
 */
export const assignEmployees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeIds } = req.body;

    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide an array of employee IDs to assign.',
      });
      return;
    }

    const updated = await DataService.assignParticipantsToTraining(id, employeeIds);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Training program not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `${employeeIds.length} employee(s) assigned to training successfully.`,
      training: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update employee training progress & grade
 * @route   PUT /api/trainings/:id/progress
 * @access  Private
 */
export const updateProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { employeeId, progressPercent, score } = req.body;
    const targetEmpId = employeeId || req.user?.id;

    if (!targetEmpId) {
      res.status(400).json({ success: false, message: 'Employee ID required.' });
      return;
    }

    const updated = await DataService.updateParticipantProgress(
      id,
      targetEmpId,
      Number(progressPercent) || 0,
      score !== undefined ? Number(score) : undefined
    );

    if (!updated) {
      res.status(404).json({ success: false, message: 'Training or enrollment record not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully.',
      training: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
