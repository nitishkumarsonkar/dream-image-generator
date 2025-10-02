# Supabase Database Setup

This guide will help you set up the database tables for the Dream Image Generator project.

## Quick Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Run Database Migration
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-setup-simple.sql`
4. Click **Run** to execute the SQL

### 3. Configure Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

### 4. Install Dependencies
```bash
npm install @supabase/ssr @supabase/supabase-js
```

## Database Schema

### Tables Created

#### `profiles`
- Stores user profile information
- Automatically created when user signs up
- Fields: `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`

#### `prompt_library`
- Stores user-generated prompts
- Supports public/private visibility
- Fields: `id`, `user_id`, `title`, `prompt`, `category`, `is_public`, `created_at`, `updated_at`

#### `instruments`
- Sample data table for testing
- Fields: `id`, `name`, `type`, `created_at`

### Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Public prompts are visible to all authenticated users
- Automatic profile creation on user signup

## OAuth Setup (Optional)

To enable Google and GitHub sign-in:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Add the client ID and secret to Supabase Auth settings

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add the client ID and secret to Supabase Auth settings

## Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to `/sign-in`
3. Try creating an account
4. Check if you can access the main page (should redirect to sign-in if not authenticated)
5. Test saving prompts in the prompt library

## Troubleshooting

### Common Issues

1. **"Cannot find module '@supabase/ssr'"**
   - Run: `npm install @supabase/ssr @supabase/supabase-js`

2. **Authentication not working**
   - Check your environment variables
   - Verify Supabase URL and keys are correct

3. **Database errors**
   - Make sure you ran the SQL migration
   - Check Supabase logs in the dashboard

4. **OAuth not working**
   - Verify redirect URIs are set correctly
   - Check OAuth provider settings

### Getting Help

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review the project's Cursor rules for coding patterns
- Check the console for error messages
