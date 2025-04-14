// import { FormQuestion } from "@/lib/types";
// import { createGoogleForm } from "@/google-forms-api";
// import { createTypeform } from "@/typeform-api";

// export async function generateForm(
//   title: string,
//   description: string,
//   questions: FormQuestion[],
//   type: 'google' | 'typeform',
//   accessToken: string
// ) {
//   // Add required fields if not present
//   const requiredFields = ensureRequiredFields(questions);
  
//   // Batch questions for optimal API usage
//   const batchedQuestions = batchQuestions(requiredFields);
  
//   // Create form with progress tracking
//   const progress = new Progress();
  
//   try {
//     // Create the form based on type
//     const form = type === 'google'
//       ? await createGoogleFormOptimized(title, description, batchedQuestions, accessToken, progress)
//       : await createTypeformOptimized(title, description, batchedQuestions, accessToken, progress);
    
//     return form;
//   } catch (error) {
//     console.error(`Error creating ${type}:`, error);
//     throw error;
//   }
// }

// function ensureRequiredFields(questions: FormQuestion[]): FormQuestion[] {
//   const hasName = questions.some(q => 
//     q.text.toLowerCase().includes('name') && q.type === 'short_answer'
//   );
//   const hasEmail = questions.some(q => q.type === 'email');

//   const requiredFields: FormQuestion[] = [];

//   if (!hasEmail) {
//     requiredFields.push({
//       text: 'Email Address',
//       type: 'email',
//       required: true,
//       description: 'Please enter your email address'
//     });
//   }

//   if (!hasName) {
//     requiredFields.push({
//       text: 'Full Name',
//       type: 'short_answer',
//       required: true,
//       description: 'Please enter your full name'
//     });
//   }

//   return [...requiredFields, ...questions];
// }

// function batchQuestions(questions: FormQuestion[]): FormQuestion[][] {
//   // Group questions into batches for optimal API performance
//   const batchSize = 5;
//   return questions.reduce((acc, curr, i) => {
//     const batchIndex = Math.floor(i / batchSize);
//     if (!acc[batchIndex]) acc[batchIndex] = [];
//     acc[batchIndex].push(curr);
//     return acc;
//   }, [] as FormQuestion[][]);
// } 