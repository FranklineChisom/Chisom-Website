import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
// We use ANON KEY here assuming RLS allows insert. Ideally use SERVICE_ROLE key for backend scripts.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Resend sends a specific payload structure for inbound emails.
    // Important: Verify the Resend signature if possible in production for security.
    
    const { from, subject, text, html, date } = payload;

    // Extract name and email from the "From" field (e.g., "John Doe <john@example.com>")
    const fromString = from || '';
    const emailMatch = fromString.match(/<(.+)>/);
    const email = emailMatch ? emailMatch[1] : fromString;
    const name = fromString.replace(/<.+>/, '').trim() || email;

    const { error } = await supabase.from('messages').insert({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name,
      email: email,
      subject: subject || '(No Subject)',
      message: text || 'No plain text content.', // Prefer text
      date: new Date(date || Date.now()).toISOString(),
      read: false,
      replied: false,
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Database Insert Error:', error);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}