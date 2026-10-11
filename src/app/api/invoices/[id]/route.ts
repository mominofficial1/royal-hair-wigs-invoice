import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getInvoice, deleteInvoice } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invoice = await getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    return NextResponse.json({ invoice });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const success = await deleteInvoice(id);
    if (!success) {
      return NextResponse.json({ error: 'Invoice not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
