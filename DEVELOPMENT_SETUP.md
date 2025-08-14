# Development Setup Guide

## Email Bounce Issue Resolution

The application has been configured to prevent email bounces during development. Here's what was implemented:

### ✅ **Automatic Email Bounce Prevention**

1. **Development Mode Detection**: The app automatically detects when running in development mode (`NODE_ENV=development`)
2. **Mock Authentication**: In development mode, registration and login use mock data instead of sending real emails
3. **No Email Sending**: Supabase email confirmations are bypassed in development

### **How It Works**

- **Registration**: Creates mock user profiles without sending confirmation emails
- **Login**: Uses mock authentication without real Supabase calls
- **User Management**: All user operations work with simulated data

### **Environment Configuration**

Create a `.env.local` file in the project root with these settings:

```bash
# Development Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Supabase Configuration (only needed for production)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: OpenAI Configuration (only needed for production)
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-5-nano
```

### **Testing the Application**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test registration**:
   - Go to `http://localhost:3000/auth/register`
   - Fill out the form with any email/password
   - Registration should work without email confirmation

3. **Test login**:
   - Go to `http://localhost:3000/auth/login`
   - Use any email/password combination
   - Login should work immediately

4. **Test all features**:
   - Business discovery
   - Chat interface
   - Profile management
   - All features work with mock data

### **Production Deployment**

When deploying to production:

1. Set `NODE_ENV=production`
2. Configure real Supabase credentials
3. Set up proper email providers
4. The app will use real authentication and database

### **Benefits**

- ✅ **No Email Bounces**: Development testing won't affect Supabase email reputation
- ✅ **Fast Development**: No waiting for email confirmations
- ✅ **Full Functionality**: All features work for testing
- ✅ **Easy Setup**: No complex configuration required
- ✅ **Production Ready**: Same code works in production with real services

### **Console Messages**

In development mode, you'll see these console messages:
- `"Development mode: using mock registration to avoid email bounces"`
- `"Development mode: using mock login to avoid email bounces"`
- `"Development mode: returning mock user"`
- `"Development mode: mock logout"`

This confirms the app is running in safe development mode.

### **Troubleshooting**

If you encounter build errors:

1. **Clean Build Cache**:
   ```bash
   Remove-Item -Recurse -Force .next
   npm run build
   ```

2. **TypeScript Errors**: The app uses `NODE_ENV !== 'production'` to detect development mode
3. **Port Conflicts**: The server will automatically use the next available port
4. **File Permission Issues**: Run PowerShell as Administrator if needed

### **Current Status**

✅ **Build**: Successful compilation
✅ **Development Server**: Running on http://localhost:3000
✅ **Email Bounce Prevention**: Active in development mode
✅ **Registration**: Works with mock data
✅ **Login**: Works with mock data
✅ **All Features**: Functional for testing
