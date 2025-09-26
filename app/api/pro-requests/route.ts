import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  if (request.headers.get('X-Requested-With') !== 'quick-colorize') {
    return NextResponse.json({ message: 'invalid request' }, { status: 403 });
  }
  const body = await request.json();
  if (!body.contactEmail) {
    return NextResponse.json({ message: 'email required' }, { status: 400 });
  }
  const requestEntry = await prisma.proRequest.create({
    data: {
      contact_email: body.contactEmail,
      note: body.note ?? null,
      imageId: body.imageId ?? null
    }
  });
  return NextResponse.json({ id: requestEntry.id }, { status: 201 });
}
