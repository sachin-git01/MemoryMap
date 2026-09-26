import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { sendVerificationOtpEmail, isDisposableEmail } from '../utils/emailService.js';

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

// @desc    Register a new user (with Email OTP Verification)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password strings' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Block disposable / fake email domains
    if (isDisposableEmail(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Disposable or temporary email addresses are not permitted. Please use a valid email address.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    if (displayName && typeof displayName !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid display name format' });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
      }

      // If user exists but is NOT verified, update with fresh credentials & send new OTP
      existingUser.displayName = (displayName && displayName.trim()) || existingUser.displayName;
      existingUser.password = password; // will be hashed by pre('save') hook
      const otp = generate6DigitOtp();
      existingUser.verificationOtp = otp;
      existingUser.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      existingUser.otpResendCooldown = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown
      await existingUser.save();

      const emailResult = await sendVerificationOtpEmail(existingUser.email, otp, existingUser.displayName);

      return res.status(200).json({
        success: true,
        requiresVerification: true,
        email: existingUser.email,
        message: 'A verification code has been sent to your email address.',
        devOtp: emailResult.fallbackOtp || (process.env.NODE_ENV !== 'production' ? otp : undefined)
      });
    }

    // Create new unverified user
    const otp = generate6DigitOtp();
    const user = await User.create({
      displayName: (displayName && displayName.trim()) || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      password,
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      otpResendCooldown: new Date(Date.now() + 60 * 1000)
    });

    const emailResult = await sendVerificationOtpEmail(user.email, otp, user.displayName);

    return res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: 'A verification code has been sent to your email address.',
      devOtp: emailResult.fallbackOtp || (process.env.NODE_ENV !== 'production' ? otp : undefined)
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Verify Email OTP & activate account
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide both email and 6-digit OTP' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.toString().trim();

    const user = await User.findOne({ email: trimmedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with this email' });
    }

    if (user.isVerified) {
      const token = generateToken(user._id);
      return res.status(200).json({
        success: true,
        message: 'Account is already verified',
        user: {
          uid: user._id.toString(),
          displayName: user.displayName,
          email: user.email
        },
        token
      });
    }

    if (!user.verificationOtp || !user.verificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found. Please request a new code.'
      });
    }

    // Check expiry
    if (new Date() > user.verificationOtpExpires) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Check OTP match
    if (user.verificationOtp !== trimmedOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.'
      });
    }

    // Successfully verified!
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
    console.error('[Auth Verify OTP Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during verification' });
  }
};

// @desc    Resend Email Verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email address' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found with this email' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account is already verified. Please log in.' });
    }

    // Check rate limit / cooldown
    if (user.otpResendCooldown && new Date() < user.otpResendCooldown) {
      const waitSeconds = Math.ceil((user.otpResendCooldown.getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds} seconds before requesting a new code.`
      });
    }

    const otp = generate6DigitOtp();
    user.verificationOtp = otp;
    user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpResendCooldown = new Date(Date.now() + 60 * 1000); // 60 seconds
    await user.save();

    const emailResult = await sendVerificationOtpEmail(user.email, otp, user.displayName);

    return res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      devOtp: emailResult.fallbackOtp || (process.env.NODE_ENV !== 'production' ? otp : undefined)
    });
  } catch (error) {
    console.error('[Auth Resend OTP Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error resending code' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password strings' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: trimmedEmail });

    if (user && (await user.matchPassword(password))) {
      // Check if user has verified their email
      if (user.isVerified === false) {
        // Send a fresh OTP automatically
        const otp = generate6DigitOtp();
        user.verificationOtp = otp;
        user.verificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.otpResendCooldown = new Date(Date.now() + 60 * 1000);
        await user.save();

        const emailResult = await sendVerificationOtpEmail(user.email, otp, user.displayName);

        return res.status(403).json({
          success: false,
          requiresVerification: true,
          email: user.email,
          message: 'Your email is not verified yet. A new verification code has been sent to your email.',
          devOtp: emailResult.fallbackOtp || (process.env.NODE_ENV !== 'production' ? otp : undefined)
        });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
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

// @desc    Update user profile or password
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
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
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
