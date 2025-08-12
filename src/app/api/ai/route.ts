import { NextRequest, NextResponse } from 'next/server';
import { 
  getAIRecommendations, 
  generateConversationalResponse,
  generateBusinessReasoning,
  extractUserPreferences,
  type AIRecommendationRequest,
  type AIConversationResponse
} from '@/lib/ai';
import { mockBusinesses } from '@/lib/recommendations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'recommendations':
        return await handleRecommendations(data);
      
      case 'conversation':
        return await handleConversation(data);
      
      case 'reasoning':
        return await handleReasoning(data);
      
      default:
        return NextResponse.json(
          { error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleRecommendations(data: AIRecommendationRequest) {
  try {
    const response = await getAIRecommendations(data, mockBusinesses);
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

async function handleConversation(data: {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: { recommendations?: any[]; userPreferences?: string[] };
}) {
  try {
    const response = await generateConversationalResponse(
      data.message,
      data.conversationHistory,
      data.context
    );
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

async function handleReasoning(data: {
  business: any;
  userQuery: string;
  userPreferences?: string[];
}) {
  try {
    const reasoning = await generateBusinessReasoning(
      data.business,
      data.userQuery,
      data.userPreferences
    );
    
    return NextResponse.json({
      success: true,
      data: { reasoning }
    });
  } catch (error) {
    console.error('Reasoning error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reasoning' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const response = await getAIRecommendations(
      { query },
      mockBusinesses
    );
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('AI GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

