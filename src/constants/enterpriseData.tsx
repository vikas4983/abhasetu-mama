import {
  Activity,
  BadgeCheck,
  BookOpen,
  Building2,
  Camera,
  ClipboardCheck,
  Download,
  FileBadge,
  FileHeart,
  HeartPulse,
  IdCard,
  Leaf,
  LockKeyhole,
  Microscope,
  Phone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Video,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface InsightArticle {
  id: string;
  title: string;
  category: 'Health Insight' | 'Education' | 'Skin Care';
  summary: string;
  readTime: string;
  icon: LucideIcon;
  accent: string;
}

export const insightCategories = ['All', 'Health Insight', 'Education', 'Skin Care'] as const;

export const insightArticles: InsightArticle[] = [
  {
    id: 'cardio-risk',
    title: 'Understand early cardiac risk signals',
    category: 'Health Insight',
    summary: 'Learn how vitals, family history, and lifestyle markers can guide timely preventive care.',
    readTime: '5 min',
    icon: HeartPulse,
    accent: 'teal',
  },
  {
    id: 'abdm-consent',
    title: 'How consent-based health record sharing works',
    category: 'Education',
    summary: 'A practical guide to digital consent, record access, and patient-controlled sharing in ABDM workflows.',
    readTime: '7 min',
    icon: LockKeyhole,
    accent: 'cyan',
  },
  {
    id: 'skin-barrier',
    title: 'Build a safe skin barrier routine',
    category: 'Skin Care',
    summary: 'Simple dermatologist-led habits for hydration, sunscreen, irritation control, and seasonal care.',
    readTime: '4 min',
    icon: Leaf,
    accent: 'emerald',
  },
  {
    id: 'lab-reports',
    title: 'Read common lab report patterns',
    category: 'Education',
    summary: 'Decode CBC, glucose, lipid, and thyroid trends before discussing next steps with a clinician.',
    readTime: '6 min',
    icon: Microscope,
    accent: 'blue',
  },
  {
    id: 'preventive-care',
    title: 'Preventive screening calendar',
    category: 'Health Insight',
    summary: 'Plan checkups, vaccines, and health ATM screenings around age, risk, and family context.',
    readTime: '5 min',
    icon: ClipboardCheck,
    accent: 'teal',
  },
  {
    id: 'acne-care',
    title: 'Acne care without over-treatment',
    category: 'Skin Care',
    summary: 'A calm routine for cleansing, actives, sun protection, and when to consult a specialist.',
    readTime: '3 min',
    icon: Sparkles,
    accent: 'emerald',
  },
];

export interface DoctorProfile {
  id: string;
  name: string;
  degree: string;
  speciality: string;
  experience: string;
  description: string;
  photoUrl: string;
  certificateUrl: string;
  certificateLabel: string;
}

export const doctorProfiles: DoctorProfile[] = [
  {
    id: 'dr-ayesha-ali',
    name: 'DR AYESHA ALI',
    degree: 'DHMS, BSC, LLB, M.D HOMEO',
    speciality: 'Homeopathy, governance, patient counselling',
    experience: '35 years of experience',
    description:
      'Former Registrar, Madhya Pradesh State Council of Homeopathy, Bhopal. Focused on safe longitudinal care, chronic case review, and compliant digital consultation workflows.',
    photoUrl: 'https://csspicker.dev/api/image/?q=senior+female+doctor+portrait&image_type=photo',
    certificateUrl: '/certificates/dr-ayesha-ali-certificate.svg',
    certificateLabel: 'ABDM approved certificate - DR AYESHA ALI',
  },
  {
    id: 'dr-yogyata-mukhraiya',
    name: 'DR.YOGYATA MUKHRAIYA',
    degree: 'BHMS',
    speciality: 'Residential Medical Officer',
    experience: 'Chronic disease and female health specialist',
    description:
      'Expertise in chronic diseases and female related problems, including infertility support. Patient-first consultation style with structured follow-up planning.',
    photoUrl: 'https://csspicker.dev/api/image/?q=indian+female+doctor+portrait&image_type=photo',
    certificateUrl: '/certificates/dr-yogyata-mukhraiya-certificate.svg',
    certificateLabel: 'ABDM approved certificate - DR.YOGYATA MUKHRAIYA',
  },
  {
    id: 'dr-amitendu-giradonia',
    name: 'Amitendu Giradonia',
    degree: 'BHMS',
    speciality: 'Homoeopathy',
    experience: '18 years of experience',
    description:
      'Experienced homoeopathy practitioner supporting chronic, family, and preventive care consultations through secure digital health workflows.',
    photoUrl: 'https://csspicker.dev/api/image/?q=indian+male+doctor+portrait&image_type=photo',
    certificateUrl: '/certificates/dr-amitendu-giradonia-certificate.svg',
    certificateLabel: 'ABDM approved certificate - Amitendu Giradonia',
  },
];

export const platformStats = [
  { label: 'Registered Users', value: 49, suffix: 'M+', icon: Users },
  { label: 'ABHA Created', value: 44, suffix: 'M+', icon: IdCard },
  { label: 'Documents Uploaded', value: 42, suffix: 'M+', icon: FileHeart },
  { label: 'Tokens Generated', value: 81, suffix: 'M+', icon: Activity },
] as const;

export const facilities = [
  {
    title: 'Telemedicine',
    description: 'Video, audio, and follow-up consultations with certificate-backed providers.',
    icon: Video,
  },
  {
    title: 'ABDM Identity',
    description: 'Create, verify, and manage ABHA number and ABHA address journeys.',
    icon: IdCard,
  },
  {
    title: 'QR Assisted Care',
    description: 'Scan facility QR codes and route patients into secure digital onboarding.',
    icon: QrCode,
  },
  {
    title: 'Digital Health Records',
    description: 'Consent-aware document locker for prescriptions, lab reports, and certificates.',
    icon: FileBadge,
  },
  {
    title: 'Facility Network',
    description: 'Discover hospitals, labs, home care, and ABDM-connected service providers.',
    icon: Building2,
  },
  {
    title: 'Security Operations',
    description: 'Audit-friendly consent, validation, masked errors, and encryption-ready contracts.',
    icon: ShieldCheck,
  },
] as const;

export const abdmMilestoneOneSteps = [
  'Create ABHA using Aadhaar OTP',
  'Verify Aadhaar OTP and mobile OTP',
  'Verify ABHA number and ABHA address',
  'Create ABHA address for new users',
  'Download ABHA card through a backend proxy',
  'Scan facility QR for assisted onboarding',
  'Support returning patient verification flow',
] as const;

export const contactInfo = {
  email: 'contact@abhasetu.com',
  phone: '+91-9981057765',
  address: 'Madar Gate, Panchampura, Katangi, Jabalpur, Madhya Pradesh, PIN 483105',
  social: {
    linkedin: 'https://www.linkedin.com/in/abha-setu-37481a410',
    instagram: 'https://www.instagram.com/abha.setu?igsh=c3oydW13dm44eTJ2',
    facebook: 'https://www.facebook.com/share/1Eb3rV5tPj/',
  },
} as const;

export const timeline = [
  { year: '2024', title: 'Digital care foundation', description: 'Designed patient-first care journeys around health identity, records, and access.' },
  { year: '2025', title: 'ABDM sandbox alignment', description: 'Mapped onboarding, verification, QR, and card workflows against ABDM V3 patterns.' },
  { year: '2026', title: 'Enterprise health platform', description: 'Expanded into telemedicine, insights, secure document handling, and facility services.' },
] as const;

export const qrFlowCards = [
  { title: 'Camera permission', description: 'Request camera access only when the patient starts a scan.', icon: Camera },
  { title: 'Facility QR decode', description: 'Parse QR payloads in a backend-verifiable format before onboarding.', icon: QrCode },
  { title: 'Patient verification', description: 'Continue with OTP, mobile, or returning patient verification.', icon: Phone },
  { title: 'Consent logging', description: 'Record consent context before sensitive ABDM actions.', icon: ShieldCheck },
] as const;

export const policySections = {
  terms: [
    'Use AbhaSetu only for lawful healthcare, wellness, appointment, record, and ABDM-related workflows.',
    'Medical content in this demo is informational and does not replace professional clinical judgement.',
    'Users are responsible for providing accurate information during ABHA, appointment, and consent flows.',
    'ABDM sandbox and production usage must follow current official documentation, consent rules, and security requirements.',
    'Service availability may depend on providers, network partners, identity verification, and regulatory approvals.',
  ],
  privacy: [
    'AbhaSetu follows privacy-by-design principles for health identity, contact, medical, and consent information.',
    'Sensitive ABDM credentials, Aadhaar OTPs, private keys, and health tokens must be handled by secure backend services only.',
    'Health data should be collected with purpose limitation, consent, minimal retention, encryption, and auditability.',
    'Users should be able to review, revoke, and understand consent for health record sharing where applicable.',
    'This frontend demo uses static mock data and does not currently transmit real patient health information.',
  ],
} as const;

export const abdmReferenceUrl = 'https://sandbox.abdm.gov.in/sandbox/v3/new-documentation';
