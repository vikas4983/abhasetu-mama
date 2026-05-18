const navRoutes = {
  Home: "home",
  Health: "health",
  Appointments: "appointments",
  Records: "records",
  More: "more",
};

const featureRoutes = {
  "Book Consultation": "book-consultation",
  "Health ATM": "health-atm",
  "Digital Locker": "digital-locker",
  "Quick Access": "quick-access",
  "Live Health Dashboard": "live-dashboard",
  Telemedicine: "telemedicine",
  Marketplace: "marketplace",
  "Medicolegal & Compliance": "compliance",
  "Health Insights & Education": "insights",
  "Consult Doctor": "book-consultation",
  "Order Medicines": "medicine-delivery",
  "Book Lab Tests": "lab-tests",
  "Manage Insurance": "insurance",
  "Training & Courses": "training",
  Hospitals: "hospitals",
  "Blood Bank": "blood-bank",
  "Organ Donation": "organ-donation",
  "QR Scanner": "qr-scanner",
  "Create ABHA Card": "abha-card",
  "Medicine Delivery": "medicine-delivery",
  "Lab Booking": "lab-tests",
  "Home Sample Collection": "home-sample",
  "Medical Equipment": "equipment",
  "Ambulance Booking": "ambulance",
  "Drone Delivery": "drone-delivery",
  "Medicolegal Support": "medicolegal-support",
  "Digital Consent Forms": "consent-forms",
  "Prescription Verification": "prescription-verification",
  "Secure Health Records": "records",
  "Telemedicine Compliance": "telemedicine-compliance",
  "Legal Docs Vault": "legal-vault",
  "Health Tips": "health-tips",
  "Appointment Reminders": "appointment-reminders",
  "Preventive Care": "preventive-care",
  "Chronic Disease Programs": "chronic-care",
  "AI Health Assistant": "ai-assistant",
};

const doctors = [
  { name: "Dr. Priya Sharma", role: "General Physician", time: "Today, 4:30 PM", fee: "Rs 499", rating: "4.9" },
  { name: "Dr. Arjun Mehta", role: "Cardiologist", time: "Tomorrow, 10:00 AM", fee: "Rs 899", rating: "4.8" },
  { name: "Dr. Neha Kapoor", role: "Dermatologist", time: "May 20, 6:15 PM", fee: "Rs 699", rating: "4.7" },
];

const appointments = [
  { title: "Video consultation", doctor: "Dr. Priya Sharma", meta: "Today, 4:30 PM", status: "Confirmed" },
  { title: "Blood test package", doctor: "CityCare Diagnostics", meta: "Tomorrow, 8:00 AM", status: "Sample pickup" },
  { title: "Cardiology follow-up", doctor: "Dr. Arjun Mehta", meta: "May 22, 11:30 AM", status: "Upcoming" },
];

const records = [
  { name: "CBC Blood Report", type: "Lab Report", date: "May 14, 2026", source: "Apollo Diagnostics" },
  { name: "Prescription - Fever Care", type: "Prescription", date: "May 10, 2026", source: "Dr. Priya Sharma" },
  { name: "Health ATM Screening", type: "Vitals", date: "May 08, 2026", source: "ABHA SETU Kiosk" },
  { name: "Insurance Policy Card", type: "Insurance", date: "Apr 29, 2026", source: "Care Shield Plus" },
];

const vitals = [
  { label: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "Stable", icon: "activity" },
  { label: "SpO2", value: "98", unit: "%", trend: "Normal", icon: "heart-pulse" },
  { label: "Glucose", value: "98", unit: "mg/dL", trend: "In range", icon: "droplets" },
  { label: "Heart Rate", value: "72", unit: "BPM", trend: "Resting", icon: "heart" },
];

const services = [
  { title: "Consult Doctor", route: "book-consultation", icon: "stethoscope", desc: "Instant video and clinic appointments." },
  { title: "Order Medicines", route: "medicine-delivery", icon: "pill", desc: "Upload prescription and track delivery." },
  { title: "Book Lab Tests", route: "lab-tests", icon: "flask-conical", desc: "At-home sample collection slots." },
  { title: "Manage Insurance", route: "insurance", icon: "shield-check", desc: "Policy, claims, and cashless support." },
  { title: "Training & Courses", route: "training", icon: "graduation-cap", desc: "Health awareness and CPR modules." },
  { title: "Hospitals", route: "hospitals", icon: "building-2", desc: "Find nearby network hospitals." },
  { title: "Blood Bank", route: "blood-bank", icon: "droplet", desc: "Check availability and donor requests." },
  { title: "Organ Donation", route: "organ-donation", icon: "heart-handshake", desc: "Register pledge and learn eligibility." },
  { title: "QR Scanner", route: "qr-scanner", icon: "qr-code", desc: "Scan prescriptions and ABHA QR codes." },
  { title: "Create ABHA Card", route: "abha-card", icon: "id-card", desc: "Generate a digital health identity." },
];

const marketplace = [
  { title: "Medicine Delivery", route: "medicine-delivery", icon: "truck", desc: "Estimated delivery in 42 minutes." },
  { title: "Lab Booking", route: "lab-tests", icon: "flask-conical", desc: "Popular: Full body checkup, HbA1c, Thyroid." },
  { title: "Home Sample Collection", route: "home-sample", icon: "test-tube", desc: "Trained phlebotomist visits your address." },
  { title: "Medical Equipment", route: "equipment", icon: "stethoscope", desc: "Rent oxygen concentrators and monitors." },
  { title: "Ambulance Booking", route: "ambulance", icon: "ambulance", desc: "ALS, BLS, and patient transport." },
  { title: "Drone Delivery", route: "drone-delivery", icon: "plane", desc: "Pilot route launching soon in selected zones." },
];

const serviceDetails = {
  "medicine-delivery": {
    title: "Medicine Delivery",
    icon: "truck",
    subtitle: "Order prescription medicines from verified pharmacies with realistic delivery status.",
    stats: [
      { label: "ETA", value: "42", unit: "mins", trend: "Nearest partner pharmacy", icon: "timer" },
      { label: "Discount", value: "18", unit: "%", trend: "On chronic refills", icon: "badge-percent" },
      { label: "Orders", value: "3", unit: "Active", trend: "1 arriving today", icon: "package" },
      { label: "Safety", value: "Rx", unit: "Verified", trend: "Prescription required", icon: "shield-check" },
    ],
    panels: [
      { title: "Current Cart", icon: "shopping-bag", lines: ["Paracetamol 650mg - 10 tablets", "ORS sachets - 4 packs", "Digital prescription attached"] },
      { title: "Delivery Partner", icon: "bike", lines: ["MediFast Pharmacy, 1.8 km away", "Cold-chain capable", "Cashless and UPI accepted"] },
    ],
    listTitle: "Recent Medicine Orders",
    list: ["May 16 - Fever care kit delivered", "May 02 - BP medicine refill delivered", "Apr 20 - Vitamin D3 delivered"],
  },
  "lab-tests": {
    title: "Lab Tests",
    icon: "flask-conical",
    subtitle: "Book diagnostics, compare packages, and schedule home sample collection.",
    stats: [
      { label: "Packages", value: "24", unit: "Live", trend: "NABL partner labs", icon: "test-tube" },
      { label: "Earliest Slot", value: "8", unit: "AM", trend: "Tomorrow", icon: "calendar-clock" },
      { label: "Reports", value: "6", unit: "hrs", trend: "Average TAT", icon: "file-heart" },
      { label: "Savings", value: "22", unit: "%", trend: "On full body checkup", icon: "badge-percent" },
    ],
    panels: [
      { title: "Popular Tests", icon: "clipboard-list", lines: ["CBC with ESR", "HbA1c and fasting glucose", "Thyroid profile and vitamin D"] },
      { title: "Preparation Notes", icon: "info", lines: ["Fasting needed for glucose package", "Keep ABHA card ready", "Reports auto-sync to locker"] },
    ],
    listTitle: "Booked Tests",
    list: ["Full body checkup - Tomorrow 8:00 AM", "HbA1c - May 26, 2026", "Lipid profile - Completed May 04, 2026"],
  },
  insurance: {
    title: "Insurance",
    icon: "shield-check",
    subtitle: "Manage policy details, claims, cashless eligibility, and renewal reminders.",
    stats: [
      { label: "Coverage", value: "5L", unit: "INR", trend: "Family floater", icon: "umbrella" },
      { label: "Claims", value: "1", unit: "Open", trend: "Under review", icon: "file-check" },
      { label: "Renewal", value: "42", unit: "days", trend: "Auto reminder active", icon: "calendar" },
      { label: "Network", value: "84", unit: "Hospitals", trend: "Within city", icon: "building-2" },
    ],
    panels: [
      { title: "Policy Summary", icon: "scroll-text", lines: ["Care Shield Plus - Gold", "Cashless eligible at 84 hospitals", "Room rent limit: single private room"] },
      { title: "Claim Tracker", icon: "route", lines: ["OPD reimbursement submitted", "Documents verified", "Expected decision: May 21, 2026"] },
    ],
    listTitle: "Insurance Documents",
    list: ["Policy card - active", "Claim receipt - OPD May 2026", "Pre-authorization form - sample"],
  },
  training: {
    title: "Training & Courses",
    icon: "graduation-cap",
    subtitle: "Health awareness, CPR basics, caregiver training, and certificates.",
    stats: [
      { label: "Courses", value: "18", unit: "Open", trend: "Self-paced modules", icon: "book-open" },
      { label: "Progress", value: "64", unit: "%", trend: "CPR basics", icon: "activity" },
      { label: "Credits", value: "6", unit: "Earned", trend: "Wellness learning", icon: "award" },
      { label: "Webinars", value: "2", unit: "This week", trend: "Doctor-led", icon: "presentation" },
    ],
    panels: [
      { title: "Recommended Learning", icon: "sparkles", lines: ["CPR basics for families", "Diabetes food planning", "First aid for fever and dehydration"] },
      { title: "Certificate Status", icon: "badge-check", lines: ["CPR module in progress", "Preventive care completed", "Download available after assessment"] },
    ],
    listTitle: "Upcoming Sessions",
    list: ["May 20 - Heart health Q&A", "May 22 - Elder care at home", "May 25 - Nutrition for busy teams"],
  },
  hospitals: {
    title: "Hospitals",
    icon: "building-2",
    subtitle: "Find nearby hospitals, departments, network support, and care availability.",
    stats: [
      { label: "Nearby", value: "12", unit: "Hospitals", trend: "Within 8 km", icon: "map-pin" },
      { label: "Beds", value: "38", unit: "Open", trend: "General and ICU", icon: "bed" },
      { label: "Cashless", value: "7", unit: "Network", trend: "Insurance supported", icon: "wallet-cards" },
      { label: "ER Wait", value: "14", unit: "mins", trend: "City median", icon: "siren" },
    ],
    panels: [
      { title: "Recommended Hospitals", icon: "hospital", lines: ["CityCare Hospital - 2.4 km", "Aarogya Multi-speciality - 4.1 km", "Metro Heart Institute - 6.8 km"] },
      { title: "Available Departments", icon: "stethoscope", lines: ["General medicine", "Cardiology", "Diagnostics and emergency"] },
    ],
    listTitle: "Recent Hospital Activity",
    list: ["CityCare OPD booked for May 22", "Cashless eligibility checked", "Emergency contacts updated"],
  },
  "blood-bank": {
    title: "Blood Bank",
    icon: "droplet",
    subtitle: "Search blood availability, raise donor requests, and contact verified blood banks.",
    stats: [
      { label: "O+", value: "18", unit: "Units", trend: "Nearby stock", icon: "droplet" },
      { label: "B+", value: "9", unit: "Units", trend: "Within 5 km", icon: "droplets" },
      { label: "Donors", value: "42", unit: "Active", trend: "City network", icon: "users" },
      { label: "Requests", value: "2", unit: "Open", trend: "Matched", icon: "hand-heart" },
    ],
    panels: [
      { title: "Nearest Banks", icon: "map-pin", lines: ["LifeLine Blood Centre - 1.9 km", "RedCare Bank - 3.2 km", "Metro Hospital Blood Bank - 5.1 km"] },
      { title: "Request Checklist", icon: "clipboard-check", lines: ["Doctor note or hospital request", "Patient blood group", "Attendant contact details"] },
    ],
    listTitle: "Recent Requests",
    list: ["O+ platelets matched - May 12", "B+ donor request closed - Apr 28", "Emergency stock alert subscribed"],
  },
  "organ-donation": {
    title: "Organ Donation",
    icon: "heart-handshake",
    subtitle: "Register a pledge and review organ donation eligibility education.",
    stats: [
      { label: "Pledge", value: "Draft", unit: "Ready", trend: "Needs confirmation", icon: "file-signature" },
      { label: "Organs", value: "5", unit: "Selected", trend: "Editable anytime", icon: "heart" },
      { label: "Witnesses", value: "1", unit: "Added", trend: "1 pending", icon: "users" },
      { label: "Guide", value: "7", unit: "mins", trend: "Education module", icon: "book-open" },
    ],
    panels: [
      { title: "Pledge Details", icon: "heart-plus", lines: ["Kidney, liver, heart, cornea, lungs selected", "Family notification pending", "Digital consent draft saved"] },
      { title: "Education", icon: "info", lines: ["Donation is consent-led", "Medical suitability is assessed later", "Pledge can be changed anytime"] },
    ],
    listTitle: "Donation Resources",
    list: ["Eligibility basics", "Family conversation guide", "Legal consent overview"],
  },
  "qr-scanner": {
    title: "QR Scanner",
    icon: "qr-code",
    subtitle: "Scan ABHA QR, prescriptions, lab invoices, and hospital registration codes.",
    stats: [
      { label: "Scans", value: "14", unit: "This month", trend: "All verified", icon: "scan-line" },
      { label: "ABHA QR", value: "On", unit: "Ready", trend: "Identity linked", icon: "id-card" },
      { label: "Uploads", value: "5", unit: "Files", trend: "Sent to locker", icon: "upload" },
      { label: "Safety", value: "100", unit: "%", trend: "Trusted QR only", icon: "shield-check" },
    ],
    panels: [
      { title: "Scanner Demo", icon: "scan", lines: ["Point camera at hospital QR", "Verify service name", "Save result to Digital Locker"] },
      { title: "Recent Scan Types", icon: "history", lines: ["Prescription QR", "ABHA card QR", "Lab invoice QR"] },
    ],
    listTitle: "Recent Scans",
    list: ["Prescription verified - May 17", "ABHA QR used at CityCare", "Lab invoice saved to locker"],
  },
  "abha-card": {
    title: "Create ABHA Card",
    icon: "id-card",
    subtitle: "Create or manage an ABHA health card with demo identity verification.",
    stats: [
      { label: "Status", value: "Ready", unit: "To create", trend: "Mobile verified", icon: "badge-check" },
      { label: "Steps", value: "2", unit: "Left", trend: "KYC and consent", icon: "list-checks" },
      { label: "Linked", value: "4", unit: "Records", trend: "Available after sync", icon: "link" },
      { label: "Privacy", value: "DPDP", unit: "Ready", trend: "Consent managed", icon: "lock" },
    ],
    panels: [
      { title: "Identity Details", icon: "user-check", lines: ["Name: Ananya Verma", "Mobile ending 4207", "Address verification pending"] },
      { title: "After Creation", icon: "share-2", lines: ["Use QR at hospitals", "Link lab reports", "Share records with consent"] },
    ],
    listTitle: "ABHA Actions",
    list: ["Create ABHA number", "Download card PDF", "Link existing health records"],
  },
  "home-sample": {
    title: "Home Sample Collection",
    icon: "test-tube",
    subtitle: "Schedule a home collection slot with phlebotomist details and preparation notes.",
    stats: [
      { label: "Slot", value: "8", unit: "AM", trend: "Tomorrow", icon: "calendar-clock" },
      { label: "Collector", value: "4.8", unit: "Rating", trend: "Verified staff", icon: "user-round-check" },
      { label: "Tests", value: "3", unit: "Selected", trend: "CBC, thyroid, glucose", icon: "flask-conical" },
      { label: "Reports", value: "6", unit: "hrs", trend: "Auto-sync", icon: "file-heart" },
    ],
    panels: [
      { title: "Visit Details", icon: "home", lines: ["Address: Sector 21, New Delhi", "Collector: Ravi Kumar", "OTP verification required"] },
      { title: "Preparation", icon: "info", lines: ["Fasting 8 hours for glucose", "Keep water intake normal", "Keep ABHA card ready"] },
    ],
    listTitle: "Collection History",
    list: ["May 12 - CBC sample collected", "Apr 25 - Thyroid profile collected", "Apr 11 - Vitamin D collected"],
  },
  equipment: {
    title: "Medical Equipment",
    icon: "stethoscope",
    subtitle: "Rent or buy medical equipment with service support and installation status.",
    stats: [
      { label: "Devices", value: "32", unit: "Listed", trend: "Verified sellers", icon: "monitor" },
      { label: "Rental", value: "24", unit: "hrs", trend: "Fastest setup", icon: "clock" },
      { label: "Support", value: "7", unit: "Days", trend: "Technician available", icon: "headphones" },
      { label: "Orders", value: "1", unit: "Active", trend: "BP monitor rental", icon: "package-check" },
    ],
    panels: [
      { title: "Popular Equipment", icon: "shopping-cart", lines: ["Oxygen concentrator", "BP monitor", "Wheelchair and hospital bed"] },
      { title: "Installation Support", icon: "wrench", lines: ["Technician visit available", "Demo on delivery", "Deposit handled digitally"] },
    ],
    listTitle: "Recent Equipment Requests",
    list: ["BP monitor rental - active", "Wheelchair quote - shared", "Nebulizer purchase - delivered"],
  },
  ambulance: {
    title: "Ambulance Booking",
    icon: "ambulance",
    subtitle: "Book emergency or planned ambulance transport with live crew assignment.",
    stats: [
      { label: "ETA", value: "9", unit: "mins", trend: "Nearest BLS unit", icon: "timer" },
      { label: "Types", value: "3", unit: "Available", trend: "BLS, ALS, transport", icon: "ambulance" },
      { label: "Crew", value: "2", unit: "Assigned", trend: "Paramedic and driver", icon: "users" },
      { label: "Hospitals", value: "5", unit: "Nearby", trend: "ER notified", icon: "hospital" },
    ],
    panels: [
      { title: "Booking Mode", icon: "siren", lines: ["Emergency pickup", "Planned transfer", "Intercity patient transport"] },
      { title: "Patient Details", icon: "clipboard-plus", lines: ["Adult patient", "Oxygen support optional", "Attendant seat available"] },
    ],
    listTitle: "Ambulance History",
    list: ["Demo ALS booking - May 01", "Planned discharge transfer - Apr 12", "Emergency contacts verified"],
  },
  "drone-delivery": {
    title: "Drone Delivery",
    icon: "plane",
    subtitle: "Preview upcoming drone routes for urgent medicines and diagnostic samples.",
    stats: [
      { label: "Status", value: "Pilot", unit: "Soon", trend: "Selected zones", icon: "radio-tower" },
      { label: "Payload", value: "2", unit: "kg", trend: "Medicine and samples", icon: "package" },
      { label: "Route", value: "8", unit: "km", trend: "Testing corridor", icon: "route" },
      { label: "ETA", value: "15", unit: "mins", trend: "Projected", icon: "timer" },
    ],
    panels: [
      { title: "Pilot Coverage", icon: "map", lines: ["Hospital to lab corridor", "Urgent sample movement", "Temperature-tracked payload"] },
      { title: "Launch Checklist", icon: "clipboard-check", lines: ["Regulatory approval pending", "Partner labs onboarded", "Patient opt-in required"] },
    ],
    listTitle: "Pilot Updates",
    list: ["Route simulation complete", "Cold-chain pod tested", "User waitlist opened"],
  },
  "medicolegal-support": {
    title: "Medicolegal Support",
    icon: "scale",
    subtitle: "Case documentation, expert review, and secure legal-health handoff support.",
    stats: [
      { label: "Cases", value: "2", unit: "Drafts", trend: "Not submitted", icon: "folder-open" },
      { label: "Experts", value: "6", unit: "Online", trend: "Medical law panel", icon: "users" },
      { label: "SLA", value: "24", unit: "hrs", trend: "First review", icon: "clock" },
      { label: "Vault", value: "On", unit: "Secure", trend: "Encrypted docs", icon: "lock" },
    ],
    panels: [
      { title: "Case Packet", icon: "briefcase-medical", lines: ["Incident note", "Treatment timeline", "Supporting records and consent"] },
      { title: "Expert Review", icon: "user-check", lines: ["Doctor summary", "Legal checklist", "Recommended next action"] },
    ],
    listTitle: "Medicolegal Tasks",
    list: ["Consent packet generated", "Treatment timeline drafted", "Expert review not submitted"],
  },
  "consent-forms": {
    title: "Digital Consent Forms",
    icon: "file-check",
    subtitle: "Capture patient consent with audit trails and digital sharing controls.",
    stats: [
      { label: "Forms", value: "9", unit: "Templates", trend: "Clinic and telemedicine", icon: "files" },
      { label: "Signed", value: "3", unit: "Active", trend: "Valid this month", icon: "pen-line" },
      { label: "Expiry", value: "2", unit: "Soon", trend: "Needs renewal", icon: "calendar-clock" },
      { label: "Audit", value: "On", unit: "Logged", trend: "Time and IP captured", icon: "shield-check" },
    ],
    panels: [
      { title: "Consent Templates", icon: "file-text", lines: ["Telemedicine consent", "Record sharing consent", "Lab sample collection consent"] },
      { title: "Sharing Controls", icon: "sliders-horizontal", lines: ["Doctor-specific access", "Time-bound permission", "Revoke anytime"] },
    ],
    listTitle: "Recent Consent",
    list: ["Record sharing - Dr. Priya Sharma", "Lab collection - CityCare Diagnostics", "Telemedicine consent - active"],
  },
  "prescription-verification": {
    title: "Prescription Verification",
    icon: "file-text",
    subtitle: "Validate doctor signature, prescription expiry, medicine safety, and pharmacy acceptance.",
    stats: [
      { label: "Verified", value: "7", unit: "Rx", trend: "This month", icon: "badge-check" },
      { label: "Expiry", value: "1", unit: "Soon", trend: "Refill needed", icon: "calendar-clock" },
      { label: "Pharmacy", value: "12", unit: "Partners", trend: "Accept digital Rx", icon: "store" },
      { label: "Safety", value: "2", unit: "Flags", trend: "Dose reminders", icon: "shield-alert" },
    ],
    panels: [
      { title: "Latest Prescription", icon: "clipboard-check", lines: ["Dr. Priya Sharma", "Issued May 10, 2026", "Valid until June 09, 2026"] },
      { title: "Verification Checks", icon: "scan-search", lines: ["Doctor registration matched", "Digital signature valid", "Medicine list readable"] },
    ],
    listTitle: "Prescription History",
    list: ["Fever care prescription - verified", "BP refill prescription - verified", "Skin care prescription - expired"],
  },
  "telemedicine-compliance": {
    title: "Telemedicine Compliance",
    icon: "shield-check",
    subtitle: "Review consent, prescription, doctor identity, and teleconsultation compliance status.",
    stats: [
      { label: "Sessions", value: "4", unit: "Compliant", trend: "This month", icon: "video" },
      { label: "Consent", value: "100", unit: "%", trend: "Captured", icon: "file-check" },
      { label: "Doctor ID", value: "On", unit: "Verified", trend: "Registry matched", icon: "badge-check" },
      { label: "Audit", value: "30", unit: "days", trend: "Log retention", icon: "database" },
    ],
    panels: [
      { title: "Compliance Checklist", icon: "list-checks", lines: ["Patient consent captured", "Doctor profile visible", "Prescription synced after consult"] },
      { title: "Session Logs", icon: "history", lines: ["Start and end time", "Mode: video/audio", "Care summary attached"] },
    ],
    listTitle: "Recent Compliance Events",
    list: ["Video consult log saved", "Prescription verification complete", "Consent renewed for Dr. Priya"],
  },
  "legal-vault": {
    title: "Legal Docs Vault",
    icon: "lock",
    subtitle: "Encrypted legal healthcare document storage with patient-controlled sharing.",
    stats: [
      { label: "Docs", value: "11", unit: "Stored", trend: "Encrypted", icon: "folder-lock" },
      { label: "Shared", value: "2", unit: "Active", trend: "Expires soon", icon: "share-2" },
      { label: "Audit", value: "On", unit: "Live", trend: "Access tracked", icon: "shield-check" },
      { label: "Backup", value: "2", unit: "Copies", trend: "Cloud + local escrow", icon: "database-backup" },
    ],
    panels: [
      { title: "Vault Folders", icon: "folder", lines: ["Consent forms", "Medicolegal packets", "Insurance legal documents"] },
      { title: "Access Control", icon: "key-round", lines: ["OTP gated access", "Time-bound sharing", "Download watermarking"] },
    ],
    listTitle: "Vault Activity",
    list: ["Consent PDF uploaded", "Legal note shared with hospital", "Insurance form access expired"],
  },
  "health-tips": {
    title: "Health Tips",
    icon: "sparkles",
    subtitle: "Daily wellness tips personalized from vitals, appointments, and care history.",
    stats: [
      { label: "Tips", value: "5", unit: "Today", trend: "Personalized", icon: "lightbulb" },
      { label: "Streak", value: "12", unit: "Days", trend: "Wellness habit", icon: "flame" },
      { label: "Focus", value: "Sleep", unit: "Tonight", trend: "Based on activity", icon: "moon" },
      { label: "Saved", value: "18", unit: "Tips", trend: "In library", icon: "bookmark" },
    ],
    panels: [
      { title: "Today Suggestions", icon: "sun", lines: ["Walk 15 minutes after dinner", "Drink water before evening commute", "Avoid caffeine after 6 PM"] },
      { title: "Why These Tips", icon: "brain", lines: ["Activity is below weekly average", "Hydration reminders were missed", "Sleep consistency can improve"] },
    ],
    listTitle: "Saved Tips",
    list: ["How to read BP readings", "Balanced breakfast ideas", "Desk stretch routine"],
  },
  "appointment-reminders": {
    title: "Appointment Reminders",
    icon: "calendar-clock",
    subtitle: "Smart reminders for consultations, lab bookings, medicine refills, and follow-ups.",
    stats: [
      { label: "Upcoming", value: "3", unit: "Events", trend: "Next 7 days", icon: "calendar" },
      { label: "Reminders", value: "9", unit: "Active", trend: "SMS and app", icon: "bell" },
      { label: "Refills", value: "2", unit: "Due", trend: "This week", icon: "pill" },
      { label: "Missed", value: "0", unit: "Today", trend: "All clear", icon: "check-circle-2" },
    ],
    panels: [
      { title: "Next Reminder", icon: "bell-ring", lines: ["Video consult today 4:30 PM", "Join link opens 10 minutes before", "Prescription locker will sync after visit"] },
      { title: "Reminder Channels", icon: "send", lines: ["App notification enabled", "SMS enabled", "Email summary weekly"] },
    ],
    listTitle: "Reminder Timeline",
    list: ["Today 4:20 PM - Join consultation", "Tomorrow 7:00 AM - Fasting lab reminder", "May 22 - Cardiology follow-up"],
  },
  "preventive-care": {
    title: "Preventive Care",
    icon: "shield-plus",
    subtitle: "Preventive screenings, vaccination reminders, risk scores, and care plans.",
    stats: [
      { label: "Score", value: "82", unit: "/100", trend: "Good", icon: "gauge" },
      { label: "Screenings", value: "2", unit: "Due", trend: "This quarter", icon: "clipboard-check" },
      { label: "Vaccines", value: "1", unit: "Pending", trend: "Flu shot", icon: "syringe" },
      { label: "Habits", value: "4", unit: "Tracked", trend: "Sleep, steps, water, BP", icon: "activity" },
    ],
    panels: [
      { title: "Recommended Screenings", icon: "calendar-plus", lines: ["Annual eye check", "HbA1c repeat in June", "Dental checkup due"] },
      { title: "Prevention Plan", icon: "target", lines: ["6,000 step daily target", "Weekly BP log", "Nutrition consultation suggestion"] },
    ],
    listTitle: "Preventive History",
    list: ["Full body checkup - Jan 2026", "Flu vaccine - Oct 2025", "Eye screening - pending"],
  },
  "chronic-care": {
    title: "Chronic Disease Programs",
    icon: "heart-pulse",
    subtitle: "Structured care programs for diabetes, hypertension, asthma, and heart health.",
    stats: [
      { label: "Program", value: "BP", unit: "Care", trend: "Active", icon: "heart-pulse" },
      { label: "Adherence", value: "91", unit: "%", trend: "Medicine reminders", icon: "pill" },
      { label: "Coach", value: "1", unit: "Assigned", trend: "Weekly check-in", icon: "user-round" },
      { label: "Risk", value: "Low", unit: "Now", trend: "Vitals stable", icon: "shield-check" },
    ],
    panels: [
      { title: "Care Program", icon: "clipboard-check", lines: ["Hypertension tracking", "Weekly BP review", "Monthly doctor follow-up"] },
      { title: "Coaching Notes", icon: "message-circle", lines: ["Salt intake reminder", "Evening walk plan", "Refill due in 5 days"] },
    ],
    listTitle: "Program Timeline",
    list: ["May 18 - BP stable", "May 15 - Coach check-in complete", "May 12 - Medication adherence logged"],
  },
  "ai-assistant": {
    title: "AI Health Assistant",
    icon: "brain-circuit",
    subtitle: "A smart companion for health summaries, questions, nudges, and care navigation.",
    stats: [
      { label: "Summaries", value: "6", unit: "Ready", trend: "Reports and vitals", icon: "file-search" },
      { label: "Alerts", value: "2", unit: "New", trend: "Hydration and test due", icon: "bell" },
      { label: "Tasks", value: "4", unit: "Suggested", trend: "Care next steps", icon: "list-checks" },
      { label: "Privacy", value: "On", unit: "Consent", trend: "Patient controlled", icon: "lock" },
    ],
    panels: [
      { title: "Assistant Summary", icon: "sparkles", lines: ["Vitals stable for 14 days", "Lab follow-up due this month", "No urgent warning signs in demo data"] },
      { title: "Suggested Questions", icon: "message-circle-question", lines: ["What does my CBC report mean?", "When is my next medicine refill?", "Find a cardiologist near me"] },
    ],
    listTitle: "Recent AI Activity",
    list: ["Summarized CBC report", "Created hydration reminder", "Suggested preventive care checklist"],
  },
};

const searchableServices = [
  { title: "Health", route: "health", icon: "heart-pulse", desc: "Vitals, care plan, and AI health summary." },
  { title: "Appointments", route: "appointments", icon: "calendar", desc: "Consultations, lab visits, and reminders." },
  { title: "Records", route: "records", icon: "file-text", desc: "Reports, prescriptions, and health files." },
  { title: "Book Appointment", route: "book-consultation", icon: "users", desc: "Doctor selection and appointment booking." },
  { title: "Health ATM", route: "health-atm", icon: "monitor", desc: "Kiosk tests, vitals, and screening reports." },
  { title: "Digital Locker", route: "digital-locker", icon: "folder-lock", desc: "Secure records, consent, and file sharing." },
  { title: "Live Health Dashboard", route: "live-dashboard", icon: "activity", desc: "Live vitals and connected-device metrics." },
  { title: "Telemedicine", route: "telemedicine", icon: "video", desc: "Video consults and waiting room." },
  { title: "Marketplace", route: "marketplace", icon: "store", desc: "Medicine, labs, equipment, ambulance services." },
  { title: "Medicolegal & Compliance", route: "compliance", icon: "scale", desc: "Consent, legal vault, and compliance checks." },
  { title: "Health Insights & Education", route: "insights", icon: "book-open", desc: "Tips, reminders, programs, and assistant." },
  ...services,
  ...marketplace,
  ...Object.values(serviceDetails).map((item) => ({
    title: item.title,
    route: Object.keys(serviceDetails).find((key) => serviceDetails[key] === item),
    icon: item.icon,
    desc: item.subtitle,
  })),
].filter((item, index, list) => index === list.findIndex((candidate) => candidate.route === item.route));

let contentRoot;
let homeMarkup = "";

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function routePath(route) {
  return `#/${route}`;
}

function icon(name, className = "route-icon") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

function initApp() {
  const app = document.querySelector(".app");
  const header = document.querySelector(".header");
  const nav = document.querySelector(".bottom-nav");
  contentRoot = document.createElement("main");
  contentRoot.id = "app-content";
  contentRoot.className = "home-shell";

  const homeNodes = Array.from(app.children).filter((node) => node !== header && node !== nav);
  homeNodes.forEach((node) => contentRoot.appendChild(node));
  app.insertBefore(contentRoot, nav);
  homeMarkup = contentRoot.innerHTML;

  wireHome();
  wireChrome();
  setupSearch();
  window.addEventListener("hashchange", renderCurrentRoute);
  renderCurrentRoute();
}

function wireChrome() {
  document.querySelector(".logo")?.setAttribute("data-route", "home");
  document.querySelector(".logo")?.setAttribute("role", "link");
  document.querySelector(".notification")?.setAttribute("data-route", "notifications");
  document.querySelector(".avatar")?.setAttribute("data-route", "profile");
  document.querySelector(".lang-selector")?.setAttribute("data-route", "language");

  document.querySelectorAll(".nav-item").forEach((item) => {
    const label = cleanText(item.textContent);
    const route = navRoutes[label] || "home";
    item.href = routePath(route);
    item.dataset.route = route;
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("[data-route]");
    if (!target) return;
    const route = target.dataset.route;
    if (!route) return;
    event.preventDefault();
    navigate(route);
  });
}

function setupSearch() {
  const searchInput = document.querySelector("#service-search");
  const suggestions = document.querySelector("#search-suggestions");
  if (!searchInput || !suggestions) return;

  function closeSuggestions() {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
  }

  function openSuggestions(matches) {
    if (!matches.length) {
      suggestions.innerHTML = `<div class="suggestion-empty">No matching services found</div>`;
      suggestions.classList.add("is-open");
      return;
    }

    suggestions.innerHTML = matches.map((item) => `
      <button type="button" class="suggestion-item" data-route="${item.route}" role="option">
        ${icon(item.icon || "search", "small-icon")}
        <span><strong>${item.title}</strong><small>${item.desc}</small></span>
      </button>
    `).join("");
    suggestions.classList.add("is-open");
    if (window.lucide) lucide.createIcons();
  }

  function updateSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      closeSuggestions();
      return;
    }

    const matches = searchableServices
      .filter((item) => `${item.title} ${item.desc}`.toLowerCase().includes(query))
      .slice(0, 7);
    openSuggestions(matches);
  }

  searchInput.addEventListener("input", updateSuggestions);
  searchInput.addEventListener("focus", updateSuggestions);
  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const first = suggestions.querySelector("[data-route]");
      if (first) {
        event.preventDefault();
        searchInput.value = "";
        closeSuggestions();
        navigate(first.dataset.route);
      }
    }

    if (event.key === "Escape") {
      closeSuggestions();
      searchInput.blur();
    }
  });

  suggestions.addEventListener("click", (event) => {
    const item = event.target.closest("[data-route]");
    if (!item) return;
    searchInput.value = "";
    closeSuggestions();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".global-search")) closeSuggestions();
  });
}

function wireHome() {
  contentRoot.querySelectorAll(".hero-btn, .quick-item, .health-card, .status-card, .tele-card, .market-item, .legal-item, .insight-card, .badge").forEach((item) => {
    const label = cleanText(item.textContent);
    const route = item.classList.contains("health-card") ? "live-dashboard" : featureRoutes[label] || inferRoute(label);
    item.dataset.route = route;
    item.setAttribute("role", "link");
    item.tabIndex = 0;
  });

  contentRoot.querySelectorAll(".view-all").forEach((link) => {
    const heading = link.closest(".section")?.querySelector("h3");
    const route = featureRoutes[cleanText(heading?.textContent || "")] || "more";
    link.href = routePath(route);
    link.dataset.route = route;
  });

  contentRoot.querySelector(".join-btn")?.setAttribute("data-route", "telemedicine-room");
}

function inferRoute(label) {
  const normalized = label.toLowerCase();
  if (normalized.includes("ai alerts")) return "ai-alerts";
  if (normalized.includes("device sync")) return "devices";
  if (normalized.includes("abdm")) return "compliance";
  if (normalized.includes("hipaa")) return "compliance";
  if (normalized.includes("gdpr")) return "compliance";
  if (normalized.includes("dpdp")) return "compliance";
  return "more";
}

function navigate(route) {
  if (route === "home") {
    window.location.hash = "";
    renderCurrentRoute();
    return;
  }
  window.location.hash = routePath(route);
}

function renderCurrentRoute() {
  const route = window.location.hash.replace(/^#\/?/, "") || "home";
  if (route === "home") {
    contentRoot.className = "home-shell";
    contentRoot.innerHTML = homeMarkup;
    wireHome();
  } else {
    contentRoot.className = "route-shell";
    contentRoot.innerHTML = renderRoute(route);
  }

  setActiveNav(route);
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setActiveNav(route) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    const itemRoute = item.dataset.route;
    const isActive = itemRoute === route || (route === "book-consultation" && itemRoute === "appointments");
    item.classList.toggle("active", isActive || (route === "home" && itemRoute === "home"));
  });
}

function renderRoute(route) {
  const renderers = {
    health: renderHealth,
    appointments: renderAppointments,
    records: renderRecords,
    more: renderMore,
    "book-consultation": renderBookConsultation,
    "health-atm": renderHealthAtm,
    "digital-locker": renderDigitalLocker,
    "quick-access": () => renderServiceDirectory("Quick Access", services),
    "live-dashboard": renderLiveDashboard,
    telemedicine: renderTelemedicine,
    "telemedicine-room": renderTelemedicineRoom,
    marketplace: () => renderServiceDirectory("Marketplace", marketplace),
    compliance: renderCompliance,
    insights: renderInsights,
    notifications: renderNotifications,
    profile: renderProfile,
    language: renderLanguage,
    "ai-alerts": renderAiAlerts,
    devices: renderDevices,
  };

  if (renderers[route]) return renderers[route]();
  if (serviceDetails[route]) return renderServicePage(route);
  return renderGenericService(route);
}

function pageHeader(title, subtitle, action = "") {
  return `
    <section class="route-hero">
      <a href="#/" data-route="home" class="back-link">${icon("arrow-left", "small-icon")} Home</a>
      <div>
        <p class="eyebrow">ABHA SETU</p>
        <h2>${title}</h2>
        <p>${subtitle}</p>
      </div>
      ${action}
    </section>
  `;
}

function renderHealth() {
  return `
    ${pageHeader("Health", "Monitor your vitals, connected devices, care plan, and AI wellness signals from one dashboard.")}
    <section class="route-grid metrics-grid">
      ${vitals.map((vital) => metricCard(vital)).join("")}
    </section>
    <section class="route-grid two-col">
      ${panel("Care Plan", [
        "Morning medication reminder at 8:00 AM",
        "Walk target: 6,000 steps, currently 4,250",
        "Next preventive checkup due May 28, 2026",
      ], "clipboard-check")}
      ${panel("AI Health Summary", [
        "Vitals are stable compared with your 14-day average.",
        "Hydration looks low based on recent activity logs.",
        "No high-risk alerts detected in the last 24 hours.",
      ], "brain-circuit")}
    </section>
    ${listSection("Recent Health Activity", records.slice(0, 3).map((item) => `${item.name} - ${item.date}`))}
  `;
}

function renderAppointments() {
  return `
    ${pageHeader("Appointments", "Review upcoming consultations, lab visits, and follow-up tasks.", `<a href="#/book-consultation" data-route="book-consultation" class="primary-action">${icon("plus", "small-icon")} Book Appointment</a>`)}
    <section class="route-grid list-grid">
      ${appointments.map((item) => appointmentCard(item)).join("")}
    </section>
    ${renderBookForm("Quick Appointment Request")}
  `;
}

function renderRecords() {
  return `
    ${pageHeader("Records", "A realistic digital locker view for reports, prescriptions, vitals, and policy files.")}
    ${recordsTable()}
  `;
}

function renderMore() {
  return `
    ${pageHeader("More", "Explore every service, support workflow, compliance tool, and marketplace option.")}
    ${serviceGrid([...services, ...marketplace], "route-grid service-grid")}
  `;
}

function renderBookConsultation() {
  return `
    ${pageHeader("Book Appointment", "Choose a doctor, appointment mode, and preferred slot.")}
    <section class="route-grid doctor-grid">
      ${doctors.map((doctor) => `
        <article class="route-card">
          <div class="card-title-row">${icon("user-round")}<div><h3>${doctor.name}</h3><p>${doctor.role}</p></div></div>
          <div class="pill-row"><span>${doctor.time}</span><span>${doctor.fee}</span><span>${doctor.rating} rating</span></div>
          <a href="#/appointments" data-route="appointments" class="primary-action">Select Slot</a>
        </article>
      `).join("")}
    </section>
    ${renderBookForm("Patient Details")}
  `;
}

function renderHealthAtm() {
  return `
    ${pageHeader("Health ATM", "Find nearby kiosks for instant screening and synced vitals.")}
    <section class="route-grid two-col">
      ${panel("Nearest Kiosk", ["ABHA SETU Health ATM - Sector 21", "Open until 9:00 PM", "Queue: 2 people, expected wait 6 mins"], "map-pin")}
      ${panel("Available Tests", ["Blood pressure, SpO2, BMI", "Glucose random check", "ECG preview and temperature"], "monitor")}
    </section>
    ${listSection("Recent Kiosk Reports", ["May 08 - Full screening completed", "Apr 24 - BP and SpO2 check", "Apr 10 - Glucose screening"])}
  `;
}

function renderDigitalLocker() {
  return `
    ${pageHeader("Digital Locker", "Securely organize health files, consent forms, prescriptions, and ABHA-linked records.")}
    <section class="route-grid metrics-grid">
      ${metricCard({ label: "Documents", value: "28", unit: "Files", trend: "4 added this month", icon: "folder-lock" })}
      ${metricCard({ label: "Shared With", value: "3", unit: "Doctors", trend: "Consent active", icon: "share-2" })}
      ${metricCard({ label: "Storage", value: "1.8", unit: "GB", trend: "Encrypted", icon: "database" })}
      ${metricCard({ label: "ABHA Sync", value: "On", unit: "Live", trend: "Last synced 9 mins ago", icon: "refresh-cw" })}
    </section>
    ${recordsTable()}
  `;
}

function renderLiveDashboard() {
  return `
    ${pageHeader("Live Health Dashboard", "Streaming vitals with realistic dummy telemetry, trends, and connected-device status.")}
    <section class="route-grid metrics-grid">${vitals.map(metricCard).join("")}</section>
    <section class="chart-panel">
      <div class="section-header"><h3>Today Trend</h3><span class="live-badge"><span class="live-dot"></span> Live</span></div>
      <div class="bar-chart">
        <span style="height: 44%"></span><span style="height: 64%"></span><span style="height: 52%"></span><span style="height: 76%"></span><span style="height: 48%"></span><span style="height: 68%"></span><span style="height: 58%"></span>
      </div>
    </section>
  `;
}

function renderTelemedicine() {
  return `
    ${pageHeader("Telemedicine", "Video, audio, waiting-room, and multi-doctor consultation workflows.")}
    <section class="route-grid two-col">
      ${panel("Live Waiting Room", ["3 patients ahead", "Estimated wait: 8 minutes", "Consultation mode: Video"], "video")}
      ${panel("Care Team", ["General Physician assigned", "Cardiologist available on request", "Prescription will sync to locker"], "users")}
    </section>
    <section class="route-grid doctor-grid">${doctors.map((doctor) => appointmentCard({ title: doctor.name, doctor: doctor.role, meta: doctor.time, status: doctor.fee })).join("")}</section>
  `;
}

function renderTelemedicineRoom() {
  return `
    ${pageHeader("Consultation Room", "A dummy pre-call screen for the selected doctor.")}
    <section class="call-room">
      <div class="video-tile"><span>Dr. Priya Sharma</span>${icon("video", "call-icon")}</div>
      <div class="call-actions">
        <button>${icon("mic", "small-icon")} Mic</button>
        <button>${icon("video", "small-icon")} Camera</button>
        <button>${icon("phone-off", "small-icon")} End</button>
      </div>
    </section>
  `;
}

function renderCompliance() {
  return `
    ${pageHeader("Medicolegal & Compliance", "Consent, prescription verification, secure records, and policy-ready workflows.")}
    ${serviceGrid([
      { title: "Medicolegal Support", route: "medicolegal-support", icon: "scale", desc: "Case documentation and expert review." },
      { title: "Digital Consent Forms", route: "consent-forms", icon: "file-check", desc: "Patient consent capture with audit trail." },
      { title: "Prescription Verification", route: "prescription-verification", icon: "file-text", desc: "Validate doctor signature and expiry." },
      { title: "Legal Docs Vault", route: "legal-vault", icon: "lock", desc: "Encrypted legal healthcare documents." },
    ], "route-grid service-grid")}
  `;
}

function renderInsights() {
  return `
    ${pageHeader("Health Insights & Education", "Health learning, prevention nudges, reminders, and AI-powered education.")}
    <section class="route-grid service-grid">
      ${["Health Tips", "Appointment Reminders", "Preventive Care", "Chronic Disease Programs", "AI Health Assistant"].map((title) => `
        <article class="route-card" data-route="${featureRoutes[title]}">
          <h3>${title}</h3>
          <p>${genericCopy(featureRoutes[title])}</p>
          <a href="#/${featureRoutes[title]}" data-route="${featureRoutes[title]}">Open</a>
        </article>
      `).join("")}
    </section>
  `;
}

function renderNotifications() {
  return `
    ${pageHeader("Notifications", "Recent alerts, appointment updates, and locker activity.")}
    ${listSection("Today", ["Appointment confirmed with Dr. Priya Sharma.", "CBC report uploaded to Digital Locker.", "AI Alert: hydration reminder for evening."])}
  `;
}

function renderProfile() {
  return `
    ${pageHeader("Profile", "Patient identity, linked ABHA ID, emergency contacts, and account settings.")}
    <section class="profile-panel">
      <img src="https://csspicker.dev/api/image/?q=doctor+portrait&image_type=photo" alt="User profile">
      <div><h3>Ananya Verma</h3><p>ABHA ID: ananya@abdm</p><p>Age 34 - New Delhi</p></div>
    </section>
    ${listSection("Linked Details", ["Mobile verified ending 4207", "Emergency contact: Rohan Verma", "Preferred language: English"])}
  `;
}

function renderLanguage() {
  return `
    ${pageHeader("Language", "Choose the preferred app language for labels and healthcare content.")}
    <section class="route-grid service-grid">
      ${["English", "Hindi", "Tamil", "Telugu", "Marathi", "Bengali"].map((language, index) => `
        <article class="route-card ${index === 0 ? "selected-card" : ""}">
          <h3>${language}</h3>
          <p>${index === 0 ? "Currently selected" : "Available as a demo option"}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderAiAlerts() {
  return `
    ${pageHeader("AI Alerts", "Smart summaries generated from vitals, records, appointments, and device data.")}
    ${listSection("Active Alerts", ["Hydration looks low today. Drink 500 ml water before 6 PM.", "Your BP readings are stable for 7 days.", "Schedule HbA1c test this month based on last checkup."])}
  `;
}

function renderDevices() {
  return `
    ${pageHeader("Device Sync", "Connected devices and their latest sync health.")}
    ${listSection("Connected Devices", ["BP Monitor - synced 3 mins ago", "Pulse Oximeter - synced 8 mins ago", "Glucometer - synced yesterday", "Smart Scale - synced today"])}
  `;
}

function renderGenericService(route) {
  const title = titleFromRoute(route);
  return `
    ${pageHeader(title, genericCopy(route))}
    <section class="route-grid two-col">
      ${panel("Current Status", ["Demo data is ready", "Service request can be submitted", "Estimated response: under 10 minutes"], "check-circle-2")}
      ${panel("Recommended Next Step", ["Review details", "Confirm patient profile", "Continue to linked ABHA workflow"], "arrow-right-circle")}
    </section>
    <section class="form-panel">
      <h3>${title} Request</h3>
      <div class="form-grid">
        <label>Patient Name<input value="Ananya Verma"></label>
        <label>Mobile Number<input value="+91 98765 42070"></label>
        <label>Preferred Date<input value="May 20, 2026"></label>
        <label>Location<input value="Sector 21, New Delhi"></label>
      </div>
      <button class="primary-action">Submit Demo Request</button>
    </section>
  `;
}

function renderServicePage(route) {
  const service = serviceDetails[route];
  return `
    ${pageHeader(service.title, service.subtitle)}
    <section class="route-grid metrics-grid">
      ${service.stats.map(metricCard).join("")}
    </section>
    <section class="route-grid two-col">
      ${service.panels.map((item) => panel(item.title, item.lines, item.icon)).join("")}
    </section>
    ${listSection(service.listTitle, service.list)}
    ${renderServiceRequestForm(service.title)}
  `;
}

function renderServiceDirectory(title, items) {
  return `
    ${pageHeader(title, "Open any service below. Each card links to its own realistic dummy workflow.")}
    ${serviceGrid(items, "route-grid service-grid")}
  `;
}

function serviceGrid(items, className) {
  return `
    <section class="${className}">
      ${items.map((item) => `
        <article class="route-card" data-route="${item.route}">
          ${icon(item.icon)}
          <h3>${item.title}</h3>
          <p>${item.desc}</p>
          <a href="#/${item.route}" data-route="${item.route}">Open</a>
        </article>
      `).join("")}
    </section>
  `;
}

function metricCard(vital) {
  return `
    <article class="metric-card">
      ${icon(vital.icon)}
      <span>${vital.label}</span>
      <strong>${vital.value}</strong>
      <small>${vital.unit} - ${vital.trend}</small>
    </article>
  `;
}

function panel(title, lines, iconName) {
  return `
    <article class="route-card">
      <div class="card-title-row">${icon(iconName)}<h3>${title}</h3></div>
      <ul>${lines.map((line) => `<li>${line}</li>`).join("")}</ul>
    </article>
  `;
}

function appointmentCard(item) {
  return `
    <article class="route-card">
      <h3>${item.title}</h3>
      <p>${item.doctor}</p>
      <div class="pill-row"><span>${item.meta}</span><span>${item.status}</span></div>
      <a href="#/appointments" data-route="appointments">View details</a>
    </article>
  `;
}

function listSection(title, items) {
  return `
    <section class="route-card wide-card">
      <h3>${title}</h3>
      <ul class="clean-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </section>
  `;
}

function recordsTable() {
  return `
    <section class="record-table">
      <div class="table-row table-head"><span>Document</span><span>Type</span><span>Date</span><span>Source</span><span>Action</span></div>
      ${records.map((record) => `
        <div class="table-row">
          <span>${record.name}</span>
          <span>${record.type}</span>
          <span>${record.date}</span>
          <span>${record.source}</span>
          <a href="#/digital-locker" data-route="digital-locker">View</a>
        </div>
      `).join("")}
    </section>
  `;
}

function renderBookForm(title) {
  return `
    <section class="form-panel">
      <h3>${title}</h3>
      <div class="form-grid">
        <label>Consultation Type<select><option>Video Consultation</option><option>Audio Consultation</option><option>Clinic Visit</option></select></label>
        <label>Department<select><option>General Physician</option><option>Cardiology</option><option>Dermatology</option></select></label>
        <label>Preferred Date<input value="May 20, 2026"></label>
        <label>Symptoms<input value="Fever, fatigue, mild cough"></label>
      </div>
      <button class="primary-action">Confirm Demo Booking</button>
    </section>
  `;
}

function renderServiceRequestForm(title) {
  return `
    <section class="form-panel">
      <h3>${title} Request</h3>
      <div class="form-grid">
        <label>Patient Name<input value="Ananya Verma"></label>
        <label>Mobile Number<input value="+91 98765 42070"></label>
        <label>Preferred Date<input value="May 20, 2026"></label>
        <label>Location<input value="Sector 21, New Delhi"></label>
      </div>
      <button class="primary-action">Submit Demo Request</button>
    </section>
  `;
}

function titleFromRoute(route) {
  return route.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function genericCopy(route) {
  const copy = {
    "medicine-delivery": "Order prescription medicines from verified pharmacies with realistic tracking and delivery status.",
    "lab-tests": "Book diagnostic tests, compare packages, and schedule home sample collection.",
    insurance: "Manage policy details, claim status, cashless eligibility, and renewal reminders.",
    training: "Browse healthcare awareness courses, CPR basics, wellness classes, and certificates.",
    hospitals: "Find nearby hospitals, departments, bed availability, and insurance network support.",
    "blood-bank": "Search blood availability, raise donor requests, and contact verified blood banks.",
    "organ-donation": "Register an organ donation pledge and review eligibility education.",
    "qr-scanner": "Scan ABHA QR, prescriptions, lab invoices, and hospital registration codes.",
    "abha-card": "Create or manage an ABHA health card with demo identity verification.",
    "home-sample": "Schedule a home collection slot with phlebotomist details and preparation notes.",
    equipment: "Rent or buy medical equipment with service support and installation status.",
    ambulance: "Book emergency or planned ambulance transport with live crew assignment.",
    "drone-delivery": "Preview upcoming drone delivery routes for urgent medicines and samples.",
  };
  return copy[route] || "A complete demo workflow with realistic dummy data for this healthcare service.";
}

document.addEventListener("DOMContentLoaded", initApp);
