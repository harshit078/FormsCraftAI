"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { FormQuestion } from "@/lib/types"
import Image from "next/image"
import { motion } from "framer-motion"

interface ServiceButtonsProps {
  questions: FormQuestion[]
  formTitle: string
  isCreatingGoogleForm: boolean
  isCreatingTypeform: boolean
  isCreatingSurveyMonkey: boolean
  handleCreateGoogleForm: () => void
  handleCreateTypeform: () => void
  handleCreateSurveyMonkey: () => void
}

export function ServiceButtons({
  questions,
  formTitle,
  isCreatingGoogleForm,
  isCreatingTypeform,
  isCreatingSurveyMonkey,
  handleCreateGoogleForm,
  handleCreateTypeform,
  handleCreateSurveyMonkey,
}: ServiceButtonsProps) {
  return (
    <Card className="shadow-md border-2">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="text-lg">Export to Form Services</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <p className="text-sm text-muted-foreground mb-2">
          Create your form on one of these platforms with a single click:
        </p>

        <div className="space-y-3">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Button
              onClick={handleCreateGoogleForm}
              disabled={isCreatingGoogleForm || !questions.length}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 group hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                {isCreatingGoogleForm ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                ) : (
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/icons/google-forms-icon.png"
                      alt="Google Forms"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-blue-600 group-hover:text-blue-700">
                    {isCreatingGoogleForm ? "Creating..." : "Create Google Form"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Export to Google Forms for easy sharing and response collection
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Button
              onClick={handleCreateTypeform}
              disabled={isCreatingTypeform || !questions.length}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 group hover:bg-purple-50 hover:border-purple-200 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                {isCreatingTypeform ? (
                  <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                ) : (
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/icons/typeform-icon.png"
                      alt="Typeform"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-purple-600 group-hover:text-purple-700">
                    {isCreatingTypeform ? "Creating..." : "Create Typeform"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Create a conversational form with Typeform's interactive UI
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
            <Button
              onClick={handleCreateSurveyMonkey}
              disabled={isCreatingSurveyMonkey || !questions.length}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 group hover:bg-green-50 hover:border-green-200 transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                {isCreatingSurveyMonkey ? (
                  <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                ) : (
                  <div className="w-5 h-5 relative flex-shrink-0">
                    <Image
                      src="/icons/surveymonkey-icon.png"
                      alt="SurveyMonkey"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 text-left">
                  <p className="font-medium text-green-600 group-hover:text-green-700">
                    {isCreatingSurveyMonkey ? "Creating..." : "Create SurveyMonkey"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Export to SurveyMonkey for advanced analytics and reporting
                  </p>
                </div>
              </div>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  )
}

