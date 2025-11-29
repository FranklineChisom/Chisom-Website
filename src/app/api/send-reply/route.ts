import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// GET: Fetch Sent Emails List
export async function GET() {
  try {
    const { data, error } = await resend.emails.list();
    
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ emails: data?.data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Send New Email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fromEmail = 'contact@franklinechisom.com'; 
    const adminEmail = process.env.ADMIN_EMAIL || 'contact@franklinechisom.com';

    const data = await resend.emails.send({
      from: `Frankline Chisom Ebere <${fromEmail}>`,
      to: [to],
      replyTo: adminEmail,
      // Removed BCC: Since we are using the API to fetch sent emails, 
      // we don't need to clog your inbox with BCCs anymore.
      subject: subject,
      html: html,
      text: text
    });

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}