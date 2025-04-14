export type QuestionType = 
  | 'short_answer'
  | 'paragraph'
  | 'multiple-choice'
  | 'checkbox'
  | 'dropdown'
  | 'file_upload'
  | 'rating'
  | 'grid'
  | 'checkbox_grid'
  | 'date'
  | 'time'
  | 'email';

export interface FormQuestion {
  text: string;
  type: "short_answer" | "paragraph" | "multiple-choice" | "checkbox" | "dropdown" | "file_upload" | "rating" | "grid" | "checkbox_grid" | "date" | "time" | "email";
  required: boolean;
  description?: string;
  options?: string[];
  // For rating questions
  low?: number;
  high?: number;
  lowLabel?: string;
  highLabel?: string;
  // For grid questions
  rows?: string[];
  columns?: string[];
  id?: string;
}

export interface Form {
  id: string
  title: string
  description?: string
  questions: FormQuestion[]
  createdAt: string
}

export interface FormResponse {
  formId: string
  answers: Record<string, string>
  timestamp: string
}

