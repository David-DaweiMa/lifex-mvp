# LifeX MVP - New Zealand Local Life Platform

## Project Overview

LifeX is an AI-based New Zealand local life recommendation platform that integrates user authentication, quota management, embedded advertising, and intelligent recommendation systems.

## Features

### 🎯 Core Features
- **AI Intelligent Chat**: Local life assistant based on GPT-5 Nano
- **User Quota Management**: Limit feature usage by user type
- **Embedded Advertising**: Intelligent placement, integrated into content flow
- **Business Management**: Support business registration and product publishing
- **Content Publishing**: Trending content and product showcase

### 👥 User Types
- **Free**: Basic platform access with limited features
- **Essential**: Enhanced features with Coly AI assistant
- **Premium**: Full access with both Coly and Max AI assistants

### 📊 Quota System
Each subscription level has different feature usage limits:

| Plan | AI Chat (Hourly) | Products | Trending (Monthly) | Business Features |
|------|------------------|----------|-------------------|-------------------|
| Free | ❌ No AI access | 100 | 10 | ✅ Available |
| Essential | Coly: 50/hour | 100 | 50 | ✅ Available |
| Premium | Coly: 50/hour + Max: 50/hour | 1000 | 200 | ✅ Available |

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-5 Nano
- **Authentication**: Supabase Auth

## Quick Start

### 1. Environment Configuration

Copy the environment variables file:
```bash
cp env.example .env.local
```

Configure the following environment variables:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-5-nano

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Database Setup

#### 2.1 Create Supabase Project
1. Visit [Supabase](https://supabase.com)
2. Create a new project
3. Get the project URL and anonymous key

#### 2.2 Execute Database Scripts
Execute all SQL statements in the `database-schema.sql` file in the Supabase SQL editor.

#### 2.3 Configure RLS Policies
Ensure all tables have Row Level Security enabled and adjust access policies as needed.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing System

### 1. Access Test Pages
Visit [http://localhost:3000/test](http://localhost:3000/test) to view system test pages.

### 2. Test API Endpoints

#### Check Test API Status
```bash
curl http://localhost:3000/api/test
```

#### Test Quota System
```bash
curl "http://localhost:3000/api/test?action=quota"
```

#### Test User System
```bash
curl "http://localhost:3000/api/test?action=user"
```

### 3. Test Chat API

```bash
curl -X POST http://localhost:3000/api/ai \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Recommend some cafes in Auckland",
    "userId": "your_user_id",
    "sessionId": "test_session"
  }'
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── ai/           # AI chat API
│   │   └── test/         # Test API
│   ├── test/             # Test pages
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── pages/            # Page components
│   └── LifeXApp.tsx      # Main app component
├── lib/                   # Utility libraries
│   ├── ai.ts             # AI service
│   ├── authService.ts    # Authentication service
│   ├── quotaService.ts   # Quota management
│   ├── adService.ts      # Advertising service
│   └── supabase.ts       # Supabase configuration
└── types/                # TypeScript type definitions
```

## Core Services

### AI Service (`src/lib/ai.ts`)
- Intelligent conversation generation
- Business recommendations
- User preference extraction

### Quota Service (`src/lib/quotaService.ts`)
- User quota checking
- Usage updates
- Quota reset

### Authentication Service (`src/lib/authService.ts`)
- User registration/login
- Session management
- User profile management

### Advertising Service (`src/lib/adService.ts`)
- Intelligent ad placement
- Relevance matching
- Click tracking

## Development Guide

### Adding New Features
1. Create service files in `src/lib/`
2. Create API routes in `src/app/api/`
3. Create UI components in `src/components/`
4. Update type definitions

### Database Modifications
1. Modify `database-schema.sql`
2. Update type definitions in `src/lib/supabase.ts`
3. Update related service files

### Testing New Features
1. Add test pages in `src/app/test/`
2. Add test APIs in `src/app/api/test/`
3. Update test page UI

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy the project

### Environment Variable Configuration
Ensure the following environment variables are configured in Vercel:
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact:
- Email: support@lifex.co.nz
- Documentation: [Link to documentation]
- Issues: [GitHub Issues](https://github.com/your-repo/issues)