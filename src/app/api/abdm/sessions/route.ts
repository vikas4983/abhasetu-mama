import { NextResponse } from 'next/server';
import { getAbdmAccessToken } from '../../../../utils/abdm/session';

export async function GET() {
  try {
    const token = await getAbdmAccessToken();
    const isSimulated = token.includes('simulated');
    
    return NextResponse.json({
      status: 'success',
      message: 'ABDM session established successfully.',
      sandboxMode: isSimulated,
      tokenPreview: `${token.substring(0, 15)}...`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to ABDM gateway.',
        error: error.message || error,
      },
      { status: 500 }
    );
  }
}
