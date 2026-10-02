import express from 'express';
import {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
  updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Registration & Email Verification (with OTP)
router.post('/register', authLimiter, registerUser);
router.post('/verify-registration-otp', authLimiter, verifyRegistrationOtp);
router.post('/resend-registration-otp', authLimiter, resendRegistrationOtp);

// Standard Login (Email + Password only, NO OTP)
router.post('/login', authLimiter, loginUser);

// Password Reset (with OTP)
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Profile
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

export default router;
