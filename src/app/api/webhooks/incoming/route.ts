import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Resend sends a specific payload structure for inbound emails
    // We map it to your existing 'messages' table schema
    const { from, subject, text, html, date } = payload;

    // Extract name and email from the "From" field (e.g., "John Doe <john@example.com>")
    // Simple regex to parse "Name <email>" or just "email"
    const fromString = from || '';
    const emailMatch = fromString.match(/<(.+)>/);
    const email = emailMatch ? emailMatch[1] : fromString;
    const name = fromString.replace(/<.+>/, '').trim() || email;

    const { error } = await supabase.from('messages').insert({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name,
      email: email,
      subject: subject || '(No Subject)',
      message: text || 'No plain text content.', // Prefer text, could store HTML if you add a column
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