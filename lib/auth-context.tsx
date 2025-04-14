"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { toast } from 'sonner';
import { auth } from './firebase'; // Import the initialized auth instance

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  getStoredAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Use the imported auth instance
    return onAuthStateChanged(auth, setUser);
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      
      // Add necessary scopes for Google Forms
      provider.addScope('https://www.googleapis.com/auth/forms');
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      provider.addScope('https://www.googleapis.com/auth/spreadsheets');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential?.accessToken) {
        throw new Error('Failed to get access token');
      }

      // Store the access token in localStorage
      localStorage.setItem('googleAccessToken', credential.accessToken);
      
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      // Clear stored token
      localStorage.removeItem('googleAccessToken');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const getStoredAccessToken = () => {
    return localStorage.getItem('googleAccessToken');
  };

  const checkPopupBlocked = async (): Promise<boolean> => {
    try {
      const popup = window.open(
        'about:blank',
        'popup_test',
        'width=1,height=1,left=0,top=0'
      );
      
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        return true;
      }
      
      popup.close();
      return false;
    } catch {
      return true;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signInWithGoogle, 
      signOut,
      getStoredAccessToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};