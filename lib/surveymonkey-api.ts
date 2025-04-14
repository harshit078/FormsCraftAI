import axios from 'axios';

const SURVEYMONKEY_API_URL = 'https://api.surveymonkey.com/v3';

export class SurveyMonkeyClient {
  private accessToken: string;
  
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${SURVEYMONKEY_API_URL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        data
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('SurveyMonkey API rate limit exceeded');
      }
      throw error;
    }
  }

  async createSurvey(title: string, questions: any[]) {
    const surveyData = {
      title,
      pages: [{
        questions: questions.map(this.formatQuestion)
      }]
    };

    return this.request('POST', '/surveys', surveyData);
  }

  private formatQuestion(question: any) {
    // Map your question types to SurveyMonkey question types
    const typeMap: { [key: string]: string } = {
      'short_answer': 'open_ended',
      'paragraph': 'essay',
      'multiple-choice': 'multiple_choice',
      'checkbox': 'checkbox',
      'rating': 'matrix_rating',
      'email': 'open_ended'
    };

    const baseQuestion = {
      type: typeMap[question.type] || 'open_ended',
      heading: question.text,
      required: question.required
    };

    // Add specific properties based on question type
    if (question.type === 'multiple-choice' && question.options) {
      return {
        ...baseQuestion,
        answers: {
          choices: question.options.map((option: string) => ({
            text: option
          }))
        }
      };
    }

    return baseQuestion;
  }
} 