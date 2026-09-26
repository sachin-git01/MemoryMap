import express from 'express';
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, registerUser);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

// Diagnostic test endpoint for email delivery
router.post('/test-email', async (req, res) => {
  const { email } = req.body;
  const targetEmail = email || 'sachinkumarofficial800@gmail.com';
  const brevoSender = (process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'sachinofficial7310@gmail.com').trim();
  
  let brevoResult = null;
  if (process.env.BREVO_API_KEY) {
    try {
      const resp = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'MemoryMap', email: brevoSender },
          to: [{ email: targetEmail }],
          subject: 'MemoryMap Test Verification Code',
          htmlContent: '<h3>Your test verification code is 123456</h3>'
        })
      });
      const data = await resp.json();
      brevoResult = { ok: resp.ok, status: resp.status, data };
    } catch (err) {
      brevoResult = { error: err.message };
    }
  }

  return res.json({
    brevoConfigured: Boolean(process.env.BREVO_API_KEY),
    brevoSender,
    brevoResult
  });
});

export default router;
