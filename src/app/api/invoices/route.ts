import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { listInvoices, saveInvoice, checkInvoiceNumberExists } from '@/lib/db';
import { InvoiceData } from '@/types/invoice';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const dateFilter = searchParams.get('date') || undefined;

  try {
    const invoices = await listInvoices(search, dateFilter);
    return NextResponse.json({ invoices });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to list invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const invoice = body as InvoiceData;

    if (!invoice || !invoice.invoiceNumber) {
      return NextResponse.json(
        { error: 'Valid invoice number is required.' },
        { status: 400 }
      );
    }

    if (!invoice.id) {
      invoice.id = 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    }

    // Check duplicate invoice number
    const exists = await checkInvoiceNumberExists(invoice.invoiceNumber, invoice.id);
    if (exists) {
      return NextResponse.json(
        { error: `Invoice number #${invoice.invoiceNumber} is already assigned to another invoice.` },
        { status: 409 }
      );
    }

    const saved = await saveInvoice(invoice);
    return NextResponse.json({ success: true, invoice: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save invoice' },
      { status: 500 }
    );
  }
}
