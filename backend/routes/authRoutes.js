import express from 'express';
import {
  sendLoginOtp,
  verifyLoginOtp,
  resendLoginOtp,
  loginUser,
  getMe,
  updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/send-otp', authLimiter, sendLoginOtp);
router.post('/verify-otp', authLimiter, verifyLoginOtp);
router.post('/resend-otp', authLimiter, resendLoginOtp);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

export default router;
