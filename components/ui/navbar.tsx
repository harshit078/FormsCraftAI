"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';
import { ButtonCta } from './button-shiny';
import { toast } from "sonner"

const Navbar = () => {
  const { user, loading, error, signInWithGoogle, signOut } = useAuth();
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleSignIn = async () => {
    setIsAuthLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully signed in!");
    } catch (error) {
      console.error("Sign-in error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await signOut();
      toast.success("Successfully signed out");
    } catch (error) {
      console.error("Sign-out error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsAuthLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-destructive text-sm">
        {error}
      </div>
    );
  }

  return (
    <header className="fixed p-6 top-0 left-0 right-0 z-50 bg-background">
      <div className="flex items-center justify-between h-10 md:h-10">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <div className="mb-1 max-sm:left-0 max-sm:right-0 max-sm:fixed mt-4 relative flex justify-center">
              <img
                src="/logos.png"
                alt="Logo"
                className="h-7 w-auto"
              />
            </div>
          </a>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              className="relative flex  transition-all duration-200"
              disabled={isAuthLoading}
              >
              <ButtonCta
              className='w-full'
              ></ButtonCta>
            </motion.button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {user.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" disabled={isAuthLoading}>
                {isAuthLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

