import { appointments, records, serviceDetails, vitals } from '@/constants/data';
import type { Appointment, HealthRecord, Metric, ServiceDetail } from '@/types/domain';

export const healthcareApi = {
  async getVitals(): Promise<Metric[]> {
    return Promise.resolve(vitals);
  },
  async getAppointments(): Promise<Appointment[]> {
    return Promise.resolve(appointments);
  },
  async getRecords(): Promise<HealthRecord[]> {
    return Promise.resolve(records);
  },
  async getService(serviceId: string): Promise<ServiceDetail | undefined> {
    return Promise.resolve(serviceDetails[serviceId]);
  },
};
