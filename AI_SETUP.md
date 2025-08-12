# GPT-5 Nano AI Setup Guide

This guide will help you set up GPT-5 Nano (gpt-5-nano) integration for the LifeX application.

## Prerequisites

1. **OpenAI Account**: You need an OpenAI account with API access
2. **API Credits**: Ensure you have sufficient credits for API calls
3. **Node.js**: Version 18 or higher

## Step 1: Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create new secret key**
5. Give it a name (e.g., "LifeX AI")
6. Copy the generated key (keep it secure!)

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-5-nano
   
   # Other configurations...
   ```

## Step 3: Test the Integration

1. **Test with Node.js script**:
   ```bash
   # Set your API key (Windows)
   set OPENAI_API_KEY=your_api_key_here
   
   # Set your API key (Mac/Linux)
   export OPENAI_API_KEY=your_api_key_here
   
   # Run the test
   node test-ai.js
   ```

2. **Test with the application**:
   ```bash
   npm run dev
   ```
   Then visit http://localhost:3000 and try asking for recommendations.

## Step 4: Verify AI Features

The following features should now work with AI:

### ✅ Intelligent Recommendations
- Ask: "I need a coffee shop for remote work"
- AI will analyze your query and provide personalized suggestions

### ✅ Conversational Responses
- Natural language interactions
- Context-aware responses
- Kiwi-style friendly tone

### ✅ Business Reasoning
- Personalized explanations for why businesses match your needs
- Consideration of your preferences and requirements

### ✅ Preference Learning
- AI learns from your conversations
- Remembers your preferences for future recommendations

## API Usage and Costs

### GPT-5 Nano Pricing (as of 2024)
- **Input**: $0.15 per 1M tokens
- **Output**: $0.60 per 1M tokens

### Estimated Costs for LifeX
- **Typical query**: ~500 tokens input, ~200 tokens output
- **Cost per query**: ~$0.0002
- **1000 queries**: ~$0.20

### Cost Optimization Tips
1. Use concise prompts
2. Implement caching for similar queries
3. Set reasonable `max_tokens` limits
4. Monitor usage in OpenAI dashboard

## Troubleshooting

### Common Issues

**❌ "API key not found"**
- Check your `.env.local` file
- Ensure the key starts with `sk-`
- Restart your development server

**❌ "Insufficient credits"**
- Check your OpenAI account balance
- Add credits to your account

**❌ "Rate limit exceeded"**
- Wait a few minutes before retrying
- Consider implementing rate limiting

**❌ "Model not found"**
- Ensure you're using `gpt-5-nano`
- Check if the model is available in your region

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```env
DEBUG=openai:*
```

### Fallback System

If AI fails, the app automatically falls back to keyword-based recommendations. Check the browser console for error messages.

## Production Deployment

### Environment Variables for Production

When deploying to Vercel or other platforms:

1. **Vercel Dashboard**:
   - Go to your project settings
   - Add environment variables
   - Set `OPENAI_API_KEY` and `OPENAI_MODEL`

2. **Security**:
   - Never commit API keys to version control
   - Use environment variables in production
   - Consider using API key rotation

### Monitoring

1. **OpenAI Dashboard**: Monitor usage and costs
2. **Application Logs**: Check for AI errors
3. **User Feedback**: Monitor recommendation quality

## Advanced Configuration

### Custom System Prompts

Edit `src/lib/ai.ts` to customize the AI behavior:

```typescript
const SYSTEM_PROMPT = `Your custom prompt here...`;
```

### Model Selection

You can switch between different models:

```env
# For faster, cheaper responses
OPENAI_MODEL=gpt-4o-mini

# For more capable responses
OPENAI_MODEL=gpt-4o

# For the latest model
OPENAI_MODEL=gpt-5-nano
```

### Temperature Settings

Adjust creativity vs consistency:

```typescript
// More creative responses
temperature: 0.8

// More consistent responses  
temperature: 0.3
```

## Support

If you encounter issues:

1. Check the [OpenAI Documentation](https://platform.openai.com/docs)
2. Review error messages in browser console
3. Test with the provided `test-ai.js` script
4. Check your API key and credits

## Next Steps

Once AI is working:

1. **Add more business data** to `src/lib/recommendations.ts`
2. **Customize prompts** for better recommendations
3. **Implement caching** to reduce API calls
4. **Add user preference storage** for better personalization
5. **Integrate with real business APIs** for live data
