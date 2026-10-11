import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getNextInvoiceNumber } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const nextNumber = await getNextInvoiceNumber();
    return NextResponse.json({ nextNumber });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate next invoice number' },
      { status: 500 }
    );
  }
}
