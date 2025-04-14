"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, Sparkles, Zap } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Bot className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold">AI Platform</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost">Login</Button>
          <Button>Get Started</Button>
        </motion.div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Transform Your Workflow with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              {" "}AI Power
            </span>
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Harness the power of artificial intelligence to streamline your work,
            boost productivity, and unlock new possibilities.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-32 grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-3xl p-8 border border-neutral-800 hover:border-primary/50 transition-colors">
                <feature.icon className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}

const features = [
  {
    title: "AI-Powered Insights",
    description: "Get deep insights and analytics powered by advanced machine learning algorithms.",
    icon: Sparkles
  },
  {
    title: "Lightning Fast",
    description: "Experience blazing fast performance with our optimized infrastructure.",
    icon: Zap
  },
  {
    title: "Smart Automation",
    description: "Automate repetitive tasks and workflows with intelligent AI assistance.",
    icon: Bot
  }
] 