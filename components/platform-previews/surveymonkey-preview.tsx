"use client"

import { FormQuestion } from "@/lib/types"

interface SurveyMonkeyPreviewProps {
  title: string
  questions: FormQuestion[]
  formUrl?: string | null
}

export function SurveyMonkeyPreview({ title, questions, formUrl }: SurveyMonkeyPreviewProps) {
  if (formUrl) {
    return (
      <iframe
        src={formUrl}
        className="w-full h-[600px] border-0"
        allow="camera; microphone; autoplay; encrypted-media; fullscreen"
      />
    )
  }

  // Fallback preview when form URL is not available
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border">
      <div className="p-6 bg-[#00BF6F]/10">
        <h1 className="text-2xl font-semibold text-[#00BF6F]">{title}</h1>
      </div>
      <div className="p-6 space-y-6">
        {questions.map((question, index) => (
          <div key={question.id || index} className=" pb-4">
            <div className="flex items-start gap-2">
              <span className="text-[#00BF6F] font-medium">{index + 1}.</span>
              <div>
                <p className="font-medium">
                  {question.text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </p>
                {question.description && (
                  <p className="text-gray-500 text-sm mt-1">{question.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 