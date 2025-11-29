import React from 'react';
import type { Metadata } from 'next';
import ContactContent from '@/components/ContactContent';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch for research collaborations, speaking engagements, or inquiries about international financial law.',
  openGraph: {
    title: 'Contact | Frankline Chisom Ebere',
    description: 'Get in touch for research collaborations and speaking engagements.',
    url: 'https://franklinechisom.com/contact'
  }
};

export default function Contact() {
  return <ContactContent />;
}