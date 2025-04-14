"use server"

import type { FormQuestion } from "./types"

interface ParsedForm {
  title: string
  questions: FormQuestion[]
}

export async function parsePrompt(prompt: string): Promise<ParsedForm> {
  // In a real application, this would use an AI model to parse the prompt
  // For this example, we'll use a simple rule-based approach

  // Extract common form types from the prompt
  const emailRegex = /\b(email|e-mail)\b/i
  const nameRegex = /\b(name|full name|first name|last name)\b/i
  const phoneRegex = /\b(phone|telephone|mobile|cell)\b/i
  const ratingRegex = /\b(rating|scale|score)\b.*?\b(\d+)(?:\s*-\s*|\s+to\s+)(\d+)\b/i
  const feedbackRegex = /\b(feedback|comments|suggestions|opinion)\b/i
  const ageRegex = /\b(age|years old)\b/i

  // Generate a title from the prompt
  let title = "Conversational Form"
  if (prompt.toLowerCase().includes("survey")) {
    title = "Survey Form"
  } else if (prompt.toLowerCase().includes("feedback")) {
    title = "Feedback Form"
  } else if (prompt.toLowerCase().includes("registration")) {
    title = "Registration Form"
  } else if (prompt.toLowerCase().includes("contact")) {
    title = "Contact Form"
  }

  // Generate questions based on the prompt
  const questions: FormQuestion[] = []

  // Check for name field
  if (nameRegex.test(prompt)) {
    questions.push({
      text: "What is your name?",
      type: "text",
      required: true,
    })
  }

  // Check for email field
  if (emailRegex.test(prompt)) {
    questions.push({
      text: "What is your email address?",
      type: "email",
      required: true,
    })
  }

  // Check for phone field
  if (phoneRegex.test(prompt)) {
    questions.push({
      text: "What is your phone number?",
      type: "text",
      required: false,
    })
  }

  // Check for age field
  if (ageRegex.test(prompt)) {
    questions.push({
      text: "What is your age?",
      type: "number",
      required: false,
    })
  }

  // Check for rating field
  const ratingMatch = prompt.match(ratingRegex)
  if (ratingMatch) {
    const min = Number.parseInt(ratingMatch[2])
    const max = Number.parseInt(ratingMatch[3])

    // Create options for the rating
    const options = Array.from({ length: max - min + 1 }, (_, i) => (i + min).toString())

    questions.push({
      text: `On a scale of ${min} to ${max}, how would you rate your experience?`,
      type: "multiple-choice",
      options,
      required: true,
    })
  }

  // Check for feedback field
  if (feedbackRegex.test(prompt)) {
    questions.push({
      text: "Do you have any additional comments or feedback?",
      type: "text",
      required: false,
    })
  }

  // If no questions were generated, add some default ones
  if (questions.length === 0) {
    questions.push(
      {
        text: "What is your name?",
        type: "text",
        required: true,
      },
      {
        text: "What is your email address?",
        type: "email",
        required: true,
      },
      {
        text: "Do you have any feedback for us?",
        type: "text",
        required: false,
      },
    )
  }

  return {
    title,
    questions,
  }
}

