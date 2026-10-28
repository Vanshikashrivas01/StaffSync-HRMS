import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  getDemoAccounts,
} from '../controllers/authController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/demo-accounts', getDemoAccounts);

// Protected routes (JWT required)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);

export default router;
