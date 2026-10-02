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

  // Send OTP
  const sendOtp = async (email, displayName) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.sendOtp({ email: trimmedEmail, displayName });
    return res;
  };

  // Verify OTP & Log In
  const verifyOtp = async (email, otp) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.verifyOtp({ email: trimmedEmail, otp: otp.trim() });

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

  // Resend OTP
  const resendOtp = async (email) => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await api.auth.resendOtp({ email: trimmedEmail });
    return res;
  };

  // 1-Click Demo Login
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

  // Login (Password / Demo fallback)
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Permanent Demo Mode Login (Guest Adventurer)
    if (trimmedEmail === "demo@memorymap.com" || trimmedEmail === "demo@photoflow.app") {
      return loginDemo();
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
  const updateUserProfile = async ({ displayName }) => {
    if (currentUser?.isDemo) {
      const updatedDemo = {
        ...currentUser,
        displayName: displayName || currentUser.displayName
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updatedDemo));
      setCurrentUser(updatedDemo);
      return updatedDemo;
    }

    const res = await api.auth.updateProfile({ displayName });

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
    sendOtp,
    verifyOtp,
    resendOtp,
    loginDemo,
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
