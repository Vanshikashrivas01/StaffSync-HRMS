import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getTodayStatus,
  getAllAttendance,
} from '../controllers/attendanceController.ts';
import { authenticateToken, authorizeRoles } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/today', getTodayStatus);
router.get('/', authorizeRoles('hr', 'manager'), getAllAttendance);

export default router;
