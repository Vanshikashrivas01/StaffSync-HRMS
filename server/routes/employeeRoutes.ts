import { Router } from 'express';
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats,
} from '../controllers/employeeController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

// Apply auth to all employee endpoints
router.use(authenticateToken);

router.get('/stats/summary', authorizeRoles('hr', 'manager'), getEmployeeStats);
router.get('/', authorizeRoles('hr', 'manager'), getAllEmployees);
router.get('/:id', getEmployeeById);
router.post('/', authorizeRoles('hr'), createEmployee);
router.put('/:id', authorizeRoles('hr'), updateEmployee);
router.delete('/:id', authorizeRoles('hr'), deleteEmployee);

export default router;
