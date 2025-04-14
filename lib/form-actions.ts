"use server"

import type { Form, FormResponse } from "./types"
import { parsePrompt } from "./form-parser"
import { cookies } from "next/headers"
import { title } from "process"
import { promises as fs } from 'fs'
import path from 'path'

// Server-side storage (this will persist until server restart)
let formsStore: Map<string, Form> = new Map()
let responsesStore: Map<string, FormResponse[]> = new Map()

const FORMS_FILE = path.join(process.cwd(), 'data', 'forms.json')
const RESPONSES_FILE = path.join(process.cwd(), 'data', 'responses.json')

// Helper to save state to cookies for persistence
const saveStateToCookies = async (formId: string, form: Form) => {
  try {
    const cookieStore = await cookies()

    // Store the form ID in a cookie to track created forms
    const existingFormsStr = cookieStore.get("form_ids")?.value || "[]"
    const existingForms = JSON.parse(existingFormsStr) as string[]

    if (!existingForms.includes(formId)) {
      const updatedForms = [...existingForms, formId]
      cookieStore.set("form_ids", JSON.stringify(updatedForms), {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      })
    }

    // Store the form data in a cookie
    cookieStore.set(`form_${formId}`, JSON.stringify(form), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
  } catch (error) {
    console.error("Error saving to cookies:", error)
  }
}

// Helper to load state from cookies
const loadStateFromCookies = async (formId: string): Promise<Form | null> => {
  try {
    const cookieStore = await cookies()
    const formData = cookieStore.get(`form_${formId}`)?.value

    if (formData) {
      return JSON.parse(formData) as Form
    }

    return null
  } catch (error) {
    console.error("Error loading from cookies:", error)
    return null
  }
}

// Initialize storage files if they don't exist
async function initializeStorage() {
  try {
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    
    try {
      await fs.access(FORMS_FILE)
    } catch {
      await fs.writeFile(FORMS_FILE, '{}')
    }
    
    try {
      await fs.access(RESPONSES_FILE)
    } catch {
      await fs.writeFile(RESPONSES_FILE, '{}')
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
  }
}

// Initialize storage when the server starts
initializeStorage()

export async function createForm(formData: string): Promise<string> {
  try {
    const parsedData = JSON.parse(formData)
    const formId = Date.now().toString()
    
    const form: Form = {
      id: formId,
      title: parsedData.title,
      questions: parsedData.questions,
      createdAt: new Date().toISOString()
    }
    
    // Read existing forms
    const formsJson = await fs.readFile(FORMS_FILE, 'utf-8')
    const forms = JSON.parse(formsJson)
    
    // Add new form
    forms[formId] = form
    
    // Save back to file
    await fs.writeFile(FORMS_FILE, JSON.stringify(forms, null, 2))
    
    return formId
  } catch (error) {
    console.error('Error creating form:', error)
    throw new Error('Failed to create form')
  }
}

export async function getForm(id: string): Promise<Form | null> {
  try {
    const formsJson = await fs.readFile(FORMS_FILE, 'utf-8')
    const forms = JSON.parse(formsJson)
    return forms[id] || null
  } catch (error) {
    console.error('Error getting form:', error)
    throw new Error('Failed to get form')
  }
}

export async function updateForm(formId: string, updates: Partial<Form>): Promise<void> {
  try {
    const existingForm = formsStore.get(formId)
    if (!existingForm) {
      throw new Error('Form not found')
    }

    const updatedForm = {
      ...existingForm,
      ...updates,
    }

    formsStore.set(formId, updatedForm)
    console.log('Form updated:', updatedForm) // Debug log
  } catch (error) {
    console.error('Error updating form:', error)
    throw new Error('Failed to update form')
  }
}

export async function submitFormResponse(response: FormResponse): Promise<void> {
  try {
    const existingResponses = responsesStore.get(response.formId) || []
    responsesStore.set(response.formId, [...existingResponses, response])
    console.log('Response submitted:', response) // Debug log
  } catch (error) {
    console.error('Error submitting response:', error)
    throw new Error('Failed to submit response')
  }
}

export async function getFormResponses(formId: string): Promise<FormResponse[]> {
  return responsesStore.get(formId) || []
}

