import { NextRequest, NextResponse } from 'next/server';
import typeformClient from '@/typeform-api';

// Strict TypeScript interfaces
interface TypeformField {
  title: string;
  type: 'short_text' | 'email' | 'number' | 'multiple_choice';
  properties?: {
    choices?: Array<{ label: string }>;
  };
  validations: {
    required: boolean;
  };
}

interface TypeformCreateRequest {
  title: string;
  fields: TypeformField[];
}

export async function POST(request: NextRequest) {
  // Detailed logging for debugging
  console.log('Received request to create Typeform');

  try {
    // Parse request body
    const requestBody = await request.json();
    const { title, fields } = requestBody as TypeformCreateRequest;
    
    // Enhanced input validation
    if (!title) {
      console.error('Form title is missing');
      return NextResponse.json(
        { error: 'Form title is required' },
        { status: 400 }
      );
    }

    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      console.error('No valid fields provided');
      return NextResponse.json(
        { error: 'At least one field is required' },
        { status: 400 }
      );
    }
    
    // Validate access token availability
    if (!process.env.TYPEFORM_ACCESS_TOKEN) {
      console.error('Typeform access token is missing in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Typeform token missing' },
        { status: 500 }
      );
    }

    // Log request details
    console.log('Creating Typeform with:', {
      title,
      fieldCount: fields.length,
      fieldTypes: fields.map(f => f.type)
    });

    try {
      // Create the Typeform using the client
      const typeform = await typeformClient.forms.create({
        data: {
          title,
          fields: fields.map((field) => ({
            title: field.title,
            type: field.type,
            properties: field.properties || {},
            validations: {
              required: field.validations.required,
            },
          })),
        },
      });

      // Log success and form details
      console.log('Successfully created Typeform with ID:', typeform.id);
      
      // Return form data with the complete URL
      return NextResponse.json({
        id: typeform.id,
        url: typeform._links.display,
      }, { status: 201 });

    } catch (typeformError: any) {
      // Detailed error logging for Typeform API issues
      console.error('Typeform API Error:', {
        message: typeformError.message,
        status: typeformError.response?.status,
        data: typeformError.response?.data
      });

      // Specific error handling based on error type
      const statusCode = typeformError.response?.status || 500;
      const errorMessage = typeformError.response?.data?.description || 
        typeformError.message || 
        'Failed to create Typeform';

      return NextResponse.json(
        { 
          error: 'Typeform Creation Failed', 
          details: errorMessage,
        },
        { status: statusCode }
      );
    }

  } catch (error: any) {
    // General error handling
    console.error('Unexpected error in Typeform creation:', error);
    return NextResponse.json(
      { 
        error: 'Unexpected error occurred', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}