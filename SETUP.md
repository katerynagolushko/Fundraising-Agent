# Supabase + Auth Setup Guide

## 1. Supabase Setup

### Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Wait for it to initialize (~2 minutes)

### Run Database Schema
1. In Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Copy contents of `supabase-schema.sql`
4. Paste and click **Run**

### Get API Keys
1. Go to **Settings** → **API**
2. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - service_role key (keep secret!)

## 2. Google OAuth Setup

### Create Google OAuth App
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-vercel-domain.vercel.app/api/auth/callback/google`
7. Click **Create**
8. Copy **Client ID** and **Client Secret** to `.env.local`:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## 3. NextAuth Secret

Generate a random secret:
```bash
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

## 4. Vercel Environment Variables

When deploying to Vercel, add ALL environment variables:
1. Go to Vercel → Your project → **Settings** → **Environment Variables**
2. Add all variables from `.env.local`
3. Make sure to update `NEXTAUTH_URL` to your Vercel domain
4. Redeploy

## 5. Test Authentication

1. Run `npm run dev`
2. Go to http://localhost:3000/auth/signin
3. Click "Continue with Google"
4. Sign in
5. Should redirect to `/dashboard`

## 6. How It Works

- **Upload deck** → Saves to Supabase `profiles` table
- **Find investors** → Saves to `investors` table linked to your profile
- **Update status** → Updates `investors` table
- **Dashboard** → Shows all your saved searches
- **Sign out/in** → All data persists!

## Troubleshooting

**"Invalid session" error:**
- Check `NEXTAUTH_SECRET` is set
- Make sure `NEXTAUTH_URL` matches your domain

**"Database error":**
- Verify Supabase schema was run successfully
- Check RLS policies are enabled

**"OAuth error":**
- Verify redirect URIs in Google Console match exactly
- Check client ID and secret are correct
