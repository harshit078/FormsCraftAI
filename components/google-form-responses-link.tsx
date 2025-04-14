"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface GoogleFormResponsesLinkProps {
  formId: string
}

export function GoogleFormResponsesLink({ formId }: GoogleFormResponsesLinkProps) {
  const responsesUrl = `https://docs.google.com/forms/d/${formId}/responses`

  return (
    <Card>
      <CardHeader>
        <CardTitle>View Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">You can view and analyze all form responses in Google Forms.</p>
        <Button asChild>
          <a href={responsesUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            View in Google Forms
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}

