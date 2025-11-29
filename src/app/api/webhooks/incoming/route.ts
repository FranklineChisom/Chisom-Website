import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // 1. Extract standard fields
    const { from, subject, text, html, date, attachments } = payload;

    // 2. Parse "From"
    const fromString = from || '';
    const emailMatch = fromString.match(/<(.+)>/);
    const email = emailMatch ? emailMatch[1] : fromString;
    const name = fromString.replace(/<.+>/, '').trim() || email;

    // 3. Process Attachments
    // Resend Incoming Webhook attachments usually come as an array of objects:
    // [{ filename: '...', content: [Buffer array], type: '...' }]
    // Saving binary content directly to JSONB is bad practice and hits size limits.
    // For this implementation, we will save a text reference noting an attachment exists.
    // *To fully support incoming files, you would need to upload 'content' to Supabase Storage buckets here.*
    
    const processedAttachments: string[] = [];
    
    if (Array.isArray(attachments)) {
        attachments.forEach(att => {
            if (att.filename) {
                // Since we can't easily upload to storage in this short webhook without
                // more setup, we'll just log the filename so the user knows a file was sent.
                processedAttachments.push(`[File: ${att.filename}]`);
            }
        });
    }

    // 4. Save to DB
    const { error } = await supabase.from('messages').insert({
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: name,
      email: email,
      subject: subject || '(No Subject)',
      message: text || 'No plain text content.', 
      date: new Date(date || Date.now()).toISOString(),
      read: false,
      replied: false,
      attachments: processedAttachments,
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