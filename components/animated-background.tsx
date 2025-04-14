"use client"

import { motion, AnimatePresence } from "framer-motion"

interface AnimatedBackgroundProps {
  platform: string | null
}

export function AnimatedBackground({ platform }: AnimatedBackgroundProps) {
  const getBackgroundColor = () => {
    switch (platform) {
      case 'google':
        return 'bg-purple-500/5'
      case 'typeform':
        return 'bg-blue-500/5'
      case 'surveymonkey':
        return 'bg-green-500/5'
      default:
        return 'bg-transparent'
    }
  }

  return (
    <AnimatePresence>
      {platform && (
        <motion.div
          key={platform}
          className={`fixed inset-0 z-0 ${getBackgroundColor()}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
} 