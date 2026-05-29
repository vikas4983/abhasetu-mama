import { NextResponse } from 'next/server';
import { getAbdmAccessToken } from '../../../../utils/abdm/session';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, hprId, registrationNo, council, system, aadhaar, otp, txnId } = body;

    const token = await getAbdmAccessToken();
    const isMock = token.includes('simulated');

    if (action === 'search') {
      if (!hprId && !registrationNo) {
        return NextResponse.json({ status: 'error', message: 'HPR ID or Council Registration Number is required.' }, { status: 400 });
      }

      console.log(`[ABDM HPR] Searching professional registry for HPR ID: ${hprId || registrationNo}`);

      // Return premium verified doctor HPR Profile card replica
      return NextResponse.json({
        status: 'success',
        message: 'Practitioner found in National HPR Registry.',
        practitioner: {
          name: 'Dr. Ayesha Ali',
          hprId: hprId || 'ayesha.ali@hpr',
          registrationNo: registrationNo || 'MCI-4207198',
          council: council || 'Medical Council of India (MCI)',
          system: system || 'Homeopathy',
          degrees: ['DHMS', 'B.Sc', 'LLB', 'M.D. Homeopathy'],
          experience: '35 Years experience',
          activeFacilityId: 'IN-HFR-100456',
          status: 'VERIFIED',
          issuedAt: '15-08-2022',
          digitalSignatureSeal: 'NHA-GATEWAY-SIG-B64-VALID',
        },
        simulated: true,
      });

    } else if (action === 'enroll-otp') {
      if (!aadhaar || aadhaar.length !== 12) {
        return NextResponse.json({ status: 'error', message: 'Invalid 12-digit Aadhaar Number.' }, { status: 400 });
      }

      console.log(`[ABDM HPR] Requesting Aadhaar KYC OTP for Healthcare Professional Registration...`);

      return NextResponse.json({
        status: 'success',
        message: 'Aadhaar eKYC OTP successfully sent to linked mobile ended in *6582.',
        txnId: crypto.randomUUID(),
        simulated: true,
      });

    } else if (action === 'enroll-verify') {
      if (!otp || !txnId) {
        return NextResponse.json({ status: 'error', message: 'OTP and transaction context ID are required.' }, { status: 400 });
      }

      console.log(`[ABDM HPR] Confirming HPR Aadhaar OTP and creating HPR ID...`);

      if (otp === '123456') {
        const randomReg = Math.floor(1000000 + Math.random() * 9000000);
        return NextResponse.json({
          status: 'success',
          message: 'Professional HPR ID issued successfully!',
          practitioner: {
            name: 'Dr. Aarav Sharma',
            hprId: `aarav.sharma@hpr`,
            registrationNo: `MCI-${randomReg}`,
            council: council || 'Delhi Medical Council',
            system: system || 'Modern Medicine (Allopathy)',
            degrees: ['MBBS', 'M.D. Cardiology'],
            experience: '12 Years experience',
            activeFacilityId: 'IN-HFR-100789',
            status: 'VERIFIED',
            issuedAt: new Date().toLocaleDateString(),
            digitalSignatureSeal: 'NHA-GATEWAY-SIG-B64-VALID',
          },
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
