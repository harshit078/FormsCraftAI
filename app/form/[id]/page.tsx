"use client"

import { getForm } from "@/lib/form-actions"
import { useEffect, useState, use } from "react"
import { Loader2 } from "lucide-react"
import type { Form } from "@/lib/types"
import { useSearchParams } from 'next/navigation'

interface FormPageProps {
  params: Promise<{
    id: string
  }>
}

export default function FormPage({ params }: FormPageProps) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params)
  
  const [form, setForm] = useState<Form | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const isTestMode = searchParams.get('test') === 'true'

  useEffect(() => {
    async function loadForm() {
      try {
        console.log('Loading form with ID:', id); // Add this for debugging
        const formData = await getForm(id)
        if (!formData) {
          console.log('Form not found for ID:', id); // Add this for debugging
          setError("Form not found")
          return
        }
        console.log('Form loaded:', formData);
        setForm(formData)
      } catch (err) {
        console.error("Error loading form:", err)
        setError("Failed to load form")
      } finally {
        setLoading(false)
      }
    }

    loadForm()
  }, [id]) // Updated dependency array to use unwrapped id

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading form...</p>
        </div>
      </main>
    )
  }

  if (error || !form) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <h1 className="text-2xl font-bold text-center">Form Error</h1>
          <p className="text-muted-foreground text-center max-w-md">
            {error || "Form not found"}
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Form Builder
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl min-h-screen">
      {isTestMode && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Test Mode - Responses will not be saved
              </p>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-center mb-8">{form.title}</h1>
    </main>
  )
}

