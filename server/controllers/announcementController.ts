import { Response } from 'express';
import { DataService } from '../services/dataService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

/**
 * @desc    Get all announcements
 * @route   GET /api/announcements
 * @access  Private (All roles)
 */
export const getAllAnnouncements = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const announcements = await DataService.getAllAnnouncements();
    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Publish a company announcement
 * @route   POST /api/announcements
 * @access  Private (HR only)
 */
export const createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content, priority, category, pinned } = req.body;
    const authorId = req.user?.id;

    if (!authorId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content are required.',
      });
      return;
    }

    const newAnn = await DataService.createAnnouncement({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'normal',
      category: category || 'general',
      pinned: !!pinned,
      createdBy: authorId,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully.',
      announcement: newAnn,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete an announcement
 * @route   DELETE /api/announcements/:id
 * @access  Private (HR only)
 */
export const deleteAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await DataService.deleteAnnouncement(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Announcement not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
