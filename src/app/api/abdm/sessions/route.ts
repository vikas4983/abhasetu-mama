import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const backendRes = await fetch('http://localhost:3001/api/abdm/sessions', {
      method: 'GET',
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
