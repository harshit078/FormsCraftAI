import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./client-layout"
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Conversational Form Builder",
  description: "Create interactive, chat-based forms in seconds using AI.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-gradient-to-b from-background to-muted transition-colors duration-300 ${inter.className}`}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  )
}

import './globals.css'