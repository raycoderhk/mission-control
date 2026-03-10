-- Email Inbox Table for Mission Control
-- Stores emails fetched from Gmail for dashboard display

CREATE TABLE IF NOT EXISTS user_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_id TEXT UNIQUE NOT NULL,  -- Gmail message ID
    subject TEXT NOT NULL,
    from_address TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
    category TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    has_action BOOLEAN DEFAULT FALSE,
    kanban_task TEXT,  -- proj-XXX reference
    body_preview TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_user_emails_date ON user_emails(date DESC);
CREATE INDEX IF NOT EXISTS idx_user_emails_priority ON user_emails(priority);
CREATE INDEX IF NOT EXISTS idx_user_emails_is_read ON user_emails(is_read);
CREATE INDEX IF NOT EXISTS idx_user_emails_has_action ON user_emails(has_action);

-- Row Level Security
ALTER TABLE user_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own emails
CREATE POLICY "Users can view own emails"
    ON user_emails
    FOR SELECT
    USING (true);  -- Simplified for now, can add user_id filtering

-- Policy: System can insert emails
CREATE POLICY "System can insert emails"
    ON user_emails
    FOR INSERT
    WITH CHECK (true);

-- Policy: Users can update their emails (mark as read, etc.)
CREATE POLICY "Users can update own emails"
    ON user_emails
    FOR UPDATE
    USING (true);

-- Comment
COMMENT ON TABLE user_emails IS 'Email inbox for Mission Control dashboard - synced from Gmail';
