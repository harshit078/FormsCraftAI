"use client"

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth-context'
import Home from './page'
import { FormBuilder } from '@/components/form-builder'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/form-builder" 
        element={
          <ProtectedRoute>
            <FormBuilder />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
} 