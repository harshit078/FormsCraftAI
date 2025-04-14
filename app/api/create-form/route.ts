import { NextRequest, NextResponse } from 'next/server';
import { createGoogleFormsClient, createQuestionItem } from '@/lib/google-auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to return error responses in JSON format
const errorResponse = (message: string, details: string = '', status: number = 500) => {
  console.error(`API Error [${status}]: ${message} - ${details}`);
  return NextResponse.json(
    { 
      error: message, 
      details,
      // Add a more specific error code for frontend handling
      code: status === 401 ? 'auth/invalid-token' : 'error/unknown'
    },
    { status, headers: corsHeaders }
  );
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const oauth2Client = new OAuth2Client({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000'
});

// The main API endpoint for creating Google Forms
export async function POST(request: NextRequest) {
  try {
    // Get Google access token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing access token' }, 
        { status: 401, headers: corsHeaders }
      );
    }

    const accessToken = authHeader.split('Bearer ')[1];
    
    // Get request body
    const { title, questions } = await request.json();
    
    if (!title || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Forms client with user's access token
    const forms = await createGoogleFormsClient(accessToken);

    // Create the form
    const form = await forms.forms.create({
      requestBody: {
        info: {
          title: title,
          documentTitle: title,
        }
      }
    });

    const formId = form.data.formId;
    if (!formId) {
      throw new Error('No form ID received');
    }

    // Add questions to the form with proper error handling
    try {
      const requests = questions.map((question: any, index: number) => {
        const item = createQuestionItem(question);
        console.log(`Question ${index} payload:`, JSON.stringify(item, null, 2)); // Debug log
        return {
          createItem: {
            item,
            location: { index }
          }
        };
      });

      await forms.forms.batchUpdate({
        formId,
        requestBody: { requests }
      });
    } catch (batchError) {
      console.error('Error adding questions:', batchError);
      // Log the full error details
      if (batchError.response) {
        console.error('API Response:', batchError.response.data);
      }
      
    }

    // Set up OAuth2 client with access token
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    // Initialize Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Create new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: title
        }
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) {
      throw new Error('Failed to create spreadsheet');
    }

    // Get the form
    const formData = await forms.forms.get({
      formId: formId
    });

    // Create headers based on form questions
    const headers = formData.data.items?.map(item => item.title || 'Untitled Question') || [];
    
    // Add timestamp and email headers
    headers.unshift('Timestamp', 'Email');

    // Update the spreadsheet with headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:ZZ1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });


    // Get the spreadsheet URL
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    return NextResponse.json({
      id: formId,
      url: `https://docs.google.com/forms/d/${formId}/viewform`,
      spreadsheetId,
      spreadsheetUrl
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Form creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create form',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500, headers: corsHeaders }
    );
  }
}