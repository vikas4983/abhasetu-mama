import {
  Activity,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Building2,
  Droplets,
  FileLock2,
  HeartPulse,
  Hospital,
  IdCard,
  Languages,
  LayoutDashboard,
  Lock,
  Mail,
  Pill,
  QrCode,
  Scale,
  ScanFace,
  ScanLine,
  Settings,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Video
} from "lucide-react";
import type { DoctorProfile, Facility, Metric, NavItem } from "@/types/domain";

export const navItems: NavItem[] = [
  { key: "dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { key: "abdm", labelKey: "abdm", icon: IdCard },
  { key: "telemedicine", labelKey: "telemedicine", icon: Video },
  { key: "insights", labelKey: "insights", icon: Activity },
  { key: "facilities", labelKey: "facilities", icon: Building2 },
  { key: "security", labelKey: "security", icon: ShieldCheck },
  { key: "compliance", labelKey: "compliance", icon: Scale },
  { key: "reports", labelKey: "reports", icon: BarChart3 },
  { key: "scanner", labelKey: "scanner", icon: QrCode },
  { key: "settings", labelKey: "settings", icon: Settings },
  { key: "contact", labelKey: "contact", icon: Mail },
  { key: "about", labelKey: "about", icon: Languages }
];

export const mobileNav = ["dashboard", "abdm", "scanner", "telemedicine", "settings"] as const;

export const doctors: DoctorProfile[] = [
  {
    name: "Dr. Ayesha Ali",
    degree: "DHMS, BSC, LLB, M.D HOMEO",
    speciality: "Senior Homeopathy Consultant",
    experience: "35 years experience",
    description: "Former Registrar, Madhya Pradesh. Chronic care, women-led family health, long-term case review, and second opinions.",
    photo: "/assets/doctors/dr-ayesha-ali.jpeg",
    badge: "ABDM Ready",
    certificate: "ABDM participation certificate preview"
  },
  {
    name: "Dr. Yogyata Mukhraiya",
    degree: "BHMS",
    speciality: "Chronic Diseases and Female Problems",
    experience: "Expertise in chronic diseases and female problems",
    description: "Focused on female health, infertility concerns, skin care, and chronic condition follow-ups.",
    photo: "/assets/doctors/dr-yogyata-mukhraiya.jpeg",
    badge: "Verified",
    certificate: "Provider credential certificate preview"
  },
  {
    name: "Amitendu Giradonia",
    degree: "BHMS",
    speciality: "Homeopathy and Primary Care",
    experience: "18 years experience",
    description: "Family care, chronic follow-up, preventive plans, and medication reviews.",
    badge: "Telemedicine",
    certificate: "Professional registration certificate preview"
  }
];

export const vitals: Metric[] = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "Stable", icon: Activity },
  { label: "Oxygen Level", value: "98", unit: "%", trend: "Normal", icon: HeartPulse },
  { label: "Sugar Level", value: "98", unit: "mg/dL", trend: "In range", icon: Droplets },
  { label: "Heart Rate", value: "72", unit: "BPM", trend: "Resting", icon: HeartPulse },
  { label: "BMI", value: "22.4", unit: "kg/m2", trend: "Healthy", icon: Scale },
  { label: "Wellness Tracking", value: "84", unit: "%", trend: "Good", icon: Sparkles },
  { label: "Skin Care", value: "3", unit: "tips", trend: "Updated", icon: ScanFace },
  { label: "AI Health Insights", value: "2", unit: "alerts", trend: "Review", icon: BrainCircuit }
];

export const facilities: Facility[] = [
  { type: "Hospital", name: "CityCare Multispeciality", description: "HFR-ready registration, OPD queues, emergency routing, and Scan and Share.", icon: Hospital },
  { type: "Clinic", name: "Aarogya Family Clinic", description: "ABHA verification, returning patient flow, and digital prescription support.", icon: Stethoscope },
  { type: "Lab", name: "Metro Diagnostics", description: "Bookings, report sync, QR invoices, and consent-aware record links.", icon: Activity },
  { type: "Pharmacy", name: "MediFast Pharmacy", description: "Prescription verification, refill reminders, and medicine delivery tracking.", icon: Pill },
  { type: "Telemedicine", name: "AbhaSetu Virtual Care", description: "Virtual consults, waiting room, doctor certificates, and secure notes.", icon: Video },
  { type: "Diagnostic Center", name: "Prakash Imaging", description: "Radiology slots, imaging reports, and facility QR registration.", icon: ScanLine }
];

export const abdmMilestoneWorkflows = [
  "ABHA Creation using Aadhaar OTP",
  "ABHA Address Creation",
  "ABHA Verification",
  "ABHA Address Verification",
  "Download ABHA Card",
  "Mobile-based ABHA Search",
  "Returning Patient Flow",
  "New Patient Flow",
  "OTP Verification Flow",
  "Aadhaar Authentication",
  "Facility QR Scanning",
  "User ABHA QR Scanning"
];

export const databaseTables = [
  "users",
  "roles_permissions",
  "abha_profiles",
  "doctors",
  "facilities",
  "qr_sessions",
  "consultations",
  "health_records",
  "settings",
  "translations",
  "notifications"
];

export const complianceBadges = [
  { label: "ABDM Ready", icon: BadgeCheck },
  { label: "Consent-first", icon: Lock },
  { label: "Secure Records", icon: FileLock2 },
  { label: "Role guarded", icon: ShieldCheck }
];
