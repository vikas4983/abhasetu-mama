import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

/**
 * Handles retrieving the active gateway session.
 */
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/abdm/sessions`, {
      method: 'GET',
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}

/**
 * Handles forcing a gateway session refresh from diagnostics.
 */
export async function POST() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/abdm/sessions`, {
      method: 'POST',
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
