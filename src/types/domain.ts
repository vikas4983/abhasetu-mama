import type { LucideIcon } from 'lucide-react';

export type AppRoute =
  | '/'
  | '/health'
  | '/appointments'
  | '/records'
  | '/more'
  | '/book-consultation'
  | '/health-atm'
  | '/digital-locker'
  | '/quick-access'
  | '/live-dashboard'
  | '/telemedicine'
  | '/telemedicine-room'
  | '/marketplace'
  | '/compliance'
  | '/insights'
  | '/notifications'
  | '/profile'
  | '/settings'
  | '/language'
  | string;

export interface Doctor {
  id: string;
  name: string;
  role: string;
  time: string;
  fee: string;
  rating: string;
}

export interface Appointment {
  id: string;
  title: string;
  doctor: string;
  meta: string;
  status: string;
}

export interface HealthRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  source: string;
}

export interface Metric {
  label: string;
  value: string;
  unit: string;
  trend: string;
  icon: LucideIcon;
}

export interface Panel {
  title: string;
  icon: LucideIcon;
  lines: string[];
}

export interface ServiceSummary {
  title: string;
  route: string;
  icon: LucideIcon;
  desc: string;
}

export interface ServiceDetail {
  title: string;
  route: string;
  icon: LucideIcon;
  subtitle: string;
  stats: Metric[];
  panels: Panel[];
  listTitle: string;
  list: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  route: AppRoute;
}

export type ThemeMode = 'light' | 'dark';
export type AppLanguage = 'en' | 'hi';
