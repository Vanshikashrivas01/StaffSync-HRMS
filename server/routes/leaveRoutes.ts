import { Router } from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from '../controllers/leaveController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

// Apply auth to all leave endpoints
router.use(authenticateToken);

router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/', authorizeRoles('hr', 'manager'), getAllLeaves);
router.put('/:id/status', authorizeRoles('hr', 'manager'), updateLeaveStatus);

export default router;
