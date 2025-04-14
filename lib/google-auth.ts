import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { auth as firebaseAdmin } from './firebase-admin';

// Initialize OAuth2 client
const oauth2Client = new OAuth2Client({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000'
});

// Helper function to get fresh Google OAuth tokens from Firebase user
async function getGoogleCredentials(userEmail: string) {
  try {
    // Get the Firebase user by email
    const firebaseUser = await firebaseAdmin.getUserByEmail(userEmail);
    
    if (!firebaseUser) {
      throw new Error('User not found in Firebase');
    }

    // Get the user's Google provider data
    const googleProvider = firebaseUser.providerData.find(
      provider => provider.providerId === 'google.com'
    );

    if (!googleProvider) {
      throw new Error('User is not connected with Google');
    }

    // Get fresh tokens from Firebase
    const userRecord = await firebaseAdmin.getUser(firebaseUser.uid);
    const tokens = await firebaseAdmin.createCustomToken(userRecord.uid);

    if (!tokens) {
      throw new Error('Failed to get Google credentials');
    }

    return tokens;
  } catch (error) {
    console.error('Error getting Google credentials:', error);
    throw new Error('Failed to get Google credentials');
  }
}

// Create and configure Forms API client
export async function createFormsClient(userEmail: string) {
  try {
    // Get fresh Google credentials
    const tokens = await getGoogleCredentials(userEmail);

    // Set credentials in OAuth2 client
    oauth2Client.setCredentials({
      access_token: tokens,
      token_type: 'Bearer'
    });

    // Create and return Forms API client
    return google.forms({
      version: 'v1',
      auth: oauth2Client,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error creating Forms client:', error);
    throw new Error('Failed to initialize Google Forms API client');
  }
}

// Helper to verify Google OAuth token
export async function verifyGoogleToken(token: string) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid Google token');
  }
}

// Function to create a Google Forms client with the user's access token
export async function createGoogleFormsClient(accessToken: string) {
  try {
    // Set credentials directly with the access token
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    // Create and return Forms API client
    return google.forms({
      version: 'v1',
      auth: oauth2Client
    });
  } catch (error) {
    console.error('Error creating Forms client:', error);
    throw new Error('Failed to initialize Google Forms client');
  }
}

// Helper function to create question items
export function createQuestionItem(question: any) {
  // Base question structure
  const questionItem: any = {
    title: question.text,
    questionItem: {
      question: {
        required: question.required
      }
    }
  };

  // Map question types to Google Forms API format
  switch (question.type) {
    case 'short_answer':
      questionItem.questionItem.question.textQuestion = {
        paragraph: false
      };
      break;

    case 'paragraph':
      questionItem.questionItem.question.textQuestion = {
        paragraph: true
      };
      break;

    case 'multiple-choice':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'RADIO',
        options: question.options?.map((option: string) => ({
          value: option
        }))
      };
      break;

    case 'checkbox':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'CHECKBOX',
        options: question.options?.map((option: string) => ({
          value: option
        }))
      };
      break;

    case 'dropdown':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'DROP_DOWN',
        options: question.options?.map((option: string) => ({
          value: option
        }))
      };
      break;

    case 'email':
      // For email, we use textQuestion without validation type
      // as Google Forms API doesn't support email validation directly
      questionItem.questionItem.question.textQuestion = {
        paragraph: false
      };
      break;

    case 'date':
      questionItem.questionItem.question.dateQuestion = {};
      break;

    case 'time':
      questionItem.questionItem.question.timeQuestion = {};
      break;

    case 'scale':
    case 'rating':
      questionItem.questionItem.question.scaleQuestion = {
        low: question.low || 1,
        high: question.high || 5,
        lowLabel: question.lowLabel || '',
        highLabel: question.highLabel || ''
      };
      break;

    default:
      // Default to short answer
      questionItem.questionItem.question.textQuestion = {
        paragraph: false
      };
  }

  return questionItem;
} 