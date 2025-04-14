import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 401 }
      )
    }

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(idToken)
    
    // Get user details
    const userRecord = await auth.getUser(decodedToken.uid)
    
    return NextResponse.json({
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    })
    
  } catch (error: any) {
    console.error('Session verification error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 401 }
    )
  }
} 