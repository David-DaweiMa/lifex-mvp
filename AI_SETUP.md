# LifeX AI Feature Setup Guide

## Overview

LifeX integrates OpenAI GPT-5 Nano to provide intelligent chat and recommendation features. The AI assistant can help users discover local services in New Zealand, provide personalized recommendations, and answer related questions.

## Features

### 🤖 AI Chat Assistant
- Natural language conversation
- Personalized recommendations
- Context understanding
- Follow-up question suggestions

### 🎯 Intelligent Recommendation System
- User preference-based recommendations
- Keyword matching
- Rating and review analysis
- Real-time availability checking

### 💡 Intelligent Features
- User preference extraction
- Conversation history management
- Multi-turn conversation support
- Error handling and fallback mechanisms

## Environment Configuration

### 1. OpenAI API Key Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get an API key
3. Copy `.env.example` to `.env.local`
4. Set your OpenAI API key:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Optional Configuration

```bash
# Specify AI model (default: gpt-5-nano)
OPENAI_MODEL=gpt-5-nano

# Other environment variables
NODE_ENV=development
```

## API Endpoints

### POST /api/ai

Handles AI-related requests, supporting the following types:

#### 1. Conversation Request
```json
{
  "type": "conversation",
  "data": {
    "message": "User message",
    "conversationHistory": [
      {"role": "user", "content": "User message"},
      {"role": "assistant", "content": "AI response"}
    ],
    "context": {
      "userPreferences": ["family-friendly", "work-friendly"]
    }
  }
}
```

#### 2. Recommendation Request
```json
{
  "type": "recommendations",
  "data": {
    "query": "Recommend cafes",
    "userPreferences": ["work-friendly", "quiet"],
    "location": "Auckland",
    "budget": "$$"
  }
}
```

#### 3. Reasoning Request
```json
{
  "type": "reasoning",
  "data": {
    "business": {...},
    "userQuery": "Why recommend this?",
    "userPreferences": ["family-friendly"]
  }
}
```

## Usage Examples

### Basic Chat
```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'conversation',
    data: {
      message: 'Hello, I need help finding a good restaurant in Auckland',
      conversationHistory: [],
      context: {
        userPreferences: ['family-friendly', 'budget-conscious']
      }
    }
  })
});

const result = await response.json();
console.log(result.message);
```

### Get Recommendations
```javascript
const response = await fetch('/api/ai', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'recommendations',
    data: {
      query: 'Find coffee shops near me',
      userPreferences: ['quiet', 'good-wifi'],
      location: 'Wellington CBD',
      budget: '$$'
    }
  })
});

const result = await response.json();
console.log(result.recommendations);
```

## Configuration Options

### Model Selection
You can choose different AI models by setting the `OPENAI_MODEL` environment variable:

```bash
# GPT-5 Nano (recommended for most use cases)
OPENAI_MODEL=gpt-5-nano

# GPT-4 Turbo (for more complex reasoning)
OPENAI_MODEL=gpt-4-turbo

# GPT-3.5 Turbo (for faster responses)
OPENAI_MODEL=gpt-3.5-turbo
```

### Response Format
The AI service supports different response formats:

#### JSON Format (Default)
```json
{
  "message": "AI response text",
  "recommendations": ["business_id_1", "business_id_2"],
  "confidence": 0.85,
  "suggestedQueries": ["related query 1", "related query 2"]
}
```

#### Plain Text Format
```json
{
  "format": "text",
  "message": "Plain text response without structured data"
}
```

## Error Handling

### Common Error Scenarios

#### 1. API Key Issues
```json
{
  "error": "OpenAI API key not configured",
  "fallback": true,
  "message": "Using fallback recommendations"
}
```

#### 2. Rate Limiting
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "message": "Please try again in 1 minute"
}
```

#### 3. Model Unavailable
```json
{
  "error": "Model not available",
  "fallbackModel": "gpt-3.5-turbo",
  "message": "Using fallback model"
}
```

### Fallback Mechanisms

When the primary AI service is unavailable, the system provides fallback responses:

1. **Cached Recommendations**: Use previously successful recommendations
2. **Keyword Matching**: Simple keyword-based business matching
3. **Popular Items**: Return most popular businesses in the category

## Performance Optimization

### Response Time Optimization
- Use appropriate model sizes for different use cases
- Implement caching for common queries
- Use streaming responses for long conversations

### Cost Optimization
- Monitor API usage and costs
- Implement request batching where possible
- Use fallback mechanisms to reduce API calls

## Testing

### Test AI Functionality
```bash
# Test basic conversation
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "type": "conversation",
    "data": {
      "message": "Hello, how are you?",
      "conversationHistory": []
    }
  }'

# Test recommendations
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "type": "recommendations",
    "data": {
      "query": "Find restaurants in Auckland"
    }
  }'
```

### Monitor Performance
```bash
# Check API response times
curl -w "@curl-format.txt" -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"type": "conversation", "data": {"message": "test"}}'
```

## Troubleshooting

### Common Issues

#### 1. Slow Response Times
- Check OpenAI API status
- Verify network connectivity
- Consider using a different model

#### 2. Inaccurate Responses
- Review system prompts
- Check user context data
- Verify business data quality

#### 3. API Errors
- Check API key validity
- Verify account billing status
- Review rate limits

### Debug Mode
Enable debug mode to get detailed logs:

```bash
DEBUG=ai:* npm run dev
```

## Best Practices

### 1. Context Management
- Maintain conversation history for better responses
- Include user preferences in requests
- Provide location context when relevant

### 2. Error Handling
- Always handle API errors gracefully
- Implement fallback mechanisms
- Provide user-friendly error messages

### 3. Performance
- Cache common responses
- Use appropriate model sizes
- Monitor API usage and costs

### 4. Security
- Never expose API keys in client-side code
- Validate and sanitize user inputs
- Implement rate limiting

## Support

For AI-related issues or questions:
- Check the [OpenAI Documentation](https://platform.openai.com/docs)
- Review the [LifeX AI Service Code](src/lib/ai.ts)
- Contact the development team

## Updates

This guide will be updated as new AI features are added to LifeX. Check the changelog for the latest updates.
