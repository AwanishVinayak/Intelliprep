import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  activeRole: UserRole | null;
  loading: boolean;
  signIn: (preferredRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setActiveRole: (role: UserRole) => void;
  createProfile: (role: UserRole, extraData?: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('activeRole');
    return (saved as UserRole) || null;
  });
  const [loading, setLoading] = useState(true);

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (role) {
      localStorage.setItem('activeRole', role);
    } else {
      localStorage.removeItem('activeRole');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authRef) => {
      setUser(authRef);
      if (authRef) {
        const docRef = doc(db, 'users', authRef.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const p = docSnap.data() as UserProfile;
          setProfile(p);
          // If activeRole is not set in localStorage, default to profile role
          const savedRole = localStorage.getItem('activeRole');
          if (!savedRole) {
            setActiveRole(p.role);
          }
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
        setActiveRoleState(null);
        localStorage.removeItem('activeRole');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (preferredRole: UserRole) => {
    try {
      setActiveRole(preferredRole);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn('Sign-in popup closed by user. No action taken.');
      } else {
        console.error('Authentication Error:', error);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const createProfile = async (role: UserRole, extraData?: Partial<UserProfile>) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || 'User',
      role: role,
      createdAt: new Date().toISOString(),
      ...extraData
    };
    await setDoc(docRef, newProfile);
    setProfile(newProfile);
    setActiveRole(role);
  };

  return (
    <AuthContext.Provider value={{ user, profile, activeRole, loading, signIn, logout, setActiveRole, createProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
