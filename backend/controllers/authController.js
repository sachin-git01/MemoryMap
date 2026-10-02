import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendLoginOtpEmail } from '../utils/emailService.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send Passwordless Login OTP to Email
// @route   POST /api/auth/send-otp
// @access  Public
export const sendLoginOtp = async (req, res) => {
  try {
    const { email, displayName } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find or create user
    let user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      user = await User.create({
        displayName: (displayName && displayName.trim()) || trimmedEmail.split('@')[0],
        email: trimmedEmail
      });
    }

    // Cooldown check (60 seconds)
    if (user.otpResendCooldown && new Date() < user.otpResendCooldown) {
      const remainingSeconds = Math.ceil((user.otpResendCooldown.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${remainingSeconds} seconds before requesting a new code.`
      });
    }

    const otp = generate6DigitOtp();
    user.loginOtp = otp;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000); // 60 seconds
    await user.save();

    // Send email via Brevo / Resend
    await sendLoginOtpEmail(user.email, otp, user.displayName);

    return res.status(200).json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email address.',
      email: user.email
    });
  } catch (error) {
    console.error('[Auth sendLoginOtp Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error sending login code' });
  }
};

// @desc    Verify 6-Digit OTP and Log In (Generate JWT)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit code' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.toString().trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please request a new code.' });
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active verification code found. Please request a new one.' });
    }

    if (new Date() > user.loginOtpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.loginOtp !== trimmedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // Clear OTP upon successful verification
    user.loginOtp = undefined;
    user.loginOtpExpires = undefined;
    user.otpResendCooldown = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('[Auth verifyLoginOtp Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error verifying code' });
  }
};

// @desc    Resend Login OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendLoginOtp = async (req, res) => {
  return sendLoginOtp(req, res);
};

// @desc    Optional Password Login (for Demo mode / legacy)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Logged in successfully!',
        user: {
          uid: user._id.toString(),
          displayName: user.displayName,
          email: user.email
        },
        token
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile from token
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    return res.json({
      success: true,
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth getMe Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error retrieving user' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { displayName } = req.body;
    if (displayName && typeof displayName === 'string') {
      user.displayName = displayName.trim();
    }

    await user.save();

    return res.json({
      success: true,
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('[Auth updateUserProfile Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error updating profile' });
  }
};
