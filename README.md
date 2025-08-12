# LifeX - AI-Powered Local Discovery App

LifeX is an AI-powered mobile application that helps users discover amazing local services and experiences in New Zealand. Built with Next.js, React, and powered by GPT-5 Nano for intelligent recommendations.

## Features

- 🤖 **AI-Powered Recommendations**: Uses GPT-5 Nano to provide personalized business recommendations
- 🗺️ **Local Discovery**: Find coffee shops, restaurants, activities, and services in New Zealand
- 💬 **Conversational Interface**: Natural language chat with AI assistant
- 📱 **Mobile-First Design**: Optimized for mobile devices with beautiful UI
- 🔄 **Smart Fallbacks**: Graceful degradation when AI is unavailable
- 🎯 **Personalized Experience**: Learns user preferences and provides tailored suggestions

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Custom CSS animations
- **AI**: OpenAI GPT-5 Nano (gpt-5-nano)
- **Database**: Supabase (for future data persistence)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lifex-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Configure your environment variables**
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-5-nano
   
   # Supabase Configuration (optional)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Application Configuration
   NEXT_PUBLIC_APP_NAME=LifeX
   NEXT_PUBLIC_APP_VERSION=0.1.0
   ```

5. **Get your OpenAI API key**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Create an account or sign in
   - Navigate to API Keys section
   - Create a new API key
   - Add it to your `.env.local` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## AI Integration

### GPT-5 Nano Features

The app uses GPT-5 Nano (gpt-5-nano) for:

- **Intelligent Recommendations**: Analyzes user queries and provides personalized business suggestions
- **Conversational Responses**: Natural language interactions with context awareness
- **Business Reasoning**: Generates personalized explanations for why businesses match user needs
- **Preference Learning**: Extracts and learns user preferences from conversations

### AI Architecture

```
User Query → API Route → GPT-5 Nano → Structured Response → UI Update
     ↓
Fallback System (Keyword Matching) if AI fails
```

### API Endpoints

- `POST /api/ai` - Main AI endpoint
  - `type: 'recommendations'` - Get AI-powered recommendations
  - `type: 'conversation'` - Generate conversational responses
  - `type: 'reasoning'` - Generate business reasoning

- `GET /api/ai?query=<search>` - Quick search endpoint

### System Prompts

The AI is configured with specialized prompts for:
- New Zealand culture and local knowledge
- Business recommendation logic
- Conversational tone with Kiwi charm
- Preference understanding and personalization

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── ai/           # AI endpoints
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   └── LifeXApp.tsx      # Main app component
└── lib/                  # Utility libraries
    ├── ai.ts             # AI service layer
    ├── recommendations.ts # Business data & logic
    ├── supabase.ts       # Database client
    └── types.ts          # TypeScript definitions
```

## Usage Examples

### Basic Search
```
User: "I need a coffee shop for remote work"
AI: Recommends cafés with WiFi, quiet atmosphere, laptop-friendly seating
```

### Family Activities
```
User: "Looking for family-friendly activities"
AI: Suggests Auckland Zoo, parks, and kid-friendly restaurants
```

### Budget-Conscious Options
```
User: "Affordable restaurants near me"
AI: Filters by price range and provides budget-friendly options
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Adding New Features

1. **New Business Categories**: Add to `mockBusinesses` in `src/lib/recommendations.ts`
2. **AI Enhancements**: Modify prompts in `src/lib/ai.ts`
3. **UI Components**: Create new components in `src/components/`
4. **API Endpoints**: Add new routes in `src/app/api/`

### Testing AI Integration

1. Ensure your OpenAI API key is set
2. Test with various queries in the chat interface
3. Check browser console for any API errors
4. Verify fallback system works when AI is unavailable

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Make sure to set these in your production environment:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (defaults to gpt-5-nano)
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_VERSION`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## Roadmap

- [ ] Real-time business data integration
- [ ] User accounts and preferences
- [ ] Booking system integration
- [ ] Location-based recommendations
- [ ] Multi-language support
- [ ] Advanced AI features (image recognition, voice input)
- [ ] Social features and reviews
- [ ] Push notifications