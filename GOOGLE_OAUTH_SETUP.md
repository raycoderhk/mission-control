# 🚀 Mission Control - Google OAuth Integration Guide

## 📋 Overview

Adding Google OAuth authentication to Mission Control dashboard using the same pattern as Kanban Board.

**Tech Stack:**
- **Auth:** NextAuth.js (Google Provider)
- **Database:** Supabase (PostgreSQL)
- **User Isolation:** Row Level Security (RLS)
- **Hosting:** Zeabur

---

## 🎯 What We're Building

| Feature | Status | Notes |
|---------|--------|-------|
| Google OAuth Login | ⏳ In Progress | Same as Kanban Board |
| User Data Isolation | ⏳ Pending | Per-user events, goals, friends |
| Personalized Dashboard | ⏳ Pending | Show only user's data |
| Multi-user Support | ⏳ Pending | Each user has own data |

---

## 📦 Step 1: Install Dependencies

```bash
cd mission-control

# Install NextAuth + Supabase
npm install next-auth @supabase/supabase-js @supabase/ssr
```

---

## 🗄️ Step 2: Database Migration

**Run in Supabase SQL Editor:**
https://supabase.com/dashboard/project/hxrgvuzujvagzlaevwtk/sql/new

**Copy and run:** `supabase-migration.sql`

This creates:
- `users` table (shared with Kanban Board)
- `user_settings` table (theme, layout preferences)
- `user_events` table (calendar events)
- `user_goals` table (goal tracker)
- `user_friends` table (friends network)

**All tables have:**
- Row Level Security (RLS) enabled
- User isolation policies
- Proper indexes for performance

---

## 🔐 Step 3: Configure Google OAuth

### 3.1 Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE OAuth client ID"**
3. Application type: **Web application**
4. Name: `Mission Control`
5. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://mission-control.zeabur.app
   ```
6. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://mission-control.zeabur.app/api/auth/callback/google
   ```
7. Click **Create**
8. Copy **Client ID** and **Client Secret**

---

### 3.2 Create .env.local

```bash
# Create .env.local file
cat > .env.local << EOF
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# Supabase
SUPABASE_URL=https://hxrgvuzujvagzlaevwtk.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# NextAuth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=https://mission-control.zeabur.app
EOF
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 📁 Step 4: Files Created

| File | Purpose |
|------|---------|
| `app/api/auth/[...nextauth]/route.ts` | NextAuth API route |
| `app/auth/signin/page.tsx` | Login page |
| `app/auth/signout/page.tsx` | Logout page |
| `components/Providers.tsx` | Session provider |
| `app/layout.tsx` | Updated with Providers |
| `supabase-migration.sql` | Database schema |
| `setup-oauth.js` | Setup script |

---

## 🧪 Step 5: Test Locally

```bash
# Start development server
npm run dev

# Open browser
http://localhost:3000
```

**Expected flow:**
1. Visit http://localhost:3000
2. Click "Sign in with Google"
3. Select Google account
4. Redirected to dashboard
5. User created in Supabase

---

## 🚀 Step 6: Deploy to Zeabur

### 6.1 Update Zeabur Environment Variables

Go to: https://zeabur.com → mission-control project → Settings → Environment Variables

**Add:**
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
SUPABASE_URL=https://hxrgvuzujvagzlaevwtk.supabase.co
SUPABASE_ANON_KEY=xxx
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://mission-control.zeabur.app
```

### 6.2 Redeploy

1. Deployments → ⋮ → Redeploy
2. Wait 2-3 minutes

---

## ✅ Step 7: Verify

1. Visit: https://mission-control.zeabur.app
2. Click "Sign in with Google"
3. Login with your Google account
4. Should see dashboard with YOUR data only

---

## 🔧 Integration with Existing Features

### Current Widgets to Update:

1. **Calendar Widget** → Load from `user_events` table
2. **Goal Tracker** → Load from `user_goals` table
3. **Friends Network** → Load from `user_friends` table
4. **Analytics** → Filter by `user_id`

### Example: Update Analytics API

```typescript
// app/api/analytics/route.ts
import { getServerSession } from "next-auth";

export async function GET() {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Query only user's data
    const { data } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', session.user.id);
    
    return Response.json({ events: data });
}
```

---

## 📊 Database Schema

```
users
├── id (UUID)
├── email (TEXT, unique)
├── name (TEXT)
├── google_id (TEXT, unique)
├── avatar_url (TEXT)
└── created_at, updated_at

user_settings
├── id (UUID)
├── user_id (UUID) → users.id
├── theme (light/dark/system)
├── dashboard_layout (JSONB)
└── created_at, updated_at

user_events
├── id (UUID)
├── user_id (UUID) → users.id
├── title (TEXT)
├── start_time, end_time
├── location (TEXT)
└── created_at, updated_at

user_goals
├── id (UUID)
├── user_id (UUID) → users.id
├── title (TEXT)
├── target_value, current_value
├── status (active/completed/paused)
└── created_at, updated_at

user_friends
├── id (UUID)
├── user_id (UUID) → users.id
├── name (TEXT)
├── email, phone
├── birthday (DATE)
└── created_at, updated_at
```

---

## 🎯 Lessons from Kanban Board

### ✅ What Worked Well:

1. **Email-based user mapping** - Stable identifier across logins
2. **Automatic user creation** - First login creates user record
3. **RLS policies** - Database-level security
4. **Migration script** - Automated schema setup

### ❌ What to Avoid:

1. **Field name mismatches** - Use consistent naming (title vs name)
2. **User ID confusion** - Always use Supabase UUID, not Google ID
3. **Skipping testing** - Test with multiple users early

---

## 🐛 Troubleshooting

### Issue 1: "Could not find users table"

**Solution:** Run `supabase-migration.sql` first

### Issue 2: Login redirects to 404

**Solution:** Check NEXTAUTH_URL matches your domain

### Issue 3: "Invalid callback URL"

**Solution:** Add redirect URI to Google OAuth console

### Issue 4: User sees no data after login

**Solution:** Check RLS policies and user_id mapping

---

## 📚 Resources

- **NextAuth.js Docs:** https://next-auth.js.org
- **Supabase Docs:** https://supabase.com/docs
- **Google OAuth:** https://developers.google.com/identity/protocols/oauth2
- **Kanban Board Implementation:** `/workspace/kanban-zeabur/`

---

## 🎉 Success Criteria

- [ ] Google OAuth login works
- [ ] User created in Supabase on first login
- [ ] Dashboard shows user-specific data
- [ ] Multiple users can login simultaneously
- [ ] Each user sees only their own data
- [ ] Logout works correctly
- [ ] Session persists across page refreshes

---

**Status:** 🌙 Working Overnight  
**Expected Completion:** Morning 2026-03-04  
**Version:** 2.0 - With Google OAuth
