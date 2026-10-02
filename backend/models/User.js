import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      default: 'Explorer',
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: false,
      minlength: [6, 'Password must be at least 6 characters']
    },
    loginOtp: {
      type: String
    },
    loginOtpExpires: {
      type: Date
    },
    otpResendCooldown: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if present
userSchema.pre('save', async function (next) {
  if (!this.password || !this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Omit password and OTP from JSON serialization
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.loginOtp;
  return userObject;
};

export const User = mongoose.model('User', userSchema);
