# Supabase Integration Guide

This guide explains how to set up Supabase for the HP Indigo Pricing Calculator.

## Quick Start

### 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: "HP Indigo Calculator" (or your choice)
   - Database password: Choose a strong password
   - Region: Select closest to your users
5. Click "Create Project" and wait for setup

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### 3. Configure the Application

1. Open `/js/supabase.js`
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

### 4. Create Database Tables

1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `/sql/schema.sql`
4. Click "Run" to create all tables and policies

### 5. Import Paper Stock Data (Optional)

If you want to import existing paper stock data:

1. In SQL Editor, create a new query
2. Run this script:

```sql
-- Import existing paper stocks
INSERT INTO public.paper_stocks (code, brand, type, finish, size, weight, cost_per_sheet, display_name) VALUES
  ('LYNODI312FSC', 'Lynx', 'text_stock', 'Uncoated', '13x19', '60#', 0.08548, '60# Text Uncoated'),
  ('LYNO416FSC', 'Lynx', 'text_stock', 'Uncoated', '13x19', '80#', 0.11397, '80# Text Uncoated'),
  ('LYNOC76FSC', 'Lynx', 'cover_stock', 'Uncoated', '13x19', '80#', 0.22408, '80# Cover Uncoated'),
  ('LYNOC95FSC', 'Lynx', 'cover_stock', 'Uncoated', '13x19', '100#', 0.28010, '100# Cover Uncoated'),
  ('LYNODIC11413FSC', 'Lynx', 'cover_stock', 'Uncoated', '13x19', '120#', 0.38147, '120# Cover Uncoated'),
  ('COUDCCDIC123513FSC', 'Cougar', 'cover_stock', 'Uncoated', '13x19', '130#', 0.53800, '130# Cover Uncoated'),
  ('PACDIS42FSC', 'Pacesetter', 'text_stock', 'Silk', '13x19', '80#', 0.07702, '80# Text Silk'),
  ('PACDIS52FSC', 'Pacesetter', 'text_stock', 'Silk', '13x19', '100#', 0.09536, '100# Text Silk'),
  ('PACDISC7613FSC', 'Pacesetter', 'cover_stock', 'Silk', '13x19', '80#', 0.14204, '80# Cover Silk'),
  ('PACDISC9513FSC', 'Pacesetter', 'cover_stock', 'Silk', '13x19', '100#', 0.17756, '100# Cover Silk'),
  ('PACDISC12413FSC', 'Pacesetter', 'cover_stock', 'Silk', '13x19', '130#', 0.23176, '130# Cover Silk')
ON CONFLICT (code) DO NOTHING;
```

## Features Overview

### What This Integration Adds:

1. **User Authentication**
   - Email/password sign up and login
   - Persistent sessions
   - Protected routes for user data

2. **Cloud Storage**
   - Shopping carts saved to database
   - Quotes and pricing history
   - User preferences

3. **Admin Panel** (optional)
   - Update paper prices
   - Modify pricing formulas
   - View analytics

4. **Multi-Device Sync**
   - Cart syncs across devices
   - Access quotes from anywhere
   - Real-time updates

## Testing the Integration

1. Open the application in your browser
2. Check the console for:
   - ✅ "Supabase client initialized" - Success!
   - ⚠️ "Supabase credentials not configured" - Need to add credentials

3. Try the sign-up flow:
   - Click "Sign In" in navigation
   - Create a new account
   - Your cart will now persist!

## Security Notes

- Never commit your actual Supabase credentials to Git
- The anon/public key is safe for client-side use
- Row Level Security (RLS) protects user data
- Admin features require special role assignment

## Troubleshooting

### "Supabase credentials not configured"
- Make sure you've updated `/js/supabase.js` with real values
- Check for typos in the URL or key

### Tables not found
- Run the schema.sql file in SQL Editor
- Make sure all queries completed successfully

### Authentication not working
- Check that email confirmations are disabled for testing
- Go to Authentication > Settings > Email Auth > Disable "Confirm email"

## Next Steps

1. **Enable Email Confirmation** (for production)
   - Authentication > Settings > Enable confirm email

2. **Set Up Email Templates**
   - Authentication > Email Templates
   - Customize confirmation and reset emails

3. **Configure Backup**
   - Database > Backups
   - Enable point-in-time recovery

4. **Monitor Usage**
   - Check dashboard for API usage
   - Set up alerts for limits

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub Issues: For app-specific problems