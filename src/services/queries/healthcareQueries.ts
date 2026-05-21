import { useQuery } from '@tanstack/react-query';
import { healthcareApi } from '@services/api/healthcareApi';

export const healthcareQueryKeys = {
  vitals: ['healthcare', 'vitals'] as const,
  appointments: ['healthcare', 'appointments'] as const,
  records: ['healthcare', 'records'] as const,
  service: (serviceId: string) => ['healthcare', 'service', serviceId] as const,
};

export function useVitalsQuery() {
  return useQuery({ queryKey: healthcareQueryKeys.vitals, queryFn: healthcareApi.getVitals });
}

export function useAppointmentsQuery() {
  return useQuery({ queryKey: healthcareQueryKeys.appointments, queryFn: healthcareApi.getAppointments });
}

export function useRecordsQuery() {
  return useQuery({ queryKey: healthcareQueryKeys.records, queryFn: healthcareApi.getRecords });
}

export function useServiceQuery(serviceId: string) {
  return useQuery({
    queryKey: healthcareQueryKeys.service(serviceId),
    queryFn: () => healthcareApi.getService(serviceId),
    enabled: Boolean(serviceId),
  });
}
