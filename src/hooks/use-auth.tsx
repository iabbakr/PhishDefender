
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
  updateProfile,
  getIdTokenResult,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, pass: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const idTokenResult = await getIdTokenResult(user);
        setIsAdmin(!!idTokenResult.claims.admin);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleAuthError = (error: unknown): { error: string } => {
    const firebaseError = error as AuthError;
    console.error('Firebase Auth Error:', firebaseError);
    let message = 'An unknown authentication error occurred.';
    if (firebaseError.code === 'auth/email-already-in-use') {
      message = 'This email is already registered. Please sign in or use a different email.';
    } else if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
      message = 'Invalid credentials. Please check your email and password and try again.';
    } else if (firebaseError.message) {
        message = firebaseError.message;
    }
    return { error: message };
  }

  const upsertUserInFirestore = async (user: User) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user's last login
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // Create new user document
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        username: user.displayName || user.email?.split('@')[0] || '',
        photoURL: user.photoURL,
        phone: '',
        quizScores: {}, // Changed from quizScore to quizScores object
        contributions: {
          url: 0,
          email: 0,
          sms: 0,
        },
        readArticles: [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      }, { merge: true });
    }
  }

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await upsertUserInFirestore(result.user);
      router.push('/');
      return {};
    } catch (error) {
      return handleAuthError(error);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, pass);
        await upsertUserInFirestore(result.user);
        router.push('/');
        return {};
    } catch (error) {
        return handleAuthError(error);
    }
  }

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, pass);
        const displayName = email.split('@')[0];
        await updateProfile(result.user, { displayName });

        // The user object needs to be refreshed to get the displayName
        // We'll pass the necessary info to our upsert function manually
        const userToCreate = {
          ...result.user,
          displayName: displayName,
        }
        await upsertUserInFirestore(userToCreate);
        
        router.push('/');
        return {};
    } catch (error) {
        return handleAuthError(error);
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut, signInWithEmail, signUpWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
