"use client"

import { FormQuestion } from "@/lib/types"

interface TypeformPreviewProps {
  title: string
  questions: FormQuestion[]
  formUrl?: string | null
}

export function TypeformPreview({ title, questions, formUrl }: TypeformPreviewProps) {
  if (formUrl) {
    return (
      <iframe
        src={formUrl}
        className="w-full h-[600px] border-0"
        allow="autoplay; fullscreen;"
      />
    )
  }

  // Fallback preview when form URL is not available
  return (
    <div className="max-w-2xl mx-auto bg-black text-white rounded-lg overflow-hidden">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">{title}</h1>
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id || index} className="opacity-50 hover:opacity-100 transition-opacity">
              <p className="text-xl mb-2">
                {question.text}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </p>
              {question.description && (
                <p className="text-gray-400 mb-4">{question.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 