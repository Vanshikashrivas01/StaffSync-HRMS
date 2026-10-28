import { Router } from 'express';
import {
  getAllTrainings,
  createTraining,
  assignEmployees,
  updateProgress,
} from '../controllers/trainingController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

// All roles can view training programs
router.get('/', getAllTrainings);

// Managers and HR can create programs and assign staff
router.post('/', authorizeRoles('manager', 'hr'), createTraining);
router.post('/:id/assign', authorizeRoles('manager', 'hr'), assignEmployees);

// Participants or managers can update progress
router.put('/:id/progress', updateProgress);

export default router;
