import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user & return instant JWT session
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { displayName, email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide valid email and password' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }

    const user = await User.create({
      displayName: (displayName && displayName.trim()) || trimmedEmail.split('@')[0],
      email: trimmedEmail,
      password
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user: {
        uid: user._id.toString(),
        displayName: user.displayName,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate user & get token
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
