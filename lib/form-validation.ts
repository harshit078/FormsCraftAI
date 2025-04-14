import type { FormQuestion } from "./types"

interface ValidationResult {
  valid: boolean
  error: string | null
}

export function validateAnswer(answer: string, question: FormQuestion): ValidationResult {
  // Check if required field is empty
  if (question.required && !answer.trim()) {
    return {
      valid: false,
      error: "This field is required.",
    }
  }

  // Validate based on question type
  switch (question.type) {
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (answer && !emailRegex.test(answer)) {
        return {
          valid: false,
          error: "Please enter a valid email address.",
        }
      }
      break

    case "number":
      const numberRegex = /^\d+$/
      if (answer && !numberRegex.test(answer)) {
        return {
          valid: false,
          error: "Please enter a valid number.",
        }
      }
      break

    case "multiple-choice":
      if (answer && question.options && !question.options.includes(answer)) {
        return {
          valid: false,
          error: `Please select one of the following options: ${question.options.join(", ")}`,
        }
      }
      break
  }

  return {
    valid: true,
    error: null,
  }
}

