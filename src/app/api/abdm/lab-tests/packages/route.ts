import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../dbHelper';

export async function GET() {
  const db = readDb();
  return NextResponse.json({ status: 'success', labPackages: db.labPackages });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.provider || !body.price) {
      return NextResponse.json({ status: 'error', message: 'Name, provider, and price are required fields.' }, { status: 400 });
    }
    const db = readDb();
    const newPackage = {
      id: body.id || `l_${Date.now()}`,
      name: body.name,
      parameters: Number(body.parameters || 1),
      provider: body.provider,
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      reportHours: Number(body.reportHours || 24),
      sampleType: body.sampleType || 'Blood',
      description: body.description || '',
      image: body.image || 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?auto=format&fit=crop&q=80&w=300'
    };
    db.labPackages.push(newPackage);
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Lab checkup package added successfully.', labPackage: newPackage });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ status: 'error', message: 'Package ID is required.' }, { status: 400 });
    }
    const db = readDb();
    const idx = db.labPackages.findIndex(l => l.id === body.id);
    if (idx === -1) {
      return NextResponse.json({ status: 'error', message: 'Lab package not found.' }, { status: 404 });
    }
    db.labPackages[idx] = {
      ...db.labPackages[idx],
      ...body,
      parameters: Number(body.parameters || db.labPackages[idx].parameters),
      price: Number(body.price),
      originalPrice: Number(body.originalPrice || body.price),
      discount: Number(body.discount || 0),
      reportHours: Number(body.reportHours || db.labPackages[idx].reportHours)
    };
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Lab package updated successfully.', labPackage: db.labPackages[idx] });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ status: 'error', message: 'Package ID is required.' }, { status: 400 });
    }
    const db = readDb();
    const filtered = db.labPackages.filter(l => l.id !== id);
    if (filtered.length === db.labPackages.length) {
      return NextResponse.json({ status: 'error', message: 'Lab package not found.' }, { status: 404 });
    }
    db.labPackages = filtered;
    writeDb(db);
    return NextResponse.json({ status: 'success', message: 'Lab package deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request.' }, { status: 400 });
  }
}
