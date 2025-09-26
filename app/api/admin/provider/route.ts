import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (request.headers.get('x-admin-token') !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ message: 'unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  if (!['replicate', 'huggingface'].includes(body.provider)) {
    return NextResponse.json({ message: 'unsupported provider' }, { status: 400 });
  }
  process.env.DEFAULT_PROVIDER = body.provider;
  return NextResponse.json({ provider: process.env.DEFAULT_PROVIDER });
}
