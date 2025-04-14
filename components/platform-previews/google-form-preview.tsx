"use client"

import { FormQuestion } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface GoogleFormPreviewProps {
  title: string
  questions: FormQuestion[]
  formUrl?: string | null
}

export function GoogleFormPreview({ title, questions }: GoogleFormPreviewProps) {
  return (
    <div className="max-w-2xl mx-auto bg-black rounded-lg shadow-lg overflow-hidden">
      {/* Google Forms Header */}
      <div className="border-t-8 border-primary p-6">
        <h1 className="text-3xl font-normal mb-4">{title}</h1>
      </div>

      {/* Questions */}
      <div className="space-y-6 p-6">
        <AnimatePresence mode="popLayout">
          {questions.map((question, index) => (
            <motion.div
              key={question.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-black rounded-lg border p-4"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm text-muted-foreground">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium mb-2">
                    {question.text}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </p>
                  {question.description && (
                    <p className="text-sm text-muted-foreground mb-4">{question.description}</p>
                  )}
                  
                  {/* Render different input types based on question type */}
                  {renderQuestionInput(question)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function renderQuestionInput(question: FormQuestion) {
  switch (question.type) {
    case 'short_answer':
      return <input type="text" className="w-full p-2 border rounded-md" placeholder="Your answer" />
    
    case 'paragraph':
      return <textarea className="w-full p-2 border rounded-md" rows={3} placeholder="Your answer" />
    
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center gap-2">
              <input type="radio" name={`question-${question.id}`} className="rounded-full" />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )
    
    // Add more cases for other question types
    
    default:
      return <input type="text" className="w-full p-2 border rounded-md" placeholder="Your answer" />
  }
} 