import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../dbHelper';

export async function GET() {
  const db = readDb();
  return NextResponse.json({ status: 'success', policies: db.policies });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.provider || !body.monthlyPremium) {
      return NextResponse.json({ status: 'error', message: 'Name, provider, and premium are required fields.' }, { status: 400 });
    }
    const db = readDb();
    const newPolicy = {
      id: body.id || `i_${Date.now()}`,
      name: body.name,
      provider: body.provider,
      monthlyPremium: Number(body.monthlyPremium),
      csr: body.csr || '95.0%',
      networkHospitals: Number(body.networkHospitals || 500),
      coverageAmount: body.coverageAmount || '10 Lakhs',
      copay: body.copay || 'No Copay',
      features: Array.isArray(body.features) ? body.features : []
    };
    db.policies.push(newPolicy);
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Insurance plan added successfully.', policy: newPolicy });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ status: 'error', message: 'Policy ID is required.' }, { status: 400 });
    }
    const db = readDb();
    const idx = db.policies.findIndex(p => p.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ status: 'error', message: 'Policy not found.' }, { status: 404 });
    }
    db.policies[idx] = {
      ...db.policies[idx],
      ...body,
      monthlyPremium: Number(body.monthlyPremium),
      networkHospitals: Number(body.networkHospitals || db.policies[idx].networkHospitals)
    };
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Policy updated successfully.', policy: db.policies[idx] });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Policy ID is required.' }, { status: 400 });
    }
    const db = readDb();
    const filtered = db.policies.filter(p => p.id !== id);
    if (filtered.length === db.policies.length) {
      return NextResponse.json({ status: 'error', message: 'Policy not found.' }, { status: 404 });
    }
    db.policies = filtered;
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Policy deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request.' }, { status: 400 });
  }
}
