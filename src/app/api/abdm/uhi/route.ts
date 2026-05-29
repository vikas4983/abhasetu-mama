import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, searchQuery, providerId, itemId, patientDetails, bookingContextId } = body;

    const transactionId = crypto.randomUUID();

    if (action === 'search') {
      console.log(`[UHI Network] Initiating search query across HSPAs: "${searchQuery || 'Homeopathy'}"`);

      // Mock on_search Beckn payload callback
      return NextResponse.json({
        status: 'success',
        context: {
          domain: 'nic.abdm:uhi',
          action: 'on_search',
          version: '1.2.0',
          transactionId,
          messageId: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        },
        message: {
          catalog: {
            descriptor: { name: 'UHI Interoperable Health Services Directory' },
            providers: [
              {
                id: 'HSPA-IN-HFR-100456',
                descriptor: { name: 'Dr. Ayesha Homeo Health Mall' },
                items: [
                  {
                    id: 'CONSULT-01',
                    descriptor: { name: 'Video Teleconsultation' },
                    price: { value: '899', currency: 'INR' },
                    fulfillment: { type: 'ONLINE', doctor: 'Dr. Ayesha Ali', degree: 'DHMS, M.D.' }
                  }
                ]
              },
              {
                id: 'HSPA-IN-HFR-100789',
                descriptor: { name: 'CityCare Medical Hub' },
                items: [
                  {
                    id: 'CONSULT-02',
                    descriptor: { name: 'In-Clinic General Wellness checkup' },
                    price: { value: '599', currency: 'INR' },
                    fulfillment: { type: 'PHYSICAL', doctor: 'Dr. Aarav Sharma', degree: 'MBBS, M.D.' }
                  }
                ]
              }
            ]
          }
        },
        simulated: true
      });

    } else if (action === 'select') {
      if (!providerId || !itemId) {
        return NextResponse.json({ status: 'error', message: 'Provider ID and Item ID are required.' }, { status: 400 });
      }

      console.log(`[UHI Network] Selecting Service item: ${itemId} from Provider: ${providerId}`);

      // Mock on_select callback
      return NextResponse.json({
        status: 'success',
        context: {
          domain: 'nic.abdm:uhi',
          action: 'on_select',
          transactionId,
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            provider: { id: providerId },
            items: [{ id: itemId }],
            quote: {
              price: { value: itemId === 'CONSULT-01' ? '899' : '599', currency: 'INR' },
              breakup: [
                { title: 'Consultation Fee', price: { value: itemId === 'CONSULT-01' ? '800' : '500', currency: 'INR' } },
                { title: 'ABDM Network Service Charge', price: { value: '99', currency: 'INR' } }
              ]
            },
            fulfillment: {
              slots: [
                { id: 'SLOT-A', time: 'Today, 06:00 PM - 06:30 PM' },
                { id: 'SLOT-B', time: 'Tomorrow, 10:00 AM - 10:30 AM' }
              ]
            }
          }
        },
        simulated: true
      });

    } else if (action === 'init') {
      if (!bookingContextId || !patientDetails) {
        return NextResponse.json({ status: 'error', message: 'Booking context and patient details are required.' }, { status: 400 });
      }

      console.log(`[UHI Network] Initializing booking for HPR Patient: ${patientDetails.name}`);

      // Mock on_init callback
      return NextResponse.json({
        status: 'success',
        context: {
          domain: 'nic.abdm:uhi',
          action: 'on_init',
          transactionId,
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: `ORD-INIT-${Math.floor(1000 + Math.random() * 9000)}`,
            provider: { id: providerId || 'HSPA-IN-HFR-100456' },
            items: [{ id: itemId || 'CONSULT-01' }],
            billing: {
              name: patientDetails.name,
              email: patientDetails.email || 'patient@abdm',
              phone: patientDetails.mobile || '9981057765'
            },
            payment: {
              status: 'AWAITING_PAYMENT',
              gateway: 'BHIM-UPI-HEALTH',
              amount: itemId === 'CONSULT-02' ? '599' : '899'
            }
          }
        },
        simulated: true
      });

    } else if (action === 'confirm') {
      if (!bookingContextId || !patientDetails) {
        return NextResponse.json({ status: 'error', message: 'Context ID and patient details are required.' }, { status: 400 });
      }

      console.log(`[UHI Network] Confirming booking session: ${bookingContextId}`);

      const appointmentId = `SETU-UHI-${Math.floor(100000 + Math.random() * 900000)}`;

      // Mock on_confirm callback
      return NextResponse.json({
        status: 'success',
        context: {
          domain: 'nic.abdm:uhi',
          action: 'on_confirm',
          transactionId,
          timestamp: new Date().toISOString()
        },
        message: {
          order: {
            id: `ORD-CONF-${Math.floor(100000 + Math.random() * 900000)}`,
            state: 'CONFIRMED',
            appointment: {
              id: appointmentId,
              status: 'CONFIRMED',
              consultationLink: 'https://telehealth.abdm.gov.in/meet/uhi-secure-hspa-room-409',
              digitalToken: `TKN-${Math.floor(100 + Math.random() * 900)}`,
              doctorName: itemId === 'CONSULT-02' ? 'Dr. Aarav Sharma' : 'Dr. Ayesha Ali'
            }
          }
        },
        simulated: true
      });
    }

    return NextResponse.json({ status: 'error', message: 'Invalid UHI Action.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message || error }, { status: 500 });
  }
}
