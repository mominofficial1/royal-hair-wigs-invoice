import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getCompanySettings, saveCompanySettings } from '@/lib/db';
import { CompanySettings } from '@/types/invoice';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await getCompanySettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch settings' },
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
    const saved = await saveCompanySettings(body as CompanySettings);
    return NextResponse.json({ success: true, settings: saved });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}
