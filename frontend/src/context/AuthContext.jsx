import { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);
const DEMO_USER_KEY = "memorymap_demo_user";

const readStoredDemoUser = () => {
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem(DEMO_USER_KEY);
  if (!storedUser) return null;

  try {
    const parsedUser = JSON.parse(storedUser);
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null;
  } catch {
    localStorage.removeItem(DEMO_USER_KEY);
    return null;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => readStoredDemoUser());
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // Monitor Auth Changes on Startup
  useEffect(() => {
    const initAuth = async () => {
      const jwtToken = getToken();

      if (jwtToken) {
        try {
          const res = await api.auth.getMe();
          if (res?.success && res.user) {
            setCurrentUser({
              uid: res.user.uid,
              displayName: res.user.displayName,
              email: res.user.email,
              isDemo: false
            });
            setLoading(false);
            setInitializing(false);
            return;
          }
        } catch {
          // Token expired or invalid
          removeToken();
        }
      }

      // Fallback: Check if a Demo user session was saved
      const storedDemo = readStoredDemoUser();
      if (storedDemo && storedDemo.isDemo) {
        setCurrentUser(storedDemo);
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
      setInitializing(false);
    };

    initAuth();
  }, []);

  // 1. Signup with Name, Email & Password (Triggers 6-Digit OTP to Email)
  const signup = async (displayName, email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.register({
      displayName: displayName.trim(),
      email: trimmedEmail,
      password
    });
    return res;
  };

  // 2. Verify Signup OTP (Activates Account & Generates JWT Token)
  const verifySignupOtp = async (email, otp) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.verifyRegistrationOtp({
      email: trimmedEmail,
      otp: otp.trim()
    });

    if (res?.success && res.token && res.user) {
      setToken(res.token);
      localStorage.removeItem(DEMO_USER_KEY);

      const realUser = {
        uid: res.user.uid,
        displayName: res.user.displayName,
        email: res.user.email,
        isDemo: false
      };
      setCurrentUser(realUser);
      return realUser;
    }
    throw new Error(res?.message || 'Verification failed');
  };

  // 3. Resend Signup Verification OTP
  const resendSignupOtp = async (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.resendRegistrationOtp({ email: trimmedEmail });
    return res;
  };

  // 4. Standard Login with Email + Password (NO OTP needed!)
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1-Click Permanent Demo Login
    if (trimmedEmail === "demo@memorymap.com" || trimmedEmail === "demo@photoflow.app") {
      return loginDemo();
    }

    try {
      const res = await api.auth.login({
        email: trimmedEmail,
        password
      });

      if (res?.success && res.token && res.user) {
        setToken(res.token);
        localStorage.removeItem(DEMO_USER_KEY);

        const realUser = {
          uid: res.user.uid,
          displayName: res.user.displayName,
          email: res.user.email,
          isDemo: false
        };
        setCurrentUser(realUser);
        return realUser;
      }
      throw new Error(res?.message || 'Invalid credentials');
    } catch (err) {
      console.error('[Auth Login Error]:', err);
      throw err;
    }
  };

  // 5. Forgot Password: Send 6-Digit OTP to Email
  const forgotPassword = async (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.forgotPassword({ email: trimmedEmail });
    return res;
  };

  // 6. Reset Password: Verify OTP and Set New Password
  const resetPassword = async (email, otp, newPassword) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.resetPassword({
      email: trimmedEmail,
      otp: otp.trim(),
      newPassword
    });

    if (res?.success && res.token && res.user) {
      setToken(res.token);
      localStorage.removeItem(DEMO_USER_KEY);

      const realUser = {
        uid: res.user.uid,
        displayName: res.user.displayName,
        email: res.user.email,
        isDemo: false
      };
      setCurrentUser(realUser);
      return realUser;
    }
    return res;
  };

  // 7. Instant Demo Mode (1-Click)
  const loginDemo = () => {
    removeToken();
    const demoUser = {
      uid: "demo-user",
      email: "demo@memorymap.com",
      displayName: "Guest Adventurer",
      isDemo: true
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setCurrentUser(demoUser);
    return demoUser;
  };

  // 8. Logout
  const logout = async () => {
    removeToken();
    localStorage.removeItem(DEMO_USER_KEY);
    setCurrentUser(null);
  };

  // 9. Update User Profile
  const updateUserProfile = async ({ displayName, currentPassword, newPassword }) => {
    if (currentUser?.isDemo) {
      const updatedDemo = {
        ...currentUser,
        displayName: displayName || currentUser.displayName
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedDemo));
      setCurrentUser(updatedDemo);
      return updatedDemo;
    }

    const res = await api.auth.updateProfile({ displayName, currentPassword, newPassword });

    if (res?.success && res.user) {
      const updatedUser = {
        ...currentUser,
        displayName: res.user.displayName,
        email: res.user.email
      };
      setCurrentUser(updatedUser);
      return updatedUser;
    }
    throw new Error(res?.message || 'Failed to update profile');
  };

  const value = {
    currentUser,
    loading,
    isDemoMode: Boolean(currentUser?.isDemo),
    signup,
    verifySignupOtp,
    resendSignupOtp,
    login,
    forgotPassword,
    resetPassword,
    loginDemo,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};
