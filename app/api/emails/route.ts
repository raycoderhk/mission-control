import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Fetch emails from database (populated by email checker)
    const { data: emails, error } = await supabase
      .from('user_emails')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching emails:', error);
      return NextResponse.json({ emails: [], lastCheck: new Date().toISOString() });
    }

    return NextResponse.json({
      emails: emails || [],
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails', emails: [] },
      { status: 500 }
    );
  }
}
