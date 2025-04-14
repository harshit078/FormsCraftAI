import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { FormQuestion } from "../../../lib/types";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

// Add this function before createGoogleForm
export function createQuestionItem(question: any) {
  const questionItem: any = {
    title: question.text,
    questionItem: {
      question: {
        required: question.required,
      },
    },
  };

  switch (question.type) {
    case 'text':
      questionItem.questionItem.question.textQuestion = { paragraph: false };
      break;
    case 'paragraph':
      questionItem.questionItem.question.textQuestion = { paragraph: true };
      break;
    case 'email':
      questionItem.questionItem.question.textQuestion = {
        paragraph: false,
        validationType: 'EMAIL'
      };
      break;
    case 'number':
      questionItem.questionItem.question.textQuestion = {
        paragraph: false,
        validationType: 'NUMBER'
      };
      break;
    case 'multiple-choice':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'RADIO',
        options: question.options.map((option: string) => ({ value: option })),
      };
      break;
    case 'checkbox':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'CHECKBOX',
        options: question.options.map((option: string) => ({ value: option })),
      };
      break;
    case 'dropdown':
      questionItem.questionItem.question.choiceQuestion = {
        type: 'DROP_DOWN',
        options: question.options.map((option: string) => ({ value: option })),
      };
      break;
    case 'date':
      questionItem.questionItem.question.dateQuestion = {};
      break;
    case 'time':
      questionItem.questionItem.question.timeQuestion = {};
      break;
    case 'scale':
      questionItem.questionItem.question.scaleQuestion = {
        low: question.low || 1,
        high: question.high || 5,
        lowLabel: question.lowLabel || '',
        highLabel: question.highLabel || '',
      };
      break;
    default:
      questionItem.questionItem.question.textQuestion = { paragraph: false };
  }

  return questionItem;
}

function logDetailedError(error: any, context: string) {
  console.error(`[Google Form Creation Error - ${context}]`, {
    message: error.message,
    stack: error.stack,
    code: error.code,
    details: error.response ? error.response.data : null
  });
}

export async function createGoogleForm(
  formData: { title: string; questions: FormQuestion[] },
  accessToken: string
): Promise<{ id: string; url: string }> {
  try {
    // Validate input
    if (!formData.title) {
      throw new Error("Form title is required");
    }

    // Create OAuth2 client with the access token
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
      token_type: 'Bearer'
    });

    // Initialize Google Forms API
    const forms = google.forms({ 
      version: 'v1', 
      auth: oauth2Client 
    });

    // Detailed payload logging
    console.log('Form Creation Payload:', {
      title: formData.title,
      questionsCount: formData.questions.length,
      questionTypes: formData.questions.map(q => q.type)
    });

    // Create form with detailed request
    const formCreationResponse = await forms.forms.create({
      requestBody: {
        info: {
          title: formData.title,
          documentTitle: formData.title,
        },
      },
    });

    // Validate form creation
    if (!formCreationResponse.data.formId) {
      logDetailedError(
        new Error("No form ID received"), 
        "Form Creation"
      );
      throw new Error("Failed to create Google Form: No form ID received");
    }

    const formId = formCreationResponse.data.formId;

    // Add questions with error tracking
    for (const question of formData.questions) {
      try {
        await forms.forms.batchUpdate({
          formId,
          requestBody: {
            requests: [{
              createItem: {
                item: createQuestionItem(question),
                location: { index: 0 },
              },
            }],
          },
        });
      } catch (questionError) {
        logDetailedError(
          questionError, 
          `Question Addition: ${question.text}`
        );
        // Continue adding other questions
      }
    }

    // Generate form URL
    const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;
    
    return { id: formId, url: formUrl };
  } catch (error) {
    // Comprehensive error logging
    logDetailedError(error, "Overall Process");

    // Specific error handling
    if (error instanceof Error) {
      if (error.message.includes('Invalid Credentials')) {
        throw new Error("Authentication failed. Please re-authenticate.");
      }
      if (error.message.includes('Insufficient Permission')) {
        throw new Error("Insufficient permissions to create forms.");
      }
    }

    throw new Error(`Failed to create Google Form: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getGoogleFormResponses(formId: string, accessToken: string): Promise<any[]> {
  try {
    // Create OAuth2 client with user's access token
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize Google Forms API with user's credentials
    const forms = google.forms({ 
      version: 'v1', 
      auth: oauth2Client 
    });

    const responses = await forms.forms.responses.list({
      formId: formId,
    });

    return responses.data.responses || [];
  } catch (error) {
    console.error("Error getting form responses:", error);
    throw new Error("Failed to get form responses");
  }
}

export async function storeFormData(formId: string, formData: any) {
  // Store in your database or localStorage for demo
  if (typeof window !== 'undefined') {
    const forms = JSON.parse(localStorage.getItem('forms') || '{}');
    forms[formId] = formData;
    localStorage.setItem('forms', JSON.stringify(forms));
  }
}

