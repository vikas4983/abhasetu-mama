import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../dbHelper';

export async function GET() {
  const db = readDb();
  return NextResponse.json({ status: 'success', config: db.config });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = readDb();
    db.config = {
      ...db.config,
      ...body
    };
    const success = writeDb(db);
    if (success) {
      return NextResponse.json({ status: 'success', message: 'ABDM settings updated successfully.', config: db.config });
    } else {
      return NextResponse.json({ status: 'error', message: 'Failed to write configuration updates.' }, { status: 500 });
    }
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}
