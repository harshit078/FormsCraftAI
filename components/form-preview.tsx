"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { FormQuestion } from "@/lib/types"
import { GoogleFormPreview } from "./platform-previews/google-form-preview"
import { TypeformPreview } from "./platform-previews/typeform-preview"
import { SurveyMonkeyPreview } from "./platform-previews/surveymonkey-preview"

interface FormPreviewProps {
  formId: string | null
  questions: FormQuestion[]
  title: string
  selectedPlatform: string | null
  formUrl: string | null
  onQuestionsReorder?: (reorderedQuestions: FormQuestion[]) => void
}

export function FormPreview({ 
  formId, 
  questions, 
  title, 
  selectedPlatform,
  formUrl,
  onQuestionsReorder 
}: FormPreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize questions with IDs if they don't have them
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: q.id || `question-${index}`
    }));
    setIsLoading(false)
  }, [questions])

  if (isLoading) {
    return (
      <Card className="shadow-md border-2">
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading preview...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-md border-2">
        <CardHeader  >
          <CardTitle className="text-destructive">Preview Error</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Form Preview</span>
          <Badge variant="outline">
            {questions.length} Questions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {selectedPlatform === 'google' && (
          <GoogleFormPreview title={title} questions={questions} formUrl={formUrl} />
        )}
        {selectedPlatform === 'typeform' && (
          <TypeformPreview title={title} questions={questions} formUrl={formUrl} />
        )}
        {selectedPlatform === 'surveymonkey' && (
          <SurveyMonkeyPreview title={title} questions={questions} formUrl={formUrl} />
        )}
        {!selectedPlatform && (
          <p className="text-center text-muted-foreground">
            Select a platform to see the preview
          </p>
        )}
      </CardContent>
    </Card>
  )
}

