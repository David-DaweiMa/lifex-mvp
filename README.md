# LifeX MVP - AI-Powered Local Discovery Platform

🥝 **AI-driven local service discovery platform for New Zealand**

🚀 **Latest Update (v2.0)**: Complete UI overhaul with enhanced Chat, Discover, Booking, and Profile pages!

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables (create .env.local file)
cp env.example .env.local
# Then edit .env.local with your actual values

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## Features

- ✨ **AI-Powered Recommendations**: Natural language search for local businesses
- 🎯 **Personalized Results**: Smart matching based on your preferences  
- 📱 **Mobile-First Design**: Optimized for mobile with elegant orange theme
- 🗺️ **Instant Navigation**: One-click directions and phone calls
- 🔍 **Real-time Search**: Fast, responsive search experience

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **AI**: DeepSeek API
- **Deployment**: Vercel
- **Icons**: Lucide React

## Project Structure

```
lifex-mvp/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   └── LifeXApp.tsx    # Main app component
│   └── lib/               # Utilities and types
│       ├── types.ts        # TypeScript interfaces
│       ├── supabase.ts     # Supabase client
│       └── recommendations.ts # Business data and logic
├── public/                # Static assets
└── README.md              # This file
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Configuration (optional)
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## Development

```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # Run TypeScript checks
npm run format     # Format code with Prettier
npm run format:check # Check code formatting
```

## Deployment

The app is optimized for Vercel deployment:

1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Submit pull request

## License

Private - All rights reserved

---

**LifeX** - Explore Kiwi's hidden gems with AI 🚀