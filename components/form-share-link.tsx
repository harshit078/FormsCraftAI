"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2, Copy, ExternalLink, Check, Database } from "lucide-react"
import { toast } from "sonner"

interface FormShareLinkProps {
  formId: string | null
  formUrl: string | null
  formType: string | null
}

export function FormShareLink({ formId, formUrl, formType }: FormShareLinkProps) {
  const [copied, setCopied] = useState(false)

  if (!formId || !formUrl) {
    return null
  }

  const responsesUrl = formType === 'google'
    ? `https://docs.google.com/forms/d/${formId}/responses`
    : `https://admin.typeform.com/form/${formId}/results`

  const getShareTitle = () => {
    return formType === 'google' ? 'Share Google Form' : 'Share Typeform'
  }


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className="shadow-md border-2">
      <CardHeader >
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          {getShareTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Form Link</label>
          <div className="flex space-x-2">
            <Input 
              value={formUrl} 
              readOnly 
              className="flex-1"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => window.open(formUrl, '_blank')}
            className="w-full"
            variant="default"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Form
          </Button>
          
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Your Form has been created. Share the link to other users to collect responses.
        </p>
      </CardContent>
    </Card>
  )
}

