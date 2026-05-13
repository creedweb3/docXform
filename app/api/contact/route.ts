import { NextRequest, NextResponse } from 'next/server';
import { restInsert } from '@/lib/supabase-rest';

export const runtime = 'edge';

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 320;
const MAX_MESSAGE_LENGTH = 4000;

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function hashIpAddress(ipAddress: string | null, salt: string) {
  if (!ipAddress) return null;
  const input = new TextEncoder().encode(`${salt}:${ipAddress}`);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  return request.headers.get('x-real-ip');
}

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const name = normalizeText(body.name);
  const email = normalizeText(body.email).toLowerCase();
  const message = normalizeText(body.message);
  const sourcePage = normalizeText(body.sourcePage) || '/contact';

  if (name.length < 2 || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: 'Please enter a valid name.' },
      { status: 400 }
    );
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    );
  }

  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: 'Message should be between 10 and 4000 characters.' },
      { status: 400 }
    );
  }

  try {
    const ipSalt = process.env.CONTACT_IP_SALT ?? 'docxform-contact';
    const ipHash = await hashIpAddress(getClientIp(request), ipSalt);
    const userAgent = normalizeText(request.headers.get('user-agent'));

    await restInsert('contact_submissions', {
      name,
      email,
      message,
      status: 'new',
      source_page: sourcePage,
      ip_hash: ipHash,
      user_agent: userAgent || null,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Contact service is not configured yet.' },
      { status: 500 }
    );
  }
}
