import { Router } from 'express';
import {
  getAllAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

// All authenticated roles can view announcements
router.get('/', getAllAnnouncements);

// HR can create and delete announcements
router.post('/', authorizeRoles('hr'), createAnnouncement);
router.delete('/:id', authorizeRoles('hr'), deleteAnnouncement);

export default router;
