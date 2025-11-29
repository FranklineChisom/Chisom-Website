import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; 
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text, attachments } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const fromEmail = 'contact@franklinechisom.com'; 
    const adminEmail = process.env.ADMIN_EMAIL || 'contact@franklinechisom.com';

    // Prepare attachments for Resend if they exist
    // Resend expects: { filename: string, path: string } for URLs
    const resendAttachments = attachments?.map((url: string) => ({
      filename: url.split('/').pop() || 'attachment',
      path: url
    }));

    // 1. Send via Resend
    const data = await resend.emails.send({
      from: `Frankline Chisom Ebere <${fromEmail}>`,
      to: [to],
      replyTo: adminEmail,
      subject: subject,
      html: html,
      text: text,
      attachments: resendAttachments
    });

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    // 2. Save to Supabase 'sent_emails' table
    await supabase.from('sent_emails').insert({
      id: data.data?.id || `sent_${Date.now()}`,
      recipient: to,
      subject: subject,
      html: html,
      text: text,
      status: 'sent',
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}