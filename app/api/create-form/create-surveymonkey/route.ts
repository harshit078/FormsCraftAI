import { NextRequest } from 'next/server';
import axios from 'axios';

const SURVEYMONKEY_API_URL = 'https://api.surveymonkey.com/v3';

// This function strictly follows SurveyMonkey's API documentation
function formatQuestions(questions: any[]) {
  return questions.map((question, index) => {
    const formattedQuestion: any = {
      position: index + 1,
      headings: [
        {
          heading: question.text || "Untitled Question"
        }
      ],
      required: question.required || false
    };

    // Map our question types to SurveyMonkey's family/subtype combinations
    switch (question.type) {
      case 'short_answer':
        formattedQuestion.family = "single_textbox";
        formattedQuestion.subtype = "single_row";
        break;
        
      case 'paragraph':
        formattedQuestion.family = "single_textbox";
        formattedQuestion.subtype = "multi_row";
        break;
        
      case 'multiple-choice':
        formattedQuestion.family = "multiple_choice";
        formattedQuestion.subtype = "vertical";
        
        // Format choices for multiple choice questions
        if (question.options && Array.isArray(question.options) && question.options.length > 0) {
          formattedQuestion.answers = {
            choices: question.options.map((option: string, optIndex: number) => ({
              position: optIndex + 1,
              text: option
            }))
          };
        } else {
          // Default choices if none provided
          formattedQuestion.answers = {
            choices: [
              { position: 1, text: "Option 1" },
              { position: 2, text: "Option 2" }
            ]
          };
        }
        break;
        
      case 'email':
        formattedQuestion.family = "single_textbox";
        formattedQuestion.subtype = "email";
        break;
        
      default:
        // Default to single textbox if type is unknown
        formattedQuestion.family = "single_textbox";
        formattedQuestion.subtype = "single_row";
        break;
    }

    return formattedQuestion;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { title, questions } = await req.json();

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return new Response('Missing or invalid required fields', { status: 400 });
    }

    // Create a survey with minimal required fields first
    const createSurveyResponse = await axios.post(
      `${SURVEYMONKEY_API_URL}/surveys`,
      {
        title: title,
        language: "en"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SURVEYMONKEY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const surveyId = createSurveyResponse.data.id;

    // Format questions according to SurveyMonkey's specification
    const formattedQuestions = formatQuestions(questions);

    // Add page with questions to the survey
    await axios.post(
      `${SURVEYMONKEY_API_URL}/surveys/${surveyId}/pages`,
      {
        title: "Page 1",
        description: "",
        position: 1,
        questions: formattedQuestions
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SURVEYMONKEY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Create web collector
    const collectorResponse = await axios.post(
      `${SURVEYMONKEY_API_URL}/surveys/${surveyId}/collectors`,
      {
        type: "weblink",
        name: "Web Link",
        thank_you_message: "Thank you for completing the survey!"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.SURVEYMONKEY_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return new Response(
      JSON.stringify({
        id: surveyId,
        url: collectorResponse.data.url
      }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('SurveyMonkey API Error:', error.response?.data || error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to create survey',
        details: error.response?.data?.error?.message || error.message
      }),
      {
        status: error.response?.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}