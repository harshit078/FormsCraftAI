"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFormResponses } from "@/lib/form-actions"
import type { FormResponse } from "@/lib/types"
import { Download, Database, RefreshCw, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FormDataViewerProps {
  formId: string
}

export function FormDataViewer({ formId }: FormDataViewerProps) {
  const [responses, setResponses] = useState<FormResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadResponses = async () => {
    try {
      setIsRefreshing(true)
      const data = await getFormResponses(formId)
      setResponses(data)
    } catch (error) {
      console.error("Failed to load responses:", error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadResponses()

    // Set up polling to check for new responses
    const interval = setInterval(loadResponses, 10000)
    return () => clearInterval(interval)
  }, [formId])

  const downloadResponses = () => {
    const dataStr = JSON.stringify(responses, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = `form-responses-${formId}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (isLoading) {
    return (
      <Card className="shadow-md border-2">
        <CardHeader className="bg-primary/5 border-b">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Form Responses
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading responses...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-md border-2">
      <CardHeader className="bg-primary/5 border-b flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Form Responses
          <Badge variant="outline" className="ml-2">
            {responses.length} {responses.length === 1 ? "Response" : "Responses"}
          </Badge>
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadResponses} disabled={isRefreshing} className="h-8">
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadResponses}
            disabled={responses.length === 0}
            className="h-8"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {responses.length > 0 ? (
          <div className="space-y-4">
            {responses.map((response, index) => (
              <div key={index} className="border p-4 rounded-md hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center">Response #{index + 1}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(response.timestamp)}
                  </div>
                </div>
                <div className="space-y-2 divide-y">
                  {Object.entries(response.answers).map(([question, answer]) => (
                    <div key={question} className="grid grid-cols-1 md:grid-cols-2 gap-2 py-2">
                      <span className="text-sm font-medium">{question}</span>
                      <span className="text-sm break-words md:text-right">{answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-md">
            <Database className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No responses yet.</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Share your form link to start collecting responses.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

