import { NextRequest } from 'next/server';
import { ChatHistoryManager } from '@/lib/redis';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get('formId');

    if (!formId) {
      return new Response('Missing formId', { status: 400 });
    }

    const history = await ChatHistoryManager.getChatHistory(formId);
    
    return new Response(JSON.stringify(history), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat history API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { formId, message } = body;

    if (!formId || !message) {
      return new Response('Missing required fields', { status: 400 });
    }

    const success = await ChatHistoryManager.addMessage(formId, message);
    
    return new Response(JSON.stringify({ success }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat history API:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 