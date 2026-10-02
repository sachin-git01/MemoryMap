import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';

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

// @desc    Register user with password, sends 6-digit verification OTP
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = (displayName && displayName.trim()) || trimmedEmail.split('@')[0];

    let user = await User.findOne({ email: trimmedEmail });

    if (user && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    const otp = generate6DigitOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const cooldown = new Date(Date.now() + 60 * 1000); // 60s cooldown

    if (user && !user.isVerified) {
      // User exists but hadn't verified yet - update details & issue new OTP
      user.displayName = cleanName;
      user.password = password; // Will be hashed by pre-save
      user.verificationOtp = otp;
      user.verificationOtpExpires = otpExpires;
      user.otpResendCooldown = cooldown;
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        displayName: cleanName,
        email: trimmedEmail,
        password,
        isVerified: false,
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
        otpResendCooldown: cooldown
      });
    }

    // Send verification email via Brevo
    await sendVerificationOtpEmail(user.email, otp, user.displayName);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! A 6-digit verification code has been sent to your email.',
      email: user.email
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Verify Registration OTP and activate account (Returns JWT)
// @route   POST /api/auth/verify-registration-otp
// @access  Public
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide email and 6-digit code' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.toString().trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found. Please register first.' });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified. Logged in successfully!',
        user: {
          uid: user._id.toString(),
          displayName: user.displayName,
          email: user.email
        },
        token
      });
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active verification code found. Please request a new code.' });
    }

    if (new Date() > user.verificationOtpExpires) {
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.verificationOtp !== trimmedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // Mark as verified & clear OTP
    user.isVerified = true;
    user.verificationOtp = undefined;
    user.verificationOtpExpires = undefined;
    user.otpResendCooldown = undefined;
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to MemoryMap.',
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('[Auth verifyRegistrationOtp Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error verifying code' });
  }
};

// @desc    Resend Registration OTP
// @route   POST /api/auth/resend-registration-otp
// @access  Public
export const resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with this email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. You can log in directly.' });
    }

    if (user.otpResendCooldown && new Date() < user.otpResendCooldown) {
      const wait = Math.ceil((user.otpResendCooldown.getTime() - Date.now()) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait} seconds before requesting a new code.` });
    }

    const otp = generate6DigitOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000);
    await user.save();

    await sendVerificationOtpEmail(user.email, otp, user.displayName);

    return res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('[Auth resendRegistrationOtp Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error resending code' });
  }
};

// @desc    Standard Login with Email & Password (NO OTP needed!)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user has verified their email
    if (!user.isVerified) {
      const otp = generate6DigitOtp();
      user.verificationOtp = otp;
      user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
      user.otpResendCooldown = new Date(Date.now() + 60 * 1000);
      await user.save();

      await sendVerificationOtpEmail(user.email, otp, user.displayName);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email is not verified yet. We have sent a 6-digit code to complete verification.'
      });
    }

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
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during login' });
  }
};

// @desc    Initiate Password Reset (Send 6-digit OTP to Email)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    if (user.otpResendCooldown && new Date() < user.otpResendCooldown) {
      const wait = Math.ceil((user.otpResendCooldown.getTime() - Date.now()) / 1000);
      return res.status(429).json({ success: false, message: `Please wait ${wait} seconds before requesting another code.` });
    }

    const otp = generate6DigitOtp();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000);
    await user.save();

    await sendPasswordResetOtpEmail(user.email, otp, user.displayName);

    return res.status(200).json({
      success: true,
      message: 'Password reset code has been sent to your email address.',
      email: user.email
    });
  } catch (error) {
    console.error('[Auth forgotPassword Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error initiating password reset' });
  }
};

// @desc    Verify OTP and Set New Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, verification code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.toString().trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'No active password reset code. Please request a new one.' });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: 'Password reset code has expired. Please request a new one.' });
    }

    if (user.resetPasswordOtp !== trimmedOtp) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // Update password and clear reset OTP
    user.password = newPassword; // Will be hashed by pre-save hook
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.otpResendCooldown = undefined;
    user.isVerified = true; // Since they accessed their email, consider them verified
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('[Auth resetPassword Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error resetting password' });
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

// @desc    Update user profile / password
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { displayName, currentPassword, newPassword } = req.body;

    if (displayName && typeof displayName === 'string') {
      user.displayName = displayName.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Please enter current password to set a new password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
      }
      user.password = newPassword;
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
