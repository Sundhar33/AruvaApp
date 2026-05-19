import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useEffect, useRef, useState } from 'react';
import { auth } from '../firebase/config';
import { safeAsyncStorage } from '../utils/asyncStorageHelper';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const hasResolvedAuth = useRef(false);

  useEffect(() => {
    let unsubscribe = () => {};
    const fallbackTimer = setTimeout(() => {
      if (!hasResolvedAuth.current) {
        console.warn('Auth initialization timed out, continuing without a signed-in user.');
        hasResolvedAuth.current = true;
        setLoading(false);
      }
    }, 5000);

    try {
      // Check if user is already logged in
      unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        hasResolvedAuth.current = true;
        setUser(currentUser);
        if (currentUser) {
          // Load user profile from storage
          try {
            const profile = await safeAsyncStorage.getItem(`user_profile_${currentUser.uid}`);
            setUserProfile(profile ? JSON.parse(profile) : null);
          } catch (error) {
            console.error('Error loading user profile:', error);
          }
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      hasResolvedAuth.current = true;
      setLoading(false);
    }

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe?.();
    };
  }, []);

  const value = {
    user,
    loading,
    userProfile,
    setUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
