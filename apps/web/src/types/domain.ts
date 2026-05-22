import type { LucideIcon } from "lucide-react";

export type Role = "admin" | "doctor" | "patient" | "operator";

export type RouteKey =
  | "dashboard"
  | "abdm"
  | "telemedicine"
  | "insights"
  | "facilities"
  | "security"
  | "compliance"
  | "reports"
  | "scanner"
  | "settings"
  | "contact"
  | "about"
  | "terms"
  | "privacy";

export interface NavItem {
  key: RouteKey;
  labelKey: string;
  icon: LucideIcon;
}

export interface DoctorProfile {
  name: string;
  degree: string;
  speciality: string;
  experience: string;
  description: string;
  photo?: string;
  badge: string;
  certificate: string;
}

export interface Metric {
  label: string;
  value: string;
  unit: string;
  trend: string;
  icon: LucideIcon;
}

export interface Facility {
  type: string;
  name: string;
  description: string;
  icon: LucideIcon;
}
