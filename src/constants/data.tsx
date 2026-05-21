import {
  Activity,
  Ambulance,
  Award,
  BadgeCheck,
  BadgePercent,
  Bed,
  Bike,
  BookOpen,
  BrainCircuit,
  Building2,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Droplet,
  Droplets,
  FileCheck,
  FileHeart,
  FileSignature,
  FileText,
  Files,
  FlaskConical,
  FolderLock,
  GraduationCap,
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  Hospital,
  IdCard,
  Info,
  ListChecks,
  Lock,
  MapPin,
  Monitor,
  Package,
  Pill,
  Plane,
  Presentation,
  QrCode,
  Route,
  Scale,
  Scan,
  ScanLine,
  ScrollText,
  ShieldCheck,
  ShieldPlus,
  ShoppingBag,
  Siren,
  Sparkles,
  Stethoscope,
  Store,
  TestTube,
  Timer,
  Truck,
  Umbrella,
  Upload,
  Users,
  Video,
  WalletCards,
} from 'lucide-react';
import type { Appointment, Doctor, HealthRecord, Metric, NotificationItem, ServiceDetail, ServiceSummary } from '@/types/domain';

export const doctors: Doctor[] = [
  { id: 'doc-priya', name: 'Dr. Priya Sharma', role: 'General Physician', time: 'Today, 4:30 PM', fee: 'Rs 499', rating: '4.9' },
  { id: 'doc-arjun', name: 'Dr. Arjun Mehta', role: 'Cardiologist', time: 'Tomorrow, 10:00 AM', fee: 'Rs 899', rating: '4.8' },
  { id: 'doc-neha', name: 'Dr. Neha Kapoor', role: 'Dermatologist', time: 'May 20, 6:15 PM', fee: 'Rs 699', rating: '4.7' },
];

export const appointments: Appointment[] = [
  { id: 'apt-video', title: 'Video consultation', doctor: 'Dr. Priya Sharma', meta: 'Today, 4:30 PM', status: 'Confirmed' },
  { id: 'apt-lab', title: 'Blood test package', doctor: 'CityCare Diagnostics', meta: 'Tomorrow, 8:00 AM', status: 'Sample pickup' },
  { id: 'apt-cardio', title: 'Cardiology follow-up', doctor: 'Dr. Arjun Mehta', meta: 'May 22, 11:30 AM', status: 'Upcoming' },
];

export const records: HealthRecord[] = [
  { id: 'rec-cbc', name: 'CBC Blood Report', type: 'Lab Report', date: 'May 14, 2026', source: 'Apollo Diagnostics' },
  { id: 'rec-rx', name: 'Prescription - Fever Care', type: 'Prescription', date: 'May 10, 2026', source: 'Dr. Priya Sharma' },
  { id: 'rec-atm', name: 'Health ATM Screening', type: 'Vitals', date: 'May 08, 2026', source: 'ABHA SETU Kiosk' },
  { id: 'rec-policy', name: 'Insurance Policy Card', type: 'Insurance', date: 'Apr 29, 2026', source: 'Care Shield Plus' },
];

export const vitals: Metric[] = [
  { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', trend: 'Stable', icon: Activity },
  { label: 'SpO2', value: '98', unit: '%', trend: 'Normal', icon: HeartPulse },
  { label: 'Glucose', value: '98', unit: 'mg/dL', trend: 'In range', icon: Droplets },
  { label: 'Heart Rate', value: '72', unit: 'BPM', trend: 'Resting', icon: Heart },
];

export const quickAccessServices: ServiceSummary[] = [
  { title: 'Consult Doctor', route: '/book-consultation', icon: Stethoscope, desc: 'Instant video and clinic appointments.' },
  { title: 'Order Medicines', route: '/services/medicine-delivery', icon: Pill, desc: 'Upload prescription and track delivery.' },
  { title: 'Book Lab Tests', route: '/services/lab-tests', icon: FlaskConical, desc: 'At-home sample collection slots.' },
  { title: 'Manage Insurance', route: '/services/insurance', icon: ShieldCheck, desc: 'Policy, claims, and cashless support.' },
  { title: 'Training & Courses', route: '/services/training', icon: GraduationCap, desc: 'Health awareness and CPR modules.' },
  { title: 'Hospitals', route: '/services/hospitals', icon: Building2, desc: 'Find nearby network hospitals.' },
  { title: 'Blood Bank', route: '/services/blood-bank', icon: Droplet, desc: 'Check availability and donor requests.' },
  { title: 'Organ Donation', route: '/services/organ-donation', icon: HeartHandshake, desc: 'Register pledge and learn eligibility.' },
  { title: 'QR Scanner', route: '/services/qr-scanner', icon: QrCode, desc: 'Scan prescriptions and ABHA QR codes.' },
  { title: 'Create ABHA Card', route: '/services/abha-card', icon: IdCard, desc: 'Generate a digital health identity.' },
];

export const marketplaceServices: ServiceSummary[] = [
  { title: 'Medicine Delivery', route: '/services/medicine-delivery', icon: Truck, desc: 'Estimated delivery in 42 minutes.' },
  { title: 'Lab Booking', route: '/services/lab-tests', icon: FlaskConical, desc: 'Popular: Full body checkup, HbA1c, Thyroid.' },
  { title: 'Home Sample Collection', route: '/services/home-sample', icon: TestTube, desc: 'Trained phlebotomist visits your address.' },
  { title: 'Medical Equipment', route: '/services/equipment', icon: Stethoscope, desc: 'Rent oxygen concentrators and monitors.' },
  { title: 'Ambulance Booking', route: '/services/ambulance', icon: Ambulance, desc: 'ALS, BLS, and patient transport.' },
  { title: 'Drone Delivery', route: '/services/drone-delivery', icon: Plane, desc: 'Pilot route launching soon in selected zones.' },
];

export const complianceServices: ServiceSummary[] = [
  { title: 'Medicolegal Support', route: '/services/medicolegal-support', icon: Scale, desc: 'Case documentation and expert review.' },
  { title: 'Digital Consent Forms', route: '/services/consent-forms', icon: FileCheck, desc: 'Patient consent capture with audit trail.' },
  { title: 'Prescription Verification', route: '/services/prescription-verification', icon: FileText, desc: 'Validate doctor signature and expiry.' },
  { title: 'Telemedicine Compliance', route: '/services/telemedicine-compliance', icon: ShieldCheck, desc: 'Teleconsultation consent and prescription audit.' },
  { title: 'Legal Docs Vault', route: '/services/legal-vault', icon: Lock, desc: 'Encrypted legal healthcare documents.' },
];

export const insightServices: ServiceSummary[] = [
  { title: 'Health Tips', route: '/services/health-tips', icon: Sparkles, desc: 'Personalized wellness tips.' },
  { title: 'Appointment Reminders', route: '/services/appointment-reminders', icon: CalendarClock, desc: 'Smart reminders for care events.' },
  { title: 'Preventive Care', route: '/services/preventive-care', icon: ShieldPlus, desc: 'Screenings, vaccines, and risk scores.' },
  { title: 'Chronic Disease Programs', route: '/services/chronic-care', icon: HeartPulse, desc: 'Structured programs for long-term care.' },
  { title: 'AI Health Assistant', route: '/services/ai-assistant', icon: BrainCircuit, desc: 'Summaries, nudges, and care navigation.' },
];

export const serviceDetails: Record<string, ServiceDetail> = {
  'medicine-delivery': {
    title: 'Medicine Delivery',
    route: '/services/medicine-delivery',
    icon: Truck,
    subtitle: 'Order prescription medicines from verified pharmacies with realistic delivery status.',
    stats: [
      { label: 'ETA', value: '42', unit: 'mins', trend: 'Nearest partner pharmacy', icon: Timer },
      { label: 'Discount', value: '18', unit: '%', trend: 'On chronic refills', icon: BadgePercent },
      { label: 'Orders', value: '3', unit: 'Active', trend: '1 arriving today', icon: Package },
      { label: 'Safety', value: 'Rx', unit: 'Verified', trend: 'Prescription required', icon: ShieldCheck },
    ],
    panels: [
      { title: 'Current Cart', icon: ShoppingBag, lines: ['Paracetamol 650mg - 10 tablets', 'ORS sachets - 4 packs', 'Digital prescription attached'] },
      { title: 'Delivery Partner', icon: Bike, lines: ['MediFast Pharmacy, 1.8 km away', 'Cold-chain capable', 'Cashless and UPI accepted'] },
    ],
    listTitle: 'Recent Medicine Orders',
    list: ['May 16 - Fever care kit delivered', 'May 02 - BP medicine refill delivered', 'Apr 20 - Vitamin D3 delivered'],
  },
  'lab-tests': {
    title: 'Lab Tests',
    route: '/services/lab-tests',
    icon: FlaskConical,
    subtitle: 'Book diagnostics, compare packages, and schedule home sample collection.',
    stats: [
      { label: 'Packages', value: '24', unit: 'Live', trend: 'NABL partner labs', icon: TestTube },
      { label: 'Earliest Slot', value: '8', unit: 'AM', trend: 'Tomorrow', icon: CalendarClock },
      { label: 'Reports', value: '6', unit: 'hrs', trend: 'Average TAT', icon: FileHeart },
      { label: 'Savings', value: '22', unit: '%', trend: 'On full body checkup', icon: BadgePercent },
    ],
    panels: [
      { title: 'Popular Tests', icon: ClipboardList, lines: ['CBC with ESR', 'HbA1c and fasting glucose', 'Thyroid profile and vitamin D'] },
      { title: 'Preparation Notes', icon: Info, lines: ['Fasting needed for glucose package', 'Keep ABHA card ready', 'Reports auto-sync to locker'] },
    ],
    listTitle: 'Booked Tests',
    list: ['Full body checkup - Tomorrow 8:00 AM', 'HbA1c - May 26, 2026', 'Lipid profile - Completed May 04, 2026'],
  },
  insurance: {
    title: 'Insurance',
    route: '/services/insurance',
    icon: ShieldCheck,
    subtitle: 'Manage policy details, claims, cashless eligibility, and renewal reminders.',
    stats: [
      { label: 'Coverage', value: '5L', unit: 'INR', trend: 'Family floater', icon: Umbrella },
      { label: 'Claims', value: '1', unit: 'Open', trend: 'Under review', icon: FileCheck },
      { label: 'Renewal', value: '42', unit: 'days', trend: 'Auto reminder active', icon: Calendar },
      { label: 'Network', value: '84', unit: 'Hospitals', trend: 'Within city', icon: Building2 },
    ],
    panels: [
      { title: 'Policy Summary', icon: ScrollText, lines: ['Care Shield Plus - Gold', 'Cashless eligible at 84 hospitals', 'Room rent limit: single private room'] },
      { title: 'Claim Tracker', icon: Route, lines: ['OPD reimbursement submitted', 'Documents verified', 'Expected decision: May 21, 2026'] },
    ],
    listTitle: 'Insurance Documents',
    list: ['Policy card - active', 'Claim receipt - OPD May 2026', 'Pre-authorization form - sample'],
  },
  training: {
    title: 'Training & Courses',
    route: '/services/training',
    icon: GraduationCap,
    subtitle: 'Health awareness, CPR basics, caregiver training, and certificates.',
    stats: [
      { label: 'Courses', value: '18', unit: 'Open', trend: 'Self-paced modules', icon: BookOpen },
      { label: 'Progress', value: '64', unit: '%', trend: 'CPR basics', icon: Activity },
      { label: 'Credits', value: '6', unit: 'Earned', trend: 'Wellness learning', icon: Award },
      { label: 'Webinars', value: '2', unit: 'This week', trend: 'Doctor-led', icon: Presentation },
    ],
    panels: [
      { title: 'Recommended Learning', icon: Sparkles, lines: ['CPR basics for families', 'Diabetes food planning', 'First aid for fever and dehydration'] },
      { title: 'Certificate Status', icon: BadgeCheck, lines: ['CPR module in progress', 'Preventive care completed', 'Download available after assessment'] },
    ],
    listTitle: 'Upcoming Sessions',
    list: ['May 20 - Heart health Q&A', 'May 22 - Elder care at home', 'May 25 - Nutrition for busy teams'],
  },
  hospitals: {
    title: 'Hospitals',
    route: '/services/hospitals',
    icon: Building2,
    subtitle: 'Find nearby hospitals, departments, network support, and care availability.',
    stats: [
      { label: 'Nearby', value: '12', unit: 'Hospitals', trend: 'Within 8 km', icon: MapPin },
      { label: 'Beds', value: '38', unit: 'Open', trend: 'General and ICU', icon: Bed },
      { label: 'Cashless', value: '7', unit: 'Network', trend: 'Insurance supported', icon: WalletCards },
      { label: 'ER Wait', value: '14', unit: 'mins', trend: 'City median', icon: Siren },
    ],
    panels: [
      { title: 'Recommended Hospitals', icon: Hospital, lines: ['CityCare Hospital - 2.4 km', 'Aarogya Multi-speciality - 4.1 km', 'Metro Heart Institute - 6.8 km'] },
      { title: 'Available Departments', icon: Stethoscope, lines: ['General medicine', 'Cardiology', 'Diagnostics and emergency'] },
    ],
    listTitle: 'Recent Hospital Activity',
    list: ['CityCare OPD booked for May 22', 'Cashless eligibility checked', 'Emergency contacts updated'],
  },
  'blood-bank': {
    title: 'Blood Bank',
    route: '/services/blood-bank',
    icon: Droplet,
    subtitle: 'Search blood availability, raise donor requests, and contact verified blood banks.',
    stats: [
      { label: 'O+', value: '18', unit: 'Units', trend: 'Nearby stock', icon: Droplet },
      { label: 'B+', value: '9', unit: 'Units', trend: 'Within 5 km', icon: Droplets },
      { label: 'Donors', value: '42', unit: 'Active', trend: 'City network', icon: Users },
      { label: 'Requests', value: '2', unit: 'Open', trend: 'Matched', icon: HandHeart },
    ],
    panels: [
      { title: 'Nearest Banks', icon: MapPin, lines: ['LifeLine Blood Centre - 1.9 km', 'RedCare Bank - 3.2 km', 'Metro Hospital Blood Bank - 5.1 km'] },
      { title: 'Request Checklist', icon: ClipboardCheck, lines: ['Doctor note or hospital request', 'Patient blood group', 'Attendant contact details'] },
    ],
    listTitle: 'Recent Requests',
    list: ['O+ platelets matched - May 12', 'B+ donor request closed - Apr 28', 'Emergency stock alert subscribed'],
  },
  'organ-donation': {
    title: 'Organ Donation',
    route: '/services/organ-donation',
    icon: HeartHandshake,
    subtitle: 'Register a pledge and review organ donation eligibility education.',
    stats: [
      { label: 'Pledge', value: 'Draft', unit: 'Ready', trend: 'Needs confirmation', icon: FileSignature },
      { label: 'Organs', value: '5', unit: 'Selected', trend: 'Editable anytime', icon: Heart },
      { label: 'Witnesses', value: '1', unit: 'Added', trend: '1 pending', icon: Users },
      { label: 'Guide', value: '7', unit: 'mins', trend: 'Education module', icon: BookOpen },
    ],
    panels: [
      { title: 'Pledge Details', icon: HeartHandshake, lines: ['Kidney, liver, heart, cornea, lungs selected', 'Family notification pending', 'Digital consent draft saved'] },
      { title: 'Education', icon: Info, lines: ['Donation is consent-led', 'Medical suitability is assessed later', 'Pledge can be changed anytime'] },
    ],
    listTitle: 'Donation Resources',
    list: ['Eligibility basics', 'Family conversation guide', 'Legal consent overview'],
  },
  'qr-scanner': {
    title: 'QR Scanner',
    route: '/services/qr-scanner',
    icon: QrCode,
    subtitle: 'Scan ABHA QR, prescriptions, lab invoices, and hospital registration codes.',
    stats: [
      { label: 'Scans', value: '14', unit: 'This month', trend: 'All verified', icon: ScanLine },
      { label: 'ABHA QR', value: 'On', unit: 'Ready', trend: 'Identity linked', icon: IdCard },
      { label: 'Uploads', value: '5', unit: 'Files', trend: 'Sent to locker', icon: Upload },
      { label: 'Safety', value: '100', unit: '%', trend: 'Trusted QR only', icon: ShieldCheck },
    ],
    panels: [
      { title: 'Scanner Demo', icon: Scan, lines: ['Point camera at hospital QR', 'Verify service name', 'Save result to Digital Locker'] },
      { title: 'Recent Scan Types', icon: Clock, lines: ['Prescription QR', 'ABHA card QR', 'Lab invoice QR'] },
    ],
    listTitle: 'Recent Scans',
    list: ['Prescription verified - May 17', 'ABHA QR used at CityCare', 'Lab invoice saved to locker'],
  },
};

const createServiceDetail = (
  slug: string,
  summary: ServiceSummary,
  options: { stats?: Metric[]; panels?: ServiceDetail['panels']; list?: string[] } = {},
): ServiceDetail => ({
  title: summary.title,
  route: summary.route,
  icon: summary.icon,
  subtitle: summary.desc,
  stats:
    options.stats ??
    [
      { label: 'Status', value: 'Live', unit: 'Ready', trend: 'Demo workflow', icon: CheckCircle2 },
      { label: 'Requests', value: '4', unit: 'Open', trend: 'This month', icon: Files },
      { label: 'ETA', value: '10', unit: 'mins', trend: 'Average response', icon: Timer },
      { label: 'Security', value: 'On', unit: 'Consent', trend: 'Patient controlled', icon: ShieldCheck },
    ],
  panels:
    options.panels ??
    [
      { title: `${summary.title} Details`, icon: summary.icon, lines: ['Patient profile verified', 'ABHA-linked workflow ready', 'Demo request can be submitted'] },
      { title: 'Recommended Next Steps', icon: ListChecks, lines: ['Review service data', 'Confirm patient consent', 'Continue with secure request'] },
    ],
  listTitle: `Recent ${summary.title} Activity`,
  list: options.list ?? [`${summary.title} request drafted`, 'Profile details verified', 'ABHA sync ready'],
});

const additionalServiceSummaries: ServiceSummary[] = [
  ...quickAccessServices,
  ...marketplaceServices,
  ...complianceServices,
  ...insightServices,
].filter((item) => !serviceDetails[item.route.replace('/services/', '')]);

additionalServiceSummaries.forEach((summary) => {
  serviceDetails[summary.route.replace('/services/', '')] = createServiceDetail(
    summary.route.replace('/services/', ''),
    summary,
  );
});

export const searchableServices: ServiceSummary[] = [
  { title: 'Health', route: '/health', icon: HeartPulse, desc: 'Vitals, care plan, and AI health summary.' },
  { title: 'Appointments', route: '/appointments', icon: Calendar, desc: 'Consultations, lab visits, and reminders.' },
  { title: 'Records', route: '/records', icon: FileText, desc: 'Reports, prescriptions, and health files.' },
  { title: 'Book Appointment', route: '/book-consultation', icon: Users, desc: 'Doctor selection and appointment booking.' },
  { title: 'Health ATM', route: '/health-atm', icon: Monitor, desc: 'Kiosk tests, vitals, and screening reports.' },
  { title: 'Digital Locker', route: '/digital-locker', icon: FolderLock, desc: 'Secure records, consent, and file sharing.' },
  { title: 'Live Health Dashboard', route: '/live-dashboard', icon: Activity, desc: 'Live vitals and connected-device metrics.' },
  { title: 'Telemedicine', route: '/telemedicine', icon: Video, desc: 'Video consults and waiting room.' },
  { title: 'Marketplace', route: '/marketplace', icon: Store, desc: 'Medicine, labs, equipment, ambulance services.' },
  { title: 'Medicolegal & Compliance', route: '/compliance', icon: Scale, desc: 'Consent, legal vault, and compliance checks.' },
  { title: 'Health Insights & Education', route: '/insights', icon: BookOpen, desc: 'Tips, reminders, programs, and assistant.' },
  ...quickAccessServices,
  ...marketplaceServices,
  ...complianceServices,
  ...insightServices,
].filter((item, index, collection) => index === collection.findIndex((entry) => entry.route === item.route));

export const notifications: NotificationItem[] = [
  {
    id: 'not-appointment',
    title: 'Appointment confirmed',
    message: 'Video consultation with Dr. Priya Sharma is scheduled for today at 4:30 PM.',
    time: '2 min ago',
    unread: true,
    route: '/appointments',
  },
  {
    id: 'not-report',
    title: 'Report uploaded',
    message: 'CBC Blood Report was added to your Digital Locker.',
    time: '35 min ago',
    unread: true,
    route: '/records',
  },
  {
    id: 'not-ai',
    title: 'AI health nudge',
    message: 'Hydration looks low today. Review your health summary.',
    time: '1 hr ago',
    unread: false,
    route: '/health',
  },
];
