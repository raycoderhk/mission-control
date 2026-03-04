-- Mission Control - Database Schema for Google OAuth + User Data
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hxrgvuzujvagzlaevwtk/sql/new

-- ========================================
-- 1. Users Table (if not exists from Kanban)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    google_id TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous insert (for first login)
DROP POLICY IF EXISTS "Allow anonymous insert" ON users;
CREATE POLICY "Allow anonymous insert"
    ON users FOR INSERT
    WITH CHECK (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id);

-- ========================================
-- 2. User Settings Table
-- ========================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK(theme IN ('light', 'dark', 'system')),
    dashboard_layout JSONB DEFAULT '{"widgets": []}',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own settings
DROP POLICY IF EXISTS "Users view own settings" ON user_settings;
CREATE POLICY "Users view own settings"
    ON user_settings FOR SELECT
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Policy: Users can update own settings
DROP POLICY IF EXISTS "Users update own settings" ON user_settings;
CREATE POLICY "Users update own settings"
    ON user_settings FOR UPDATE
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Policy: Users can insert own settings
DROP POLICY IF EXISTS "Users insert own settings" ON user_settings;
CREATE POLICY "Users insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Index
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- ========================================
-- 3. User Events Table (for Calendar Widget)
-- ========================================
CREATE TABLE IF NOT EXISTS user_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'personal' CHECK(event_type IN ('personal', 'work', 'family', 'sports', 'other')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    location TEXT,
    all_day BOOLEAN DEFAULT false,
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own events
DROP POLICY IF EXISTS "Users view own events" ON user_events;
CREATE POLICY "Users view own events"
    ON user_events FOR SELECT
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Policy: Users can manage own events
DROP POLICY IF EXISTS "Users manage own events" ON user_events;
CREATE POLICY "Users manage own events"
    ON user_events FOR ALL
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Indexes
CREATE INDEX IF NOT EXISTS user_events_user_id_idx ON user_events(user_id);
CREATE INDEX IF NOT EXISTS user_events_start_time_idx ON user_events(start_time);

-- ========================================
-- 4. User Goals Table (for Goal Tracker Widget)
-- ========================================
CREATE TABLE IF NOT EXISTS user_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goal_type TEXT DEFAULT 'personal' CHECK(goal_type IN ('personal', 'fitness', 'career', 'learning', 'financial', 'other')),
    target_value DECIMAL,
    current_value DECIMAL DEFAULT 0,
    unit TEXT,
    deadline DATE,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused', 'abandoned')),
    milestone_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own goals
DROP POLICY IF EXISTS "Users manage own goals" ON user_goals;
CREATE POLICY "Users manage own goals"
    ON user_goals FOR ALL
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Indexes
CREATE INDEX IF NOT EXISTS user_goals_user_id_idx ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS user_goals_status_idx ON user_goals(status);

-- ========================================
-- 5. User Friends Table (for Friends Network Widget)
-- ========================================
CREATE TABLE IF NOT EXISTS user_friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    relationship TEXT,
    birthday DATE,
    notes TEXT,
    last_contact_date DATE,
    next_meeting_date DATE,
    favorite_places TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage own friends
DROP POLICY IF EXISTS "Users manage own friends" ON user_friends;
CREATE POLICY "Users manage own friends"
    ON user_friends FOR ALL
    USING (auth.uid() = user_id OR user_id IN (
        SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    ));

-- Indexes
CREATE INDEX IF NOT EXISTS user_friends_user_id_idx ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS user_friends_birthday_idx ON user_friends(birthday);

-- ========================================
-- 6. Create default settings trigger
-- ========================================
CREATE OR REPLACE FUNCTION create_default_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_settings();

-- ========================================
-- 7. Verification Queries
-- ========================================

-- Check all tables exist
SELECT 
    'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'user_settings', COUNT(*) FROM user_settings
UNION ALL
SELECT 'user_events', COUNT(*) FROM user_events
UNION ALL
SELECT 'user_goals', COUNT(*) FROM user_goals
UNION ALL
SELECT 'user_friends', COUNT(*) FROM user_friends;

-- ========================================
-- ✅ Setup Complete!
-- ========================================

-- After running this script:
-- 1. Install dependencies: npm install next-auth @supabase/supabase-js @supabase/ssr
-- 2. Configure .env.local with Google OAuth credentials
-- 3. Deploy to Zeabur
-- 4. Test login flow
