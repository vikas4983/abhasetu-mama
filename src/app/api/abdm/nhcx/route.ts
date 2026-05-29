import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, abhaAddress, policyNumber, diagnosis, estimateCost, recordsLinked } = body;

    const transactionId = crypto.randomUUID();

    if (action === 'eligibility-check') {
      if (!abhaAddress || !policyNumber) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address and Insurance Policy Number are required.' }, { status: 400 });
      }

      console.log(`[NHCX Exchange] CoverageEligibilityRequest initiated for policy: ${policyNumber}`);

      // Return simulated FHIR R4 CoverageEligibilityResponse collection bundle
      return NextResponse.json({
        status: 'success',
        message: 'Coverage eligibility checked successfully.',
        transactionId,
        fhirBundle: {
          resourceType: 'Bundle',
          type: 'collection',
          timestamp: new Date().toISOString(),
          entry: [
            {
              resource: {
                resourceType: 'CoverageEligibilityResponse',
                status: 'active',
                outcome: 'complete',
                disposition: 'Policy is active and diagnostic services are covered.',
                insurer: { display: 'Star Health Insurance Co.' },
                insurance: [
                  {
                    coverage: { display: 'ABHA Suraksha Shield Plan' },
                    benefit: [
                      { type: { text: 'Cashless Pre-Auth Limit' }, allowedMoney: { value: 150000, currency: 'INR' } },
                      { type: { text: 'OPD Co-pay Ratio' }, allowedMoney: { value: 10, currency: 'PERCENT' } }
                    ]
                  }
                ]
              }
            }
          ]
        },
        simulated: true
      });

    } else if (action === 'preauth-submit') {
      if (!policyNumber || !estimateCost) {
        return NextResponse.json({ status: 'error', message: 'Policy Number and Estimated treatment costs are required.' }, { status: 400 });
      }

      console.log(`[NHCX Exchange] Cashless Pre-Auth ClaimBundle submitted for policy: ${policyNumber} of Amount: Rs.${estimateCost}`);

      const approvedAmount = Math.floor(Number(estimateCost) * 0.9); // 90% coverage
      const copay = Number(estimateCost) - approvedAmount;
      const preAuthId = `NHCX-PREAUTH-${Math.floor(100000 + Math.random() * 900000)}`;

      // Return simulated FHIR R4 ClaimResponse collection bundle for pre-authorization
      return NextResponse.json({
        status: 'success',
        message: 'Pre-authorization request adjudicated successfully.',
        transactionId,
        preAuthId,
        adjudication: {
          status: 'APPROVED',
          disposition: '90% of OPD/IPD costs approved under cashless agreement. Co-pay applies.',
          approvedAmount,
          patientCopay: copay,
          deductibles: 0,
          notes: 'Standard policy parameters apply. Verified clinical records attached: ' + (recordsLinked || 'None')
        },
        fhirBundle: {
          resourceType: 'Bundle',
          type: 'collection',
          entry: [
            {
              resource: {
                resourceType: 'ClaimResponse',
                status: 'active',
                outcome: 'complete',
                use: 'preauthorization',
                preAuthRef: preAuthId,
                insurer: { display: 'Star Health Insurance Co.' },
                requestor: { display: 'Abha Setu Hospital Hub' },
                total: {
                  value: approvedAmount,
                  currency: 'INR'
                }
              }
            }
          ]
        },
        simulated: true
      });

    } else if (action === 'claim-submit') {
      if (!abhaAddress || !estimateCost) {
        return NextResponse.json({ status: 'error', message: 'ABHA Address and Final bill estimate are required.' }, { status: 400 });
      }

      console.log(`[NHCX Exchange] Submitting final cashless ClaimBundle to insurer under policy: ${policyNumber}`);

      const claimReference = `NHCX-CLAIM-${Math.floor(1000000 + Math.random() * 9000000)}`;
      const reimbursementAmount = Math.floor(Number(estimateCost) * 0.85); // 85% final settlement
      const patientOutflow = Number(estimateCost) - reimbursementAmount;

      // Return simulated final ClaimResponse bundle
      return NextResponse.json({
        status: 'success',
        message: 'Final claim successfully settled via NHCX gateway direct clearing.',
        transactionId,
        claimRef: claimReference,
        settlement: {
          status: 'PAID',
          reimbursementAmount,
          patientCoPay: patientOutflow,
          clearingUtr: `NHCX-EFT-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
          payerBankReceipt: 'NHA-Direct clearing JWS Valid',
          timestamp: new Date().toISOString()
        },
        simulated: true
      });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid NHCX Action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
