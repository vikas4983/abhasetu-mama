import { NextResponse } from 'next/server';
import { getAbdmAccessToken } from '../../../../utils/abdm/session';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, abhaAddress, patientName, contextType, detail, otp, txnId } = body;

    const token = await getAbdmAccessToken();
    const isMock = token.includes('simulated');

    if (action === 'discover-link') {
      if (!abhaAddress || !patientName) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address and Patient Name are required.' }, { status: 400 });
      }

      console.log(`[ABDM M2] Synchronous Discovery check for ABHA: ${abhaAddress}`);

      // Return high-fidelity mock discovery results
      return NextResponse.json({
        status: 'success',
        message: 'Patient matched successfully in EMR database.',
        transactionId: crypto.randomUUID(),
        txnId: crypto.randomUUID(),
        matchedPatient: {
          referenceNumber: `PAT-${Math.floor(100000 + Math.random() * 900000)}`,
          display: patientName,
          careContexts: [
            {
              referenceNumber: `EMR-CTX-${Math.floor(1000 + Math.random() * 9000)}`,
              display: `${contextType || 'OPD Consultation'} - ${detail || 'Chronic Care visit'}`,
              hiType: contextType === 'Prescription' ? 'Prescription' : contextType === 'Lab Report' ? 'DiagnosticReport' : 'OPConsultation'
            }
          ]
        },
        simulated: true,
      });

    } else if (action === 'confirm-link') {
      if (!otp || !txnId) {
        return NextResponse.json({ status: 'error', message: 'OTP and transaction context ID are required.' }, { status: 400 });
      }

      console.log(`[ABDM M2] Direct synchronous linking confirmation with OTP: ${otp}`);

      if (otp === '123456') {
        return NextResponse.json({
          status: 'success',
          message: 'Care context linked successfully under ABDM Gateway!',
          linkingStatus: 'SUCCESS',
          linkedAt: new Date().toISOString(),
          referenceNumber: `LINK-${Math.floor(100000 + Math.random() * 900000)}`,
          simulated: true,
        });
      } else {
        return NextResponse.json({ status: 'error', message: 'Invalid OTP code. Please enter 123456.' }, { status: 400 });
      }
    }

    return NextResponse.json({ status: 'error', message: 'Invalid Action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
