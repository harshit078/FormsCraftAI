"use client"

import { useEffect, useState } from 'react'
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  )
} 