"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormPreview } from "@/components/form-preview"
import { FormShareLink } from "@/components/form-share-link"
import { Loader2, Sparkles, PlusCircle, Trash2, Save, Pencil, Link } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FormQuestion } from "@/lib/types"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useAuth } from "@/lib/auth-context"
import { UserProfile } from "@/components/user-profile"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { PlatformSelector } from "@/components/platform-selector"
import { AnimatedBackground } from "@/components/animated-background"
import { GoogleAuthProvider, reauthenticateWithPopup } from "firebase/auth"

import {
  staggerContainer,
  fadeUp,
} from "@/components/ui/animation-value";
// Initialize Gemini API (you'll need to add your API key to environment variables)
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)

// Add these optimization constants
const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 } // Reduced from 0.3/0.5
};

const SCROLL_CONTAINER_PROPS = {
  className: "h-[300px] sm:h-[400px] pr-2 sm:pr-4 overscroll-none", // Added overscroll-none
  style: { 
    willChange: 'transform', // Optimize for transforms
    containIntrinsicSize: '0 500px' // Content-size hint
  }
};

function storeFormData(formId: string, formData: any) {
  if (typeof window !== 'undefined') {
    const forms = JSON.parse(localStorage.getItem('forms') || '{}');
    forms[formId] = formData;
    localStorage.setItem('forms', JSON.stringify(forms));
  }
}

export function FormBuilder() {
  const { user, signOut, getGoogleAccessToken, getStoredAccessToken } = useAuth()
  const [prompt, setPrompt] = useState("")
  const [formId, setFormId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState("Conversational Form")
  const [formDescription, setFormDescription] = useState("")
  const [questions, setQuestions] = useState<FormQuestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("create")
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formUrl, setFormUrl] = useState<string | null>(null)
  const [isCreatingGoogleForm, setIsCreatingGoogleForm] = useState(false)
  const [isCreatingTypeform, setIsCreatingTypeform] = useState(false)
  const [isCreatingSurveyMonkey, setIsCreatingSurveyMonkey] = useState(false)
  const { refreshToken } = useAuth()
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const isCreatingForm = isCreatingGoogleForm || isCreatingTypeform || isCreatingSurveyMonkey
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null)
  const [showFormEditor, setShowFormEditor] = useState(false)
  
  // Reset form when changing tabs
  useEffect(() => {
    if (activeTab === "create") {
      setEditingQuestion(null);
    }
  }, [activeTab]);

  // Load form data when formId changes
  useEffect(() => {
    if (formId && activeTab === "edit") {
      // In a real app, you would fetch the form data here
      // For now, we're using the state that's already set
    }
  }, [formId, activeTab]);

  // If somehow accessed without auth, redirect to home
  if (!user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { title, description, questions: generatedQuestions } = await generateQuestionsFromPrompt(prompt);
      
      const formId = Date.now().toString();
      const formUrl = `/form/${formId}`;

      setFormId(formId);
      setFormUrl(formUrl);
      setFormTitle(title);
      setFormDescription(description);
      setQuestions(generatedQuestions);
      setShowFormEditor(true); // Show the editor after generation

      await storeFormData(formId, {
        title,
        description,
        questions: generatedQuestions
      });
      
      // Scroll to the editor section smoothly
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
      
    } catch (err) {
      console.error("Form creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create form. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoogleForm = async () => {
    if (!questions.length) {
      toast.error("Please generate questions first");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in with your Google account");
      return;
    }
    
    setIsCreatingGoogleForm(true);
    setError(null);

    try {
      // Get the stored access token
      const accessToken = getStoredAccessToken();
      
      if (!accessToken) {
        toast.error("Google access token not found. Please sign in again.");
        await signOut();
        return;
      }

      const response = await fetch('/api/create-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: formTitle,
          questions: questions
        })
      });

      // Handle non-JSON responses
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse API response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        if (data.error === "Invalid Credentials") {
          // If token is expired, clear it and ask user to sign in again
          localStorage.removeItem('googleAccessToken');
          toast.error("Session expired. Please sign in again.");
          await signOut();
          return;
        }
        throw new Error(data.error || 'Failed to create Google Form');
      }
      
      setFormUrl(data.url);
      setFormId(data.id);
      setActiveTab("preview");
      toast.success("Google Form created successfully!");
      
      // Open the form in a new tab
      window.open(data.url, '_blank');
      
    } catch (error) {
      console.error("Form creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create form";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingGoogleForm(false);
    }
  };

  async function handleCreateTypeform() {
    if (!questions.length) {
      toast.error("Please generate questions first");
      return;
    }
  
    setIsCreatingTypeform(true);
    setError(null);
  
    try {
      const typeformData = {
        title: formTitle,
        fields: questions.map(question => ({
          title: question.text,
          type: mapQuestionTypeToTypeform(question.type),
          validations: {
            required: question.required
          },
          properties: question.type === 'multiple-choice' ? {
            choices: question.options?.map(option => ({
              label: option
            })) || []
          } : undefined
        }))
      };

      // Log what we're sending for debugging
      console.log('Sending Typeform creation request:', typeformData);

      const response = await fetch('/api/create-form/create-typeform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(typeformData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create Typeform');
      }

      const responseData = await response.json();
      setFormId(responseData.id);
      setFormUrl(responseData.url);
      setActiveTab("preview");
  
      toast.success("Typeform created successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create Typeform";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingTypeform(false);
    }
  }

  // Add this helper function to map question types
  function mapQuestionTypeToTypeform(type: string): string {
    const typeMap: { [key: string]: string } = {
      'short_answer': 'short_text',
      'paragraph': 'long_text',
      'multiple-choice': 'multiple_choice',
      'email': 'email',
      'number': 'number',
      'rating': 'rating',
      'date': 'date',
      'time': 'time'
    };

    return typeMap[type] || 'short_text';
  }

  async function generateQuestionsFromPrompt(prompt: string): Promise<{
    title: string;
    description: string;
    questions: FormQuestion[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const systemPrompt = `You are a form creation assistant. Create a form based on this description: "${prompt}"

      Important: Respond ONLY with a JSON object in this exact format, with no additional text:
      {
        "title": "A clear, concise title for the form",
        "description": "A detailed description of the form's purpose",
        "questions": [
          {
            "text": "The actual question text",
            "type": "short_answer|paragraph|multiple-choice|checkbox|dropdown|file_upload|rating|grid|checkbox_grid|date|time|email",
            "required": true,
            "description": "Optional help text for the question",
            "options": ["Option 1", "Option 2"] // For choice-based questions
            "low": 1,        // For rating questions
            "high": 5,       // For rating questions
            "lowLabel": "", // For rating questions
            "highLabel": "", // For rating questions
            "rows": [],     // For grid questions
            "columns": []   // For grid questions
          }
        ]
      }

      Always include email and name fields as required questions.
      Create appropriate questions based on the prompt context.`;

      // Get response from Gemini
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const text = response.text();
      
      console.log("Gemini response:", text); // Add this for debugging

      // Try to parse the response as JSON
      try {
        // Clean the response text in case Gemini adds any markdown formatting
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsedResponse = JSON.parse(cleanedText);
        
        // Validate the response structure
        if (!parsedResponse.title || !Array.isArray(parsedResponse.questions)) {
          console.error("Invalid response structure:", parsedResponse);
          throw new Error("Invalid response format from AI");
        }

        // Validate and clean up each question
        const validatedQuestions = parsedResponse.questions.map((q: any) => {
          const question: FormQuestion = {
            text: q.text || "Untitled Question",
            type: validateQuestionType(q.type) as FormQuestion["type"],
            required: Boolean(q.required),
            description: q.description || "",
            options: [],
            low: q.low || 1,
            high: q.high || 5,
            lowLabel: q.lowLabel || "",
            highLabel: q.highLabel || "",
            rows: q.rows || [],
            columns: q.columns || []
          };

          // Add options only for multiple-choice questions
          if (question.type === "multiple-choice" && Array.isArray(q.options)) {
            question.options = q.options.map(String);
          }

          return question;
        });

        return {
          title: parsedResponse.title,
          description: parsedResponse.description,
          questions: validatedQuestions
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError, "Raw response:", text);
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      console.error("Error in Gemini API call:", error);
      // Use the fallback question generation
      return generateFallbackQuestions(prompt);
    }
  }

  // Helper function to validate question types
  function validateQuestionType(type: string): "text" | "email" | "number" | "multiple-choice" {
    const validTypes = ["text", "email", "number", "multiple-choice"];
    return validTypes.includes(type) ? (type as any) : "text";
  }

  // Update the fallback function to be more robust
  function generateFallbackQuestions(prompt: string): {
    title: string;
    description: string;
    questions: FormQuestion[];
  } {
    const questions: FormQuestion[] = [];
    const promptLower = prompt.toLowerCase();
    
    // More comprehensive keyword matching
    const keywords = {
      name: ['name', 'full name', 'first name'],
      email: ['email', 'e-mail', 'contact'],
      phone: ['phone', 'telephone', 'mobile'],
      rating: ['rating', 'scale', 'score', 'satisfaction'],
      feedback: ['feedback', 'comments', 'suggestions', 'opinion'],
      age: ['age', 'years old', 'date of birth']
    };

    // Check for name
    if (keywords.name.some(word => promptLower.includes(word))) {
      questions.push({
        text: "What is your name?",
        type: "short_answer",
        required: true
      });
    }

    // Check for email
    if (keywords.email.some(word => promptLower.includes(word))) {
      questions.push({
        text: "What is your email address?",
        type: "short_answer",
        required: true
      });
    }

    // Check for rating
    if (keywords.rating.some(word => promptLower.includes(word))) {
      questions.push({
        text: "How would you rate your experience?",
        type: "multiple-choice",
        required: true,
        options: ["1", "2", "3", "4", "5"]
      });
    }

    // Check for feedback
    if (keywords.feedback.some(word => promptLower.includes(word))) {
      questions.push({
        text: "Do you have any additional comments or feedback?",
        type: "paragraph",
        required: false
      });
    }

    // Always ensure at least one question
    if (questions.length === 0) {
      questions.push({
        text: "Please provide your response",
        type: "short_answer",
        required: true
      });
    }

    // Generate a relevant title
    let title = "Feedback Form";
    if (promptLower.includes("survey")) title = "Survey Form";
    else if (promptLower.includes("contact")) title = "Contact Form";
    else if (promptLower.includes("registration")) title = "Registration Form";
    else if (promptLower.includes("application")) title = "Application Form";

    return {
      title,
      description: prompt,
      questions
    };
  }

  // Memoize handlers
  const updateQuestion = useCallback((index: number, field: keyof FormQuestion, value: any) => {
    setQuestions(questions => {
      const updatedQuestions = [...questions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
      
      if (field === 'type' && value === 'multiple-choice' && !updatedQuestions[index].options) {
        updatedQuestions[index].options = ["Option 1", "Option 2", "Option 3"];
      }
      
      return updatedQuestions;
    });
  }, []);

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const currentOptions = updatedQuestions[questionIndex].options || [];
    updatedQuestions[questionIndex].options = [...currentOptions, `Option ${currentOptions.length + 1}`];
    setQuestions(updatedQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options![optionIndex] = value;
      setQuestions(updatedQuestions);
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options!.filter((_, i) => i !== optionIndex);
      setQuestions(updatedQuestions);
    }
  };


  async function handleCreateSurveyMonkey() {
    if (!questions.length) {
      toast.error("Please generate questions first");
      return;
    }

    setIsCreatingSurveyMonkey(true);
    setError(null);

    try {
      const response = await fetch('/api/create-form/create-surveymonkey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formTitle,
          questions: questions.map(q => ({
            ...q,
            // Ensure options are properly formatted for multiple choice
            options: q.type === 'multiple-choice' ? q.options : undefined
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create SurveyMonkey survey');
      }

      const data = await response.json();
      setFormUrl(data.url);
      setFormId(data.id);
      setActiveTab("preview");

      toast.success("SurveyMonkey survey created successfully!");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create survey";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreatingSurveyMonkey(false);
    }
  }

  const handleCreateForm = async (platform: string) => {
    // Don't proceed if there are no questions
    if (!questions.length) {
      toast.error("Please generate questions first");
      return;
    }

    // Set the selected platform
    setSelectedPlatform(platform);

    // Trigger the respective form creation based on the platform
    try {
      switch (platform) {
        case 'google':
          if (!user) {
            toast.error("Please sign in with your Google account to create forms");
            return;
          }
          await handleCreateGoogleForm();
          break;
        case 'typeform':
          await handleCreateTypeform();
          break;
        case 'surveymonkey':
          await handleCreateSurveyMonkey();
          break;
        default:
          toast.error("Invalid platform selected");
      }
    } catch (error) {
      console.error(`Error creating ${platform} form:`, error);
      // Platform selection should be cleared if form creation fails
      setSelectedPlatform(null);
    }
  };

  const handleCreateGoogleSheet = async () => {
    if (!formId) {
      toast.error("Please create a Google Form first");
      return;
    }

    if (!user) {
      toast.error("Please sign in with your Google account");
      return;
    }

    try {
      setIsLoading(true);

      // Get the stored access token
      const accessToken = getStoredAccessToken();
      
      if (!accessToken) {
        toast.error("Google access token not found. Please sign in again.");
        await signOut();
        return;
      }

      const response = await fetch('/api/create-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          formId: formId,
          title: `${formTitle} (Responses)`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Invalid Credentials") {
          localStorage.removeItem('googleAccessToken');
          toast.error("Session expired. Please sign in again.");
          await signOut();
          return;
        }
        throw new Error(error.error || 'Failed to create response sheet');
      }

      const { spreadsheetUrl } = await response.json();
      setSpreadsheetUrl(spreadsheetUrl);
      
      toast.success("Response sheet created and linked to form!");
      window.open(spreadsheetUrl, '_blank');

    } catch (error) {
      console.error("Error creating response sheet:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create response sheet";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Combined function to generate and create form in one step
  const handleGenerateForm = async (platform: string, promptText: string) => {
    if (!promptText.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }

    if (!platform) {
      toast.error("Please select a platform first");
      return;
    }

    setSelectedPlatform(platform);
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Generate form questions from prompt
      const { title, description, questions: generatedQuestions } = await generateQuestionsFromPrompt(promptText);
      
      // Store form data
      const formId = Date.now().toString();
      const formUrl = `/form/${formId}`;

      setFormId(formId);
      setFormUrl(formUrl);
      setFormTitle(title);
      setFormDescription(description);
      setQuestions(generatedQuestions);
      setShowFormEditor(true);

      await storeFormData(formId, {
        title,
        description,
        questions: generatedQuestions
      });
      
      // Step 2: Create the form on the selected platform
      switch (platform) {
        case 'google':
          if (!user) {
            toast.error("Please sign in with your Google account to create forms");
            setIsLoading(false);
            return;
          }
          await handleCreateGoogleForm();
          break;
        case 'typeform':
          await handleCreateTypeform();
          break;
        case 'surveymonkey':
          await handleCreateSurveyMonkey();
          break;
        default:
          toast.error("Invalid platform selected");
      }
      
      // Scroll to the form preview
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
      
    } catch (err) {
      console.error("Form generation and creation error:", err);
      setError(err instanceof Error ? err.message : "Failed to create form. Please try again.");
      setSelectedPlatform(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.main
      className="min-h-screen flex flex-col relative w-full"
      initial={false} // Disable initial animation
    >
      <AnimatedBackground 
        platform={selectedPlatform}
        // Add performance attributes
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }} 
      />

      {/* Loading Overlay - Simplified animation */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            {...ANIMATION_CONFIG}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-xl font-medium">Preparing your {isCreatingForm ? "form" : "questions"}...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header - Simplified animation */}
      <motion.header
        className="w-full py-3 sm:py-6 px-4 sm:px-6 md:px-12 flex justify-between items-center"
        initial={false}
      >
        <motion.div
          className="flex items-center space-x-2"
          initial="hidden"
          animate="show"
        >
          <div
            className="mb-1 mt-4 relative flex justify-center"
          >
            <img
              src="/logos.png"
              alt="Logo"
              className="h-7 w-auto"
            />
          </div>
        </motion.div>
        <div className="flex items-center space-x-3">
        <AnimatePresence>
          <motion.div
            key="desktop-content"
            className="w-full max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-between items-center"
            >
              <UserProfile />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        </div>

      </motion.header>

      <motion.div
        className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 py-8"
        initial="hidden"
        animate="show"
        variants={staggerContainer(0.1)}>
        {/* Main Headline efreercece */}
        
        <motion.div className="text-center mb-10 md:mb-12" variants={fadeUp} >
          <motion.h1
            className="font-serif text-4xl md:text-5xl lg:text-7xl tracking-tight leading-tight md:leading-tight"
            variants={fadeUp}
          >
            Transform Your forms <br className="hidden sm:block" />
            <span className="text-primary">using AI Prompts into a New Dimension</span>
          </motion.h1>
          
        </motion.div>

      </motion.div>

      {/* <VercelV0Chat /> */}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Form Generation Section */}
        <div className="w-full max-w-6xl mx-auto">
          <Card className="shadow-xl border-2 backdrop-blur-md backdrop-saturate-150 bg-white/50 dark:bg-gray-950/50">
            <CardHeader className="space-y-2 sm:space-y-4 p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    Create a Conversational Form
                  </CardTitle>
                <CardDescription className="text-base sm:text-lg">
                    Describe the information you need to collect, and we'll generate a conversational form for you.
                  </CardDescription>
                </motion.div>
              </CardHeader>
            
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                    <PlatformSelector
                      selectedPlatform={selectedPlatform}
                      onPlatformSelect={setSelectedPlatform}
                onGenerateForm={handleGenerateForm}
                      isCreating={isCreatingForm}
                isGenerating={isLoading && !isCreatingForm}
                prompt={prompt}
                setPrompt={setPrompt}
              />
              
              {error && <p className="text-destructive mt-4 animate-in fade-in text-sm sm:text-base">{error}</p>}
            </CardContent>
          </Card>
        </div>

        {/* Form Editor and Preview Section */}
        <AnimatePresence mode="wait">
          {showFormEditor && (
            <div className="space-y-4 sm:space-y-8">
              {/* Form Editor */}
              <Card className="shadow-lg max-w-6xl mx-auto border-2">
                <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Pencil className="h-5 w-5 text-primary" />
                    Edit Form
                  </CardTitle>
                  <CardDescription>
                        View your form Input
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-4">
              <div>
                    <h3 className="text-lg font-medium">Form Title</h3>
                      <Textarea 
                  id="formTitle" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)} 
                  className="mt-1"
                        disabled
                />
                    </div>

                    <div>
                    <h3 className="text-lg font-medium">Form Description</h3>
                      <Textarea
                        id="formDescription"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="mt-1"
                        placeholder="Describe the purpose of this form..."
                        disabled
                      />
                    </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Questions</h3>
                </div>
                
                    <ScrollArea {...SCROLL_CONTAINER_PROPS}>
                  <div 
                    className="space-y-6"
                    style={{ 
                      containIntrinsicSize: '0 100px',
                      contentVisibility: 'auto'
                    }}
                  >
                    {questions.map((question, index) => (
                      <Card 
                        key={index} 
                        className={`border ${editingQuestion === index ? 'border-primary' : ''}`}
                        // Add content-visibility for better rendering performance
                        style={{ 
                          contentVisibility: 'auto',
                          containIntrinsicSize: '0 200px'
                        }}
                      >
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">Question {index + 1}</div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4 pt-0">
                          {editingQuestion === index ? (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`question-${index}`}>Question Text</Label>
                                <Input
                                  id={`question-${index}`}
                                  value={question.text}
                                  onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                  className="mt-1"
                                />
                              </div>

                                  <div>
                                    <Label htmlFor={`question-${index}-description`}>Question Description</Label>
                                    <Input
                                      id={`question-${index}-description`}
                                      value={question.description || ''}
                                      onChange={(e) => updateQuestion(index, 'description', e.target.value)}
                                      className="mt-1"
                                      placeholder="Optional help text for this question"
                                    />
                                  </div>
                              
                              <div className="flex items-center gap-4">
                                <div className="flex-1">
                                  <Label htmlFor={`question-${index}-type`}>Question Type</Label>
                                  <Select
                                    value={question.type}
                                    onValueChange={(value) => updateQuestion(index, 'type', value)}
                                  >
                                    <SelectTrigger id={`question-${index}-type`} className="mt-1">
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                          <SelectItem value="short_answer">Short Answer</SelectItem>
                                          <SelectItem value="paragraph">Paragraph</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                                          <SelectItem value="checkbox">Checkbox</SelectItem>
                                          <SelectItem value="dropdown">Dropdown</SelectItem>
                                          <SelectItem value="file_upload">File Upload</SelectItem>
                                          <SelectItem value="rating">Rating</SelectItem>
                                          <SelectItem value="grid">Multiple Choice Grid</SelectItem>
                                          <SelectItem value="checkbox_grid">Checkbox Grid</SelectItem>
                                          <SelectItem value="date">Date</SelectItem>
                                          <SelectItem value="time">Time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex items-center space-x-2 pt-6">
                                  <Switch
                                    id={`question-${index}-required`}
                                    checked={question.required}
                                    onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                                  />
                                  <Label htmlFor={`question-${index}-required`}>Required</Label>
                                </div>
                              </div>
                              
                              {question.type === 'multiple-choice' && (
                                <div className="space-y-2">
                                  <Label>Options</Label>
                                  {question.options?.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center gap-2">
                                      <Input
                                        value={option}
                                        onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                        className="flex-1"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index, optionIndex)}
                                        disabled={question.options!.length <= 1}
                                      >
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addOption(index)}
                                    className="mt-2"
                                  >
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Add Option
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div><strong>Text:</strong> {question.text || '(No text provided)'}</div>
                              <div><strong>Type:</strong> {question.type}</div>
                              <div><strong>Required:</strong> {question.required ? 'Yes' : 'No'}</div>
                              {question.type === 'multiple-choice' && question.options && (
                                <div>
                                  <strong>Options:</strong>{' '}
                                  {question.options.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
          
              {/* Form Preview - Simplified animation */}
              <div className="max-w-6xl mx-auto px-4 sm:px-0">
                <FormPreview
                  formId={formId}
                  questions={questions}
                  title={formTitle}
                  selectedPlatform={selectedPlatform}
                  formUrl={formUrl}
                />
                
                {selectedPlatform === 'google' && formId && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleCreateGoogleSheet}
                      className="mt-4"
                      variant="outline"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Response Sheet...
                        </>
                      ) : (
                        <>Generate Response Sheet</>
                      )}
                    </Button>
                  </motion.div>
                )}
                
                {spreadsheetUrl && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <a 
                      href={spreadsheetUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-primary"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      View Response Sheet
                    </a>
                  </div>
                )}
                
                <FormShareLink 
                  formId={formId} 
                  formUrl={formUrl} 
                  formType={selectedPlatform} 
                />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  )
}