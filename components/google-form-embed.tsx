"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface GoogleFormEmbedProps {
  formUrl: string
}

export function GoogleFormEmbed({ formUrl }: GoogleFormEmbedProps) {
  // Convert the form URL to an embed URL
  const embedUrl = formUrl.includes('?')
    ? `${formUrl}&embedded=true`
    : `${formUrl}?embedded=true`;

  return (
    <Card className="shadow-md border-2">
      <CardContent className="p-0">
      </CardContent>
    </Card>
  )
}

