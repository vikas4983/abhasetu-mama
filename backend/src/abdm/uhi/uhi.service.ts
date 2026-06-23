/**
 * @file        uhi.service.ts
 * @description Dedicated service for Unified Health Interface (UHI) teleconsultation searching, selecting, and slot bookings.
 * @module      abdm/uhi
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-21
 */

import { Injectable } from '@nestjs/common';
import { SessionService } from '../session/session.service';
import * as crypto from 'crypto';

@Injectable()
export class UhiService {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Handles UHI search, select, slot initialization, and confirmation.
   */
  async handleUhi(body: any, context?: { ip?: string; userAgent?: string }): Promise<any> {
    const { action, searchQuery, providerId, itemId, patientDetails, bookingContextId } = body;
    const config = await this.sessionService.getConfig();
    const transactionId = crypto.randomUUID();

    if (action === 'search') {
      const result = {
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
      };

      await this.sessionService.addDetailedLog('UHI Service Search Broadcast', 'SUCCESS', `Searched health providers for: "${searchQuery || 'General'}"`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'select') {
      if (!providerId || !itemId) {
        return { status: 'error', message: 'Provider ID and Item ID are required.' };
      }

      const result = {
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
      };

      await this.sessionService.addDetailedLog('UHI Slot Selection', 'SUCCESS', `Selected slot for consult item: ${itemId}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'init') {
      if (!bookingContextId || !patientDetails) {
        return { status: 'error', message: 'Booking context and patient details are required.' };
      }

      const result = {
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
      };

      await this.sessionService.addDetailedLog('UHI Consult Booking Drafted', 'SUCCESS', `Drafted order for patient: ${patientDetails.name}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;

    } else if (action === 'confirm') {
      if (!bookingContextId || !patientDetails) {
        return { status: 'error', message: 'Context ID and patient details are required.' };
      }

      const appointmentId = `SETU-UHI-${Math.floor(100000 + Math.random() * 900000)}`;
      const result = {
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
      };

      await this.sessionService.addDetailedLog('UHI Appointment Confirmed', 'SUCCESS', `Issued UHI tele-consult link for Appointment: ${appointmentId}`, {
        request: body,
        response: result,
        clientId: config.ABDM_CLIENT_ID,
        clientIp: context?.ip,
        userAgent: context?.userAgent,
      });

      return result;
    }

    return { status: 'error', message: 'Invalid UHI Action.' };
  }
}
