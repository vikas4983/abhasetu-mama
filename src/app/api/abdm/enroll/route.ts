import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:3001';

/**
 * Handles forwarding demographic and OTP onboarding enrollments.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendRes = await fetch(`${BACKEND_URL}/api/abdm/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
