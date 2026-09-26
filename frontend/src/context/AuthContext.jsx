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

  // Signup
  const signup = async (email, password, displayName) => {
    try {
      const res = await api.auth.register({
        displayName: displayName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        password
      });

      if (res?.requiresVerification) {
        return {
          requiresVerification: true,
          email: res.email,
          devOtp: res.devOtp,
          message: res.message
        };
      }

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
      throw new Error(res?.message || 'Failed to create account');
    } catch (err) {
      console.error('[Auth Signup Error]:', err);
      throw err;
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const res = await api.auth.verifyOtp({ email, otp });
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
    } catch (err) {
      console.error('[Auth Verify OTP Error]:', err);
      throw err;
    }
  };

  // Resend OTP
  const resendOtp = async (email) => {
    try {
      return await api.auth.resendOtp({ email });
    } catch (err) {
      console.error('[Auth Resend OTP Error]:', err);
      throw err;
    }
  };

  // Login
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Permanent Demo Mode Login (Guest Adventurer)
    if (trimmedEmail === "demo@memorymap.com" || trimmedEmail === "demo@photoflow.app") {
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
    }

    // 2. Real JWT Backend Login
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

  // Logout
  const logout = async () => {
    removeToken();
    localStorage.removeItem(DEMO_USER_KEY);
    setCurrentUser(null);
  };

  // Update Profile
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

    const res = await api.auth.updateProfile({
      displayName,
      currentPassword,
      newPassword
    });

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
    verifyOtp,
    resendOtp,
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!initializing && children}
    </AuthContext.Provider>
  );
};
