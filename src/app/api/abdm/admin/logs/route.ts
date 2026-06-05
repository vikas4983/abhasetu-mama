import { NextResponse } from 'next/server';
import { readDb, writeDb } from '../../dbHelper';

export async function GET() {
  const db = readDb();
  // Return logs sorted by timestamp (newest first)
  const sortedLogs = [...db.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return NextResponse.json({ status: 'success', logs: sortedLogs });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.event || !body.status) {
      return NextResponse.json({ status: 'error', message: 'Event name and status are required fields.' }, { status: 400 });
    }
    const db = readDb();
    const newLog = {
      timestamp: body.timestamp || new Date().toISOString(),
      event: body.event,
      status: body.status,
      details: body.details || ''
    };
    db.auditLogs.push(newLog);
    // Keep max 200 logs to prevent static file bloat
    if (db.auditLogs.length > 200) {
      db.auditLogs.shift();
    }
    writeDb(db);
    return NextResponse.json({ status: 'success', log: newLog });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message || 'Invalid request body.' }, { status: 400 });
  }
}
