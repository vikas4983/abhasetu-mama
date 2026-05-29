import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, abhaAddress, patientProfile, facilityCode, billId, paymentAmount } = body;

    if (action === 'share-profile') {
      if (!abhaAddress || !patientProfile) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address and Patient Profile are required.' }, { status: 400 });
      }

      console.log(`[ABDM Scan&Share] Received profile share from Gateway for: ${abhaAddress}`);

      const transactionId = crypto.randomUUID();
      const tokenNum = `SETU-OPD-${Math.floor(100 + Math.random() * 900)}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Simulate the gateway's asynchronous on-share JWS verification signature callback
      return NextResponse.json({
        status: 'success',
        message: 'Demographic metadata shared and verified successfully.',
        transactionId,
        opdToken: {
          tokenNumber: tokenNum,
          facilityName: facilityCode === 'IN-HFR-100456' ? 'Dr. Ayesha Homeo Health Mall' : 'Janki Raman Hospital',
          timestamp: new Date().toISOString(),
          estimatedWaitMinutes: 14,
          counterName: 'OPD Counter A (Fast-Track)'
        },
        gatewayCallback: {
          endpoint: '/v1.0/patients/profile/on-share',
          status: 'SUCCESS',
          digitalSignature: 'JWS-SIG-Gateway-ProfileShared-2026'
        },
        simulated: true
      });

    } else if (action === 'get-pending-bills') {
      if (!abhaAddress) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address is required.' }, { status: 400 });
      }

      console.log(`[ABDM Scan&Pay] Retrieving pending orders for ABHA: ${abhaAddress}`);

      // Return simulated pending diagnostic / medicine billing orders
      return NextResponse.json({
        status: 'success',
        abhaAddress,
        pendingBills: [
          {
            billId: 'BILL-4091',
            serviceName: 'Homeopathy Chronic Medicine Kit (3 Month supply)',
            amount: 899,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            insuranceEligible: true,
            status: 'UNPAID'
          },
          {
            billId: 'BILL-2045',
            serviceName: 'Lipid Profile & HbA1c Lab Screening',
            amount: 699,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            insuranceEligible: false,
            status: 'UNPAID'
          }
        ],
        simulated: true
      });

    } else if (action === 'process-payment') {
      if (!billId || !paymentAmount) {
        return NextResponse.json({ status: 'error', message: 'Bill ID and payment amount are required.' }, { status: 400 });
      }

      console.log(`[ABDM Scan&Pay] Processing payment for Bill: ${billId} of Amount: Rs.${paymentAmount}`);

      const utrNumber = `SETU-PAY-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      return NextResponse.json({
        status: 'success',
        message: 'Payment processed successfully via Health UPI Network!',
        transactionId: crypto.randomUUID(),
        utr: utrNumber,
        billId,
        amountPaid: paymentAmount,
        timestamp: new Date().toISOString(),
        paymentStatus: 'SUCCESS',
        claimStatus: paymentAmount > 800 ? 'AUTO_COPAY_NHCX_ELIGIBLE' : 'DIRECT_WALLET_OUTFLOW',
        simulated: true
      });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid Scan & Share Action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
