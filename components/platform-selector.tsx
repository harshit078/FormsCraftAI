"use client"

import { motion } from "framer-motion"
import { Type, LineChart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface PlatformSelectorProps {
  selectedPlatform: string | null
  onPlatformSelect: (platform: string) => void
  onGenerateForm: (platform: string, prompt: string) => Promise<void>
  isCreating: boolean
  isGenerating: boolean
  prompt: string
  setPrompt: (prompt: string) => void
}

export function PlatformSelector({ 
  selectedPlatform, 
  onPlatformSelect,
  onGenerateForm,
  isCreating,
  isGenerating,
  prompt,
  setPrompt
}: PlatformSelectorProps) {
  const platforms = [
    { 
      id: 'google', 
      name: 'Google Forms', 
      color: 'hover:bg-purple-500/20 hover:text-purple-600 dark:hover:text-purple-400 hover:shadow-purple-500/20',
      selectedColor: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 shadow-purple-500/20'
    },
    { 
      id: 'typeform', 
      name: 'Typeform', 
      icon: Type,
      color: 'hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-blue-500/20',
      selectedColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-blue-500/20'
    },
    { 
      id: 'surveymonkey', 
      name: 'SurveyMonkey', 
      icon: LineChart,
      color: 'hover:bg-green-500/20 hover:text-green-600 dark:hover:text-green-400 hover:shadow-green-500/20',
      selectedColor: 'bg-green-500/20 text-green-600 dark:text-green-400 shadow-green-500/20'
    }
  ]

  const handlePlatformClick = (platformId: string) => {
    if (isCreating || isGenerating) return;
    onPlatformSelect(platformId);
  }

  const isProcessing = isCreating || isGenerating;

  return (
    <div className="space-y-4 w-full">
      {/* Prompt input field - always visible */}
      <Textarea
        placeholder="Example: Create a feedback survey for our recent event..."
        className="min-h-[100px] resize-none focus-visible:ring-primary w-full"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isProcessing}
      />
      
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {platforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            const Icon = platform.icon;
            const isCurrentPlatformProcessing = isProcessing && selectedPlatform === platform.id;

            return (
              <motion.button
                key={platform.id}
                onClick={() => handlePlatformClick(platform.id)}
                disabled={isProcessing}
                className={cn(
                  "relative flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2 rounded-full",
                  "transition-all duration-300 ease-in-out",
                  "backdrop-blur-md backdrop-saturate-150",
                  "border border-white/10",
                  "shadow-lg",
                  "hover:shadow-xl hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "text-sm sm:text-base",
                  isSelected ? platform.selectedColor : "bg-white/10",
                  !isSelected && !isProcessing && platform.color
                )}
                whileHover={{ scale: isProcessing ? 1 : 1.05 }}
                whileTap={{ scale: isProcessing ? 1 : 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                {isCurrentPlatformProcessing && (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1" />
                )}
                <span className="font-medium whitespace-nowrap">
                  {isCurrentPlatformProcessing 
                    ? isGenerating ? "Generating..." : "Creating..." 
                    : platform.name
                  }
                </span>
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-white/5"
                    layoutId="platformHighlight"
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        
        <Button
          onClick={() => selectedPlatform && onGenerateForm(selectedPlatform, prompt)}
          disabled={isProcessing || !prompt.trim() || !selectedPlatform}
          className="transition-all duration-200 bg-white text-black hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isGenerating ? "Generating..." : "Creating..."}
            </>
          ) : (
            "Generate Form"
          )}
        </Button>
      </div>
    </div>
  );
} 