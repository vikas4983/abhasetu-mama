/* ==========================================================================
   ABHA SETU - CLIENT-SIDE ABDM HEALTHCARE PLATFORM CONTROLLER
   ========================================================================== */

// Simulated Role Permissions
const rolePermissions = {
  admin: ["home", "health", "appointments", "records", "more", "book-consultation", "health-atm", "digital-locker", "live-dashboard", "telemedicine", "telemedicine-room", "qr-scanner", "abdm-services", "connected-facilities", "security", "reports", "settings", "contact", "about", "terms", "privacy", "compliance", "insights", "notifications", "profile", "language", "ai-alerts", "devices", "order-medicine", "book-lab-test", "hospitals", "blood-bank", "organ-donation"],
  doctor: ["home", "appointments", "records", "more", "telemedicine", "telemedicine-room", "qr-scanner", "connected-facilities", "settings", "contact", "about", "terms", "privacy", "notifications", "profile", "language"],
  patient: ["home", "health", "appointments", "records", "more", "book-consultation", "health-atm", "digital-locker", "live-dashboard", "telemedicine", "telemedicine-room", "qr-scanner", "abdm-services", "connected-facilities", "settings", "contact", "about", "terms", "privacy", "compliance", "insights", "notifications", "profile", "language", "ai-alerts", "devices", "order-medicine", "book-lab-test", "hospitals", "blood-bank", "organ-donation"],
  operator: ["home", "appointments", "records", "more", "qr-scanner", "abdm-services", "connected-facilities", "settings", "contact", "about", "terms", "privacy", "notifications", "profile", "language"]
};

// Global App State with default profiles
const DEFAULT_STATE = {
  currentUser: null, // Holds { email, role, abhaId, name } once logged in
  abhaCreated: false,
  abhaCard: null,
  appointments: [
    { id: "SETU-APP-101", title: "Video Consultation", doctor: "Dr. Ayesha Ali", meta: "Today, 4:30 PM", status: "Confirmed", token: "SETU-TKN-304" },
    { id: "SETU-APP-102", title: "Blood Test Package", doctor: "CityCare Diagnostics", meta: "Tomorrow, 8:00 AM", status: "Sample Pickup", token: "SETU-TKN-912" }
  ],
  records: [
    { name: "CBC Blood Report", type: "Lab Report", date: "May 14, 2026", source: "Apollo Diagnostics" },
    { name: "Prescription - Fever Care", type: "Prescription", date: "May 10, 2026", source: "Dr. Ayesha Ali" },
    { name: "Health ATM Screening", type: "Vitals", date: "May 08, 2026", source: "ABHA SETU Kiosk" }
  ],
  notifications: [
    { id: 1, title: "Login Successful", message: "Logged in securely from your browser.", time: "Just now", type: "security", unread: true },
    { id: 2, title: "ABDM Update", message: "Your health records locker is synced and encrypted.", time: "10 mins ago", type: "abdm", unread: true }
  ],
  language: "EN",
  theme: "dark-teal",
  accessibility: {
    highContrast: false,
    largeFont: false,
    screenReader: false
  },
  securityLogs: [
    { event: "Platform Init", details: "ABHA Setu security controller successfully loaded.", time: new Date().toLocaleTimeString() }
  ]
};

// State Helper Functions
function getAppState() {
  const data = localStorage.getItem("setu_state");
  if (!data) {
    localStorage.setItem("setu_state", JSON.stringify(DEFAULT_STATE));
    return DEFAULT_STATE;
  }
  return JSON.parse(data);
}

function updateAppState(updater) {
  const state = getAppState();
  updater(state);
  localStorage.setItem("setu_state", JSON.stringify(state));
  // Keep body tags synced
  applyThemeAndAccessibility(state);
  updateHeaderUI();
  return state;
}

function logSecurityEvent(event, details) {
  updateAppState(state => {
    // Redact sensitive inputs (Aadhaar or OTP)
    const sanitizedDetails = details
      .replace(/\b\d{12}\b/g, "************")
      .replace(/\b\d{6}\b/g, "******")
      .replace(/\b\d{10}\b/g, "**********");
    state.securityLogs.unshift({
      event,
      details: sanitizedDetails,
      time: new Date().toLocaleTimeString()
    });
    if (state.securityLogs.length > 50) state.securityLogs.pop();
  });
}

function announceAccessibility(text) {
  const state = getAppState();
  if (state.accessibility.screenReader) {
    const announcer = document.getElementById("accessibility-announcer") || document.createElement("div");
    announcer.id = "accessibility-announcer";
    announcer.setAttribute("aria-live", "assertive");
    announcer.style.position = "absolute";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.overflow = "hidden";
    announcer.textContent = text;
    if (!announcer.parentElement) document.body.appendChild(announcer);
  }
}

// Prefilled Demo Credentials
const demoCredentials = {
  admin: { email: "admin@abhasetu.com", pass: "Admin@123", name: "System Administrator" },
  doctor: { email: "doctor@abhasetu.com", pass: "Doctor@123", name: "Dr. Ayesha Ali", photo: "assets/doctors/dr-ayesha-ali.jpeg" },
  patient: { email: "patient@abhasetu.com", pass: "Patient@123", name: "Ananya Verma" },
  operator: { email: "operator@abhasetu.com", pass: "Operator@123", name: "OPD Desk Operator" }
};

// Doctors Database
const doctors = [
  {
    name: "Dr. Ayesha Ali",
    role: "Senior Homeopathy Consultant & Telehealth Lead",
    degree: "DHMS, BSC, LLB, M.D HOMEO",
    time: "Today, 6:00 PM",
    fee: "Rs 899",
    rating: "4.9",
    experience: "35 years experience",
    description: "Former Registrar, Madhya Pradesh. Chronic care, women-led family health, and second opinions.",
    photo: "assets/doctors/dr-ayesha-ali.jpeg",
    badge: "ABDM Ready",
    certificateId: "ABDM-REG-4207198",
    hfrId: "IN-HFR-100456"
  },
  {
    name: "Dr. Yogyata Mukhraiya",
    role: "Chronic Diseases and Female Problems Specialist",
    degree: "BHMS",
    time: "Tomorrow, 10:00 AM",
    fee: "Rs 699",
    rating: "4.8",
    experience: "12 years experience",
    description: "Focused on female health, infertility concerns, skin care, and chronic condition follow-ups.",
    photo: "assets/doctors/dr-ayesha-ali.jpeg",
    badge: "Verified",
    certificateId: "ABDM-REG-8827341",
    hfrId: "IN-HFR-100789"
  },
  {
    name: "Amitendu Giradonia",
    role: "Homeopathy and Primary Care Specialist",
    degree: "BHMS",
    time: "May 24, 6:15 PM",
    fee: "Rs 599",
    rating: "4.7",
    experience: "18 years experience",
    description: "Family care, chronic follow-ups, preventive plans, and medication reviews.",
    photo: "assets/doctors/dr-ayesha-ali.jpeg",
    badge: "Telemedicine",
    certificateId: "ABDM-REG-1092837",
    hfrId: "IN-HFR-100122"
  }
];

// Connected Facilities Database
const connectedFacilities = [
  { title: "Janki Raman Hospital & Critical Care Centre, Jabalpur", route: "facility-jankiraman", icon: "building-2", desc: "HFR-ready OPD registrations, critical care facility, emergency routing, Scan and Share active.", hfrId: "IN2310026968", type: "Hospital", services: "Critical Care, OPD, Emergency, General Medicine" },
  { title: "DR AYESHAH HOMEO HEALTH MALL, Bhopal", route: "facility-homeohealth", icon: "heart-pulse", desc: "ABHA verification desk, homeopathic care, digital prescriptions, wellness consultation.", hfrId: "IN2310026365", type: "Wellness Center", services: "Homeopathy, Primary Care, Wellness, Consultation" }
];

// Translations Dictionary
const translations = {
  EN: {
    "Your Digital": "Your Digital",
    "Healthcare Ecosystem": "Healthcare Ecosystem",
    "Book Consultation": "Book Consultation",
    "Health ATM": "Health ATM",
    "Digital Locker": "Digital Locker",
    "Quick Access": "Quick Access",
    "View All": "View All",
    "Consult Doctor": "Consult Doctor",
    "Order Medicines": "Order Medicines",
    "Book Lab Tests": "Book Lab Tests",
    "Manage Insurance": "Manage Insurance",
    "Training & Courses": "Training & Courses",
    "Hospitals": "Hospitals",
    "Blood Bank": "Blood Bank",
    "Organ Donation": "Organ Donation",
    "QR Scanner": "QR Scanner",
    "Create ABHA Card": "Create ABHA Card",
    "Live Health Dashboard": "Live Health Dashboard",
    "AI Alerts": "AI Alerts",
    "Device Sync": "Device Sync",
    "Telemedicine": "Telemedicine",
    "Video / Audio Consultation": "Video / Audio Consultation",
    "Connect with doctors instantly": "Connect with doctors instantly",
    "Join Now": "Join Now",
    "Waiting Room": "Waiting Room",
    "Patients Ahead": "Patients Ahead",
    "Est. 8 mins wait": "Est. 8 mins wait",
    "Multi-Doctor": "Multi-Doctor",
    "Conference": "Conference",
    "Connect with specialists": "Connect with specialists",
    "Marketplace": "Marketplace",
    "Medicine Delivery": "Medicine Delivery",
    "Lab Booking": "Lab Booking",
    "Home Sample Collection": "Home Sample Collection",
    "Medical Equipment": "Medical Equipment",
    "Ambulance Booking": "Ambulance Booking",
    "Drone Delivery": "Drone Delivery",
    "Coming Soon": "Coming Soon",
    "Medicolegal & Compliance": "Medicolegal & Compliance",
    "Medicolegal Support": "Medicolegal Support",
    "Digital Consent Forms": "Digital Consent Forms",
    "Prescription Verification": "Prescription Verification",
    "Secure Health Records": "Secure Health Records",
    "Telemedicine Compliance": "Telemedicine Compliance",
    "Legal Docs Vault": "Legal Docs Vault",
    "ABDM Compliant": "ABDM Compliant",
    "HIPAA Secure": "HIPAA Secure",
    "GDPR Ready": "GDPR Ready",
    "DPDP Compliant": "DPDP Compliant",
    "Health Insights & Education": "Health Insights & Education",
    "Health Tips": "Health Tips",
    "Daily tips for a healthy life": "Daily tips for a healthy life",
    "Appointment Reminders": "Appointment Reminders",
    "Never miss your appointments": "Never miss your appointments",
    "Preventive Care": "Preventive Care",
    "Regular checkups for a better you": "Regular checkups for a better you",
    "Chronic Disease Programs": "Chronic Disease Programs",
    "Specialized care for chronic conditions": "Specialized care for chronic conditions",
    "AI Health Assistant": "AI Health Assistant",
    "Your smart health companion": "Your smart health companion",
    "Home": "Home",
    "Health": "Health",
    "Appointments": "Appointments",
    "Records": "Records",
    "More": "More"
  },
  HI: {
    "Your Digital": "आपका डिजिटल",
    "Healthcare Ecosystem": "स्वास्थ्य सेवा पारिस्थितिकी तंत्र",
    "Book Consultation": "परामर्श बुक करें",
    "Health ATM": "हेल्थ एटीएम",
    "Digital Locker": "डिजिटल लॉकर",
    "Quick Access": "त्वरित पहुँच",
    "View All": "सभी देखें",
    "Consult Doctor": "डॉक्टर से परामर्श",
    "Order Medicines": "दवाएं ऑर्डर करें",
    "Book Lab Tests": "लैब टेस्ट बुक करें",
    "Manage Insurance": "बीमा प्रबंधित करें",
    "Training & Courses": "प्रशिक्षण और पाठ्यक्रम",
    "Hospitals": "अस्पताल",
    "Blood Bank": "ब्लड बैंक",
    "Organ Donation": "अंग दान",
    "QR Scanner": "क्यूआर स्कैनर",
    "Create ABHA Card": "आभा कार्ड बनाएं",
    "Live Health Dashboard": "लाइव स्वास्थ्य डैशबोर्ड",
    "AI Alerts": "एआई अलर्ट",
    "Device Sync": "डिवाइस सिंक",
    "Telemedicine": "टेलीमेडिसिन",
    "Video / Audio Consultation": "वीडियो / ऑडियो परामर्श",
    "Connect with doctors instantly": "डॉक्टरों से तुरंत जुड़ें",
    "Join Now": "अभी जुड़ें",
    "Waiting Room": "प्रतीक्षा कक्ष",
    "Patients Ahead": "मरीज आगे हैं",
    "Est. 8 mins wait": "अनुमानित 8 मिनट प्रतीक्षा",
    "Multi-Doctor": "बहु-डॉक्टर",
    "Conference": "कॉन्फ्रेंस",
    "Connect with specialists": "विशेषज्ञों से जुड़ें",
    "Marketplace": "मार्केटप्लेस",
    "Medicine Delivery": "दवा वितरण",
    "Lab Booking": "लैब बुकिंग",
    "Home Sample Collection": "गृह नमूना संग्रह",
    "Medical Equipment": "चिकित्सा उपकरण",
    "Ambulance Booking": "एम्बुलेंस बुकिंग",
    "Drone Delivery": "ड्रोन डिलीवरी",
    "Coming Soon": "जल्द आ रहा है",
    "Medicolegal & Compliance": "मेडिकोलीगल और अनुपालन",
    "Medicolegal Support": "मेडिकोलीगल सहायता",
    "Digital Consent Forms": "डिजिटल सहमति पत्र",
    "Prescription Verification": "पर्चे का सत्यापन",
    "Secure Health Records": "सुरक्षित स्वास्थ्य रिकॉर्ड",
    "Telemedicine Compliance": "टेलीमेडिसिन अनुपालन",
    "Legal Docs Vault": "कानूनी दस्तावेज वॉल्ट",
    "ABDM Compliant": "ABDM अनुपालन",
    "HIPAA Secure": "HIPAA सुरक्षित",
    "GDPR Ready": "GDPR तैयार",
    "DPDP Compliant": "DPDP अनुपालन",
    "Health Insights & Education": "स्वास्थ्य अंतर्दृष्टि और शिक्षा",
    "Health Tips": "स्वास्थ्य युक्तियाँ",
    "Daily tips for a healthy life": "स्वस्थ जीवन के लिए दैनिक सुझाव",
    "Appointment Reminders": "अपॉइंटमेंट अनुस्मारक",
    "Never miss your appointments": "अपने अपॉइंटमेंट कभी न चूकें",
    "Preventive Care": "निवारक देखभाल",
    "Regular checkups for a better you": "बेहतर स्वास्थ्य के लिए नियमित जांच",
    "Chronic Disease Programs": "क्रोनिक बीमारी कार्यक्रम",
    "Specialized care for chronic conditions": "क्रोनिक स्थितियों के लिए विशेष देखभाल",
    "AI Health Assistant": "एआई स्वास्थ्य सहायक",
    "Your smart health companion": "आपका स्मार्ट स्वास्थ्य साथी",
    "Home": "होम",
    "Health": "स्वास्थ्य",
    "Appointments": "अपॉइंटमेंट",
    "Records": "रिकॉर्ड",
    "More": "अधिक"
  },
  TA: {
    "Your Digital": "உங்கள் டிஜிட்டல்",
    "Healthcare Ecosystem": "சுகாதார சுற்றுச்சூழல் அமைப்பு",
    "Book Consultation": "ஆலோசனை முன்பதிவு",
    "Health ATM": "சுகாதார ஏடிஎம்",
    "Digital Locker": "டிஜிட்டல் லாக்கர்",
    "Quick Access": "விரைவு அணுகல்",
    "View All": "அனைத்தையும் காட்டு",
    "Consult Doctor": "மருத்துவர் ஆலோசனை",
    "Order Medicines": "மருந்துகள் ஆர்டர்",
    "Book Lab Tests": "ஆய்வக சோதனை முன்பதிவு",
    "Manage Insurance": "காப்பீடு மேலாண்மை",
    "Training & Courses": "பயிற்சி மற்றும் படிப்புகள்",
    "Hospitals": "மருத்துவமனைகள்",
    "Blood Bank": "இரத்த வங்கி",
    "Organ Donation": "உறுப்பு தானம்",
    "QR Scanner": "கியூஆர் ஸ்கேனர்",
    "Create ABHA Card": "ஆபா அட்டை உருவாக்கு",
    "Live Health Dashboard": "நேரடி சுகாதார டேஷ்போர்டு",
    "AI Alerts": "AI விழிப்பூட்டல்கள்",
    "Device Sync": "சாதன ஒத்திசைவு",
    "Telemedicine": "டெலிமெடிசின்",
    "Video / Audio Consultation": "வீடியோ / ஆடியோ ஆலோசனை",
    "Connect with doctors instantly": "மருத்துவர்களுடன் உடனே இணையுங்கள்",
    "Join Now": "இப்போது இணையுங்கள்",
    "Waiting Room": "காத்திருப்பு அறை",
    "Patients Ahead": "நோயாளி முன்னே உள்ளனர்",
    "Est. 8 mins wait": "சுமார் 8 நிமிட காத்திருப்பு",
    "Multi-Doctor": "பல மருத்துவர்",
    "Conference": "மாநாடு",
    "Connect with specialists": "நிபுணர்களுடன் இணையுங்கள்",
    "Marketplace": "சந்தைப்பகுதி",
    "Medicine Delivery": "மருந்து விநியோகம்",
    "Lab Booking": "ஆய்வக முன்பதிவு",
    "Home Sample Collection": "வீட்டு மாதிரி சேகரிப்பு",
    "Medical Equipment": "மருத்துவ உபகரணங்கள்",
    "Ambulance Booking": "ஆம்புலன்ஸ் முன்பதிவு",
    "Drone Delivery": "ட்ரோன் விநியோகம்",
    "Coming Soon": "விரைவில் வரும்",
    "Medicolegal & Compliance": "மருத்துவச் சட்டம் & இணக்கம்",
    "Medicolegal Support": "சட்ட மருத்துவ ஆதரவு",
    "Digital Consent Forms": "டிஜிட்டல் ஒப்புதல் படிவங்கள்",
    "Prescription Verification": "மருந்துச்சீட்டு சரிபார்ப்பு",
    "Secure Health Records": "பாதுகாப்பான சுகாதார பதிவுகள்",
    "Telemedicine Compliance": "டெலிமெடிசின் இணக்கம்",
    "Legal Docs Vault": "சட்ட ஆவணங்கள் பாதுகாப்பு பெட்டகம்",
    "ABDM Compliant": "ABDM இணக்கமானது",
    "HIPAA Secure": "HIPAA பாதுகாப்பானது",
    "GDPR Ready": "GDPR தயாராக உள்ளது",
    "DPDP Compliant": "DPDP இணக்கமானது",
    "Health Insights & Education": "சுகாதார நுண்ணறிவு மற்றும் கல்வி",
    "Health Tips": "சுகாதார குறிப்புகள்",
    "Daily tips for a healthy life": "ஆரோக்கியமான வாழ்க்கைக்கான தினசரி குறிப்புகள்",
    "Appointment Reminders": "சந்திப்பு நினைவூட்டல்கள்",
    "Never miss your appointments": "உங்கள் சந்திப்புகளை தவறவிடாதீர்கள்",
    "Preventive Care": "தடுப்பு பராமரிப்பு",
    "Regular checkups for a better you": "சிறந்த ஆரோக்கியத்திற்கு வழக்கமான சோதனைகள்",
    "Chronic Disease Programs": "நாள்பட்ட நோய் திட்டங்கள்",
    "Specialized care for chronic conditions": "நாள்பட்ட நோய்களுக்கான சிறப்பு சிகிச்சை",
    "AI Health Assistant": "AI சுகாதார உதவியாளர்",
    "Your smart health companion": "உங்கள் ஸ்மார்ட் சுகாதார துணையாக",
    "Home": "முகப்பு",
    "Health": "சுகாதாரம்",
    "Appointments": "சந்திப்புகள்",
    "Records": "பதிவுகள்",
    "More": "மேலும்"
  },
  TE: {
    "Your Digital": "మీ డిజిటల్",
    "Healthcare Ecosystem": "ఆరోగ్య సంరక్షణ వ్యవస్థ",
    "Book Consultation": "సంప్రదింపు బుక్ చేయండి",
    "Health ATM": "ヘల్త్ ఏటిఎం",
    "Digital Locker": "డిజిటల్ లాకర్",
    "Quick Access": "త్వరిత యాక్సెస్",
    "View All": "అన్నీ చూడండి",
    "Consult Doctor": "వైద్యుడిని సంప్రదించండి",
    "Order Medicines": "మందులు ఆర్డర్ చేయండి",
    "Book Lab Tests": "ల్యాబ్ పరీక్షలు బుక్ చేయండి",
    "Manage Insurance": "భీమా నిర్వహించండి",
    "Training & Courses": "శిక్షణ & కోర్సులు",
    "Hospitals": "ఆసుపత్రులు",
    "Blood Bank": "బ్లడ్ బ్యాంక్",
    "Organ Donation": "అవయవ దానం",
    "QR Scanner": "క్యూఆర్ స్కానర్",
    "Create ABHA Card": "ఆభా కార్డు సృష్టించండి",
    "Live Health Dashboard": "లైవ్ హెల్త్ డ్యాష్‌బోర్డ్",
    "AI Alerts": "ఏఐ హెచ్చరికలు",
    "Device Sync": "డివైస్ సింక్",
    "Telemedicine": "టెలిమెడిసిన్",
    "Video / Audio Consultation": "వీడియో / ఆడియో సంప్రదింపులు",
    "Connect with doctors instantly": "వైద్యులతో తక్షణమే కనెక్ట్ అవ్వండి",
    "Join Now": "ఇప్పుడే చేరండి",
    "Waiting Room": "వెయిటింగ్ రూమ్",
    "Patients Ahead": "రోగులు ముందు ఉన్నారు",
    "Est. 8 mins wait": "సుమారు 8 నిమిషాల నిరీక్షణ",
    "Multi-Doctor": "మల్టీ-డాక్టర్",
    "Conference": "కాన్ఫరెన్స్",
    "Connect with specialists": "నిపుణులతో కనెక్ట్ అవ్వండి",
    "Marketplace": "మార్కెట్‌ప్レーస్",
    "Medicine Delivery": "మందుల పంపిణీ",
    "Lab Booking": "ల్యాబ్ బుకింగ్",
    "Home Sample Collection": "ఇంటి వద్ద నమూనా సేకరణ",
    "Medical Equipment": "వైద్య పరికరాలు",
    "Ambulance Booking": "అంబులెన్స్ బుకింగ్",
    "Drone Delivery": "డ్రోన్ డెలివరీ",
    "Coming Soon": "త్వరలో వస్తుంది",
    "Medicolegal & Compliance": "మెడికోలీగల్ & వర్తింపు",
    "Medicolegal Support": "మెడికోలీగల్ మద్దతు",
    "Digital Consent Forms": "డిజిటల్ సమ్మతి పత్రాలు",
    "Prescription Verification": "ప్రిస్క్రిప్షన్ ధృవీకరణ",
    "Secure Health Records": "సురક્ષిత ఆరోగ్య రికార్డులు",
    "Telemedicine Compliance": "టెలిమెడిసిన్ వర్తింపు",
    "Legal Docs Vault": "లీగల్ డాక్స్ వాల్ట్",
    "ABDM Compliant": "ABDM నిబంధనలకు లోబడి",
    "HIPAA Secure": "HIPAA సురక్షితం",
    "GDPR Ready": "GDPR సిద్ధం",
    "DPDP Compliant": "DPDP నిబంధనలకు లోబడి",
    "Health Insights & Education": "ఆరోగ్య అంతర్దృష్టులు & విద్య",
    "Health Tips": "ఆరోగ్య చిట్కాలు",
    "Daily tips for a healthy life": "ఆరోగ్యకరమైన జీవితం కోసం రోజువారీ చిట్కాలు",
    "Appointment Reminders": "అపాయింట్‌మెంట్ రిమైండర్లు",
    "Never miss your appointments": "మీ అపాయింట్‌మెంట్‌లను ఎప్పటికీ కోల్పోకండి",
    "Preventive Care": "నివారణ సంరక్షణ",
    "Regular checkups for a better you": "మెరుగైన మీ కోసం రెగ్యులర్ చెకప్‌లు",
    "Chronic Disease Programs": "దీర్ఘకాలిక వ్యాధి కార్యక్రమాలు",
    "Specialized care for chronic conditions": "దీర్ఘకాలిక పరిస్థితుల కోసం ప్రత్యేక సంరక్షణ",
    "AI Health Assistant": "ఏఐ హెల్త్ అసిస్టెంట్",
    "Your smart health companion": "మీ స్మార్ట్ ఆరోగ్య సహచరుడు",
    "Home": "హోమ్",
    "Health": "ఆరోగ్యం",
    "Appointments": "నియామకాలు",
    "Records": "రికార్డులు",
    "More": "మరింత"
  },
  BN: {
    "Your Digital": "আপনার ডিজিটাল",
    "Healthcare Ecosystem": "স্বাস্থ্যসেবা ইকোসিস্টেম",
    "Book Consultation": "পরামর্শ বুক করুন",
    "Health ATM": "হেলথ এটিএম",
    "Digital Locker": "ডিজিটাল লকার",
    "Quick Access": "দ্রুত অ্যাক্সেস",
    "View All": "সব দেখুন",
    "Consult Doctor": "ডাক্তার দেখান",
    "Order Medicines": "ওষুধ অর্ডার করুন",
    "Book Lab Tests": "ল্যাব টেস্ট বুক করুন",
    "Manage Insurance": "বীমা পরিচালনা করুন",
    "Training & Courses": "প্রশিক্ষণ ও কোর্স",
    "Hospitals": "হাসপাতাল",
    "Blood Bank": "ব্লাড ব্যাংক",
    "Organ Donation": "অঙ্গদান",
    "QR Scanner": "কিউআর স্ক্যানার",
    "Create ABHA Card": "আভা কার্ড তৈরি করুন",
    "Live Health Dashboard": "লাইভ স্বাস্থ্য ড্যাশবোর্ড",
    "AI Alerts": "এআই অ্যালার্ট",
    "Device Sync": "ডিভাইস সিঙ্ক",
    "Telemedicine": "টেলিমেডিসিন",
    "Video / Audio Consultation": "ভিডিও / অডিও পরামর্শ",
    "Connect with doctors instantly": "ডাক্তারদের সাথে সাথে সাথে যোগাযোগ করুন",
    "Join Now": "এখনই যোগ দিন",
    "Waiting Room": "অপেক্ষার ঘর",
    "Patients Ahead": "রোগী আগে আছেন",
    "Est. 8 mins wait": "আনুমানিক ৮ মিনিট অপেক্ষা",
    "Multi-Doctor": "মাল্টি-ডাক্তার",
    "Conference": "কনফারেন্স",
    "Connect with specialists": "বিশেষজ্ঞদের সাথে যোগাযোগ করুন",
    "Marketplace": "মার্কেটপ্লেস",
    "Medicine Delivery": "ওষুধ সরবরাহ",
    "Lab Booking": "ল্যাব বুকিং",
    "Home Sample Collection": "হোম স্যাম্পল কালেকশন",
    "Medical Equipment": "চিকিৎসা সরঞ্জাম",
    "Ambulance Booking": "অ্যাম্বুলেন্স বুকিং",
    "Drone Delivery": "ড্রোন ডেলিভারি",
    "Coming Soon": "শীঘ্রই আসছে",
    "Medicolegal & Compliance": "মেডিকোলেগাল ও কমপ্লায়েন্স",
    "Medicolegal Support": "মেডিকোলেগাল সহায়তা",
    "Digital Consent Forms": "ডিজিটাল সম্মতি ফর্ম",
    "Prescription Verification": "প্রেসক্রিপশন যাচাইকরণ",
    "Secure Health Records": "সুরক্ষিত স্বাস্থ্য রেকর্ড",
    "Telemedicine Compliance": "টেলিমেডিসিন কমপ্লায়েন্স",
    "Legal Docs Vault": "আইনি নথি ভল্ট",
    "ABDM Compliant": "ABDM অনুগত",
    "HIPAA Secure": "HIPAA সুরক্ষিত",
    "GDPR Ready": "GDPR প্রস্তুত",
    "DPDP Compliant": "DPDP অনুগত",
    "Health Insights & Education": "স্বাস্থ্য অন্তর্দৃষ্টি ও শিক্ষা",
    "Health Tips": "স্বাস্থ্য টিপস",
    "Daily tips for a healthy life": "সুস্থ জীবনের জন্য দৈনিক টিপস",
    "Appointment Reminders": "অ্যাপয়েন্টমেন্ট অনুস্মারক",
    "Never miss your appointments": "আপনার অ্যাপয়েন্টমেন্ট মিস করবেন না",
    "Preventive Care": "প্রতিরোধমূলক যত্ন",
    "Regular checkups for a better you": "একটি ভাল আপনার জন্য নিয়মিত পরীক্ষা",
    "Chronic Disease Programs": "দীর্ঘস্থায়ী রোগ প্রোগ্রাম",
    "Specialized care for chronic conditions": "দীর্ঘস্থায়ী অবস্থার জন্য বিশেষ যত্ন",
    "AI Health Assistant": "এআই স্বাস্থ্য সহকারী",
    "Your smart health companion": "আপনার smart স্বাস্থ্য সঙ্গী",
    "Home": "হোম",
    "Health": "স্বাস্থ্য",
    "Appointments": "অ্যাপয়েন্টমেন্ট",
    "Records": "রেকর্ড",
    "More": "আরো"
  },
  MR: {
    "Your Digital": "तुमची डिजिटल",
    "Healthcare Ecosystem": "आरोग्य सेवा इकोसिस्टम",
    "Book Consultation": "सल्लामसलत बुक करा",
    "Health ATM": "हेल्थ एटीएम",
    "Digital Locker": "डिजिटल लॉकर",
    "Quick Access": "त्वरित प्रवेश",
    "View All": "सर्व पहा",
    "Consult Doctor": "डॉक्टरांचा सल्ला घ्या",
    "Order Medicines": "औषधे ऑर्डर करा",
    "Book Lab Tests": "लॅब चाचण्या बुक करा",
    "Manage Insurance": "विमा व्यवस्थापित करा",
    "Training & Courses": "प्रशिक्षण आणि अभ्यासक्रम",
    "Hospitals": "रुग्णालये",
    "Blood Bank": "ब्लड बँक",
    "Organ Donation": "अवयव दान",
    "QR Scanner": "क्यूआर स्कॅनर",
    "Create ABHA Card": "आभा कार्ड बनवा",
    "Live Health Dashboard": "लाइव्ह हेल्थ डॅशबोर्ड",
    "AI Alerts": "एआय अलर्ट",
    "Device Sync": "डिव्हाइस सिंक",
    "Telemedicine": "टेलीमेडिसिन",
    "Video / Audio Consultation": "व्हिडिओ / ऑडिओ सल्लामसलत",
    "Connect with doctors instantly": "डॉक्टरांशी त्वरित संपर्क साधा",
    "Join Now": "आता सामील व्हा",
    "Waiting Room": "प्रतिक्षा कक्ष",
    "Patients Ahead": "रुग्ण पुढे आहेत",
    "Est. 8 mins wait": "अंदाजे ८ मिनिटे प्रतीक्षा",
    "Multi-Doctor": "मल्टी-डॉक्टर",
    "Conference": "परिषद",
    "Connect with specialists": "तज्ञांशी संपर्क साधा",
    "Marketplace": "मार्केटप्लेस",
    "Medicine Delivery": "औषध वितरण",
    "Lab Booking": "लॅब बुकिंग",
    "Home Sample Collection": "घरी नमुना संकलन",
    "Medical Equipment": "वैद्यकीय उपकरणे",
    "Ambulance Booking": "अँबुलन्स बुकिंग",
    "Drone Delivery": "ड्रोन डिलिव्हरी",
    "Coming Soon": "लवकरच येत आहे",
    "Medicolegal & Compliance": "मेडिकोलीगल आणि अनुपालन",
    "Medicolegal Support": "मेडिकोलीगल समर्थन",
    "Digital Consent Forms": "डिजिटल संमती फॉर्म",
    "Prescription Verification": "प्रिस्क्रिप्शन पडताळणी",
    "Secure Health Records": "सुरक्षित आरोग्य रेकॉर्ड",
    "Telemedicine Compliance": "टेलीमेडिसिन अनुपालन",
    "Legal Docs Vault": "कायदेशीर दस्तऐवज वॉल्ट",
    "ABDM Compliant": "ABDM सुसंगत",
    "HIPAA Secure": "HIPAA सुरक्षित",
    "GDPR Ready": "GDPR तयार",
    "DPDP Compliant": "DPDP सुसंगत",
    "Health Insights & Education": "आरोग्य अंतर्दृष्टी आणि शिक्षण",
    "Health Tips": "आरोग्य टिप्स",
    "Daily tips for a healthy life": "निरोगी आयुष्यासाठी रोजच्या टिप्स",
    "Appointment Reminders": "अपॉइंटमेंट स्मरणपत्रे",
    "Never miss your appointments": "तुमची अपॉइंटमेंट कधीही चुकवू नका",
    "Preventive Care": "प्रतिबंधात्मक काळजी",
    "Regular checkups for a better you": "चांगल्या आरोग्यासाठी नियमित तपासणी",
    "Chronic Disease Programs": "तीव्र रोग कार्यक्रम",
    "Specialized care for chronic conditions": "तीव्र आजारांसाठी विशेष काळजी",
    "AI Health Assistant": "एआय आरोग्य सहाय्यक",
    "Your smart health companion": "तुमचा स्मार्ट आरोग्य सोबती",
    "Home": "होम",
    "Health": "आरोग्य",
    "Appointments": "अपॉइंटमेंट",
    "Records": "रेकॉर्ड",
    "More": "अधिक"
  },
  GU: {
    "Your Digital": "તમારું ડિજિટલ",
    "Healthcare Ecosystem": "હેલ્થકેર ઇકોસિસ્ટમ",
    "Book Consultation": "પરામર્શ બુક કરો",
    "Health ATM": "હેલ્થ એટીએમ",
    "Digital Locker": "ડિજિટલ લોકર",
    "Quick Access": "ઝડપી પ્રવેશ",
    "View All": "બધું જુઓ",
    "Consult Doctor": "ડોક્ટરની સલાહ",
    "Order Medicines": "દવાઓ ઓર્ડર કરો",
    "Book Lab Tests": "લેબ ટેસ્ટ બુક કરો",
    "Manage Insurance": "વીમો સંચાલિત કરો",
    "Training & Courses": "તાલીમ અને અભ્યાસક્રમો",
    "Hospitals": "હોસ્પિટલો",
    "Blood Bank": "બ્લડ બેંક",
    "Organ Donation": "અંગ દાન",
    "QR Scanner": "ક્યૂઆર સ્કેનર",
    "Create ABHA Card": "આભા કાર્ડ બનાવો",
    "Live Health Dashboard": "લાઇવ હેલ્થ ડેશબોર્ડ",
    "AI Alerts": "એઆઈ એલર્ટ",
    "Device Sync": "ડિવાઇસ સિંક",
    "Telemedicine": "ટેલીમેડિસિન",
    "Video / Audio Consultation": "વિડિઓ / ઓડિયો પરામર્શ",
    "Connect with doctors instantly": "ડોકટરો સાથે તરત જ જોડાઓ",
    "Join Now": "હમણાં જોડાઓ",
    "Waiting Room": "પ્રતીક્ષા ખંડ",
    "Patients Ahead": "દર્દીઓ આગળ છે",
    "Est. 8 mins wait": "આશરે ૮ મિનિટ પ્રતીક્ષા",
    "Multi-Doctor": "મલ્ટી-ડોક્ટર",
    "Conference": "કોન્ફરન્સ",
    "Connect with specialists": "નિષ્ણાતો સાથે જોડાઓ",
    "Marketplace": "માર્કેટપ્લેસ",
    "Medicine Delivery": "દવા વિતરણ",
    "Lab Booking": "લેબ બુકિંગ",
    "Home Sample Collection": "ઘરે સેમ્પલ કલેક્શન",
    "Medical Equipment": "તબીબી સાધનો",
    "Ambulance Booking": "એમ્બ્યુલન્સ બુકિંગ",
    "Drone Delivery": "ડ્રોન ડિલિવરી",
    "Coming Soon": "ટૂંક સમયમાં આવી રહ્યું છે",
    "Medicolegal & Compliance": "મેડિકોલીગલ અને અનુપાલન",
    "Medicolegal Support": "મેડિકોલીગલ સપોર્ટ",
    "Digital Consent Forms": "ડિજિટલ સંમતિ પત્રો",
    "Prescription Verification": "પ્રિસ્ક્રિપ્શન ચકાસણી",
    "Secure Health Records": "સુરક્ષિત આરોગ್ಯ રેકોર્ડ્સ",
    "Telemedicine Compliance": "ટેલીમેડિસિન અનુપાલન",
    "Legal Docs Vault": "કાનૂની દસ્તાવેજો વોલ્ટ",
    "ABDM Compliant": "ABDM સુસંગત",
    "HIPAA Secure": "HIPAA સુરક્ષિત",
    "GDPR Ready": "GDPR તૈયાર",
    "DPDP Compliant": "DPDP સુસંગત",
    "Health Insights & Education": "આરોગ્ય આંતરદૃષ્ટિ અને શિક્ષણ",
    "Health Tips": "આરોગ્ય ટિપ્સ",
    "Daily tips for a healthy life": "સ્વસ્થ જીવન માટે દૈનિક ટિપ્સ",
    "Appointment Reminders": "એપોઇન્ટમેન્ટ રીમાઇન્ડર્સ",
    "Never miss your appointments": "તમારી એપોઇન્ટમેન્ટ ક્યારેય ચૂકશો નહીં",
    "Preventive Care": "નિવારક સંભાળ",
    "Regular checkups for a better you": "વધુ સારા સ્વાસ્થ્ય માટે નિયમિત તપાસ",
    "Chronic Disease Programs": "ક્રોનિક રોગ કાર્યક્રમો",
    "Specialized care for chronic conditions": "ક્રોનિક રોગો માટે ખાસ કાળજી",
    "AI Health Assistant": "એઆઈ આરોગ್ಯ સહાયક",
    "Your smart health companion": "તમારો સ્માર્ટ આરોગ્ય સાથી",
    "Home": "હોમ",
    "Health": "આરોગ્ય",
    "Appointments": "એપોઇન્ટમેન્ટ",
    "Records": "રેકોર્ડ્સ",
    "More": "વધુ"
  },
  KN: {
    "Your Digital": "ನಿಮ್ಮ ಡಿಜಿಟಲ್",
    "Healthcare Ecosystem": "ಆರೋಗ್ಯ ರಕ್ಷಣೆ ಪರಿಸರ ವ್ಯವಸ್ಥೆ",
    "Book Consultation": "ಸಮಾಲೋಚನೆ ಬುಕ್ ಮಾಡಿ",
    "Health ATM": "ಹೆಲ್ತ್ ಎಟಿಎಂ",
    "Digital Locker": "ಡಿಜಿಟಲ್ ಲಾಕರ್",
    "Quick Access": "ತ್ವರಿತ ಪ್ರವೇಶ",
    "View All": "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    "Consult Doctor": "ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ",
    "Order Medicines": "ಔಷಧಿಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಿ",
    "Book Lab Tests": "ಲ್ಯಾಬ್ ಪರೀಕ್ಷೆಗಳನ್ನು ಬುಕ್ ಮಾಡಿ",
    "Manage Insurance": "ವಿಮೆಯನ್ನು ನಿರ್ವಹಿಸಿ",
    "Training & Courses": "ತರಬೇತಿ ಮತ್ತು ಕೋರ್ಸ್‌ಗಳು",
    "Hospitals": "ಆಸ್ಪತ್ರೆಗಳು",
    "Blood Bank": "ರಕ್ತನಿಧಿ",
    "Organ Donation": "ಅಂಗದಾನ",
    "QR Scanner": "ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನರ್",
    "Create ABHA Card": "ಆಭಾ ಕಾರ್ಡ್ ರಚಿಸಿ",
    "Live Health Dashboard": "ಲೈವ್ ಹೆಲ್ತ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "AI Alerts": "ಎಐ ಎಚ್ಚರಿಕೆಗಳು",
    "Device Sync": "ಡಿವೈಸ್ ಸಿಂಕ್",
    "Telemedicine": "ಟೆಲಿಮೆಡಿಸಿನ್",
    "Video / Audio Consultation": "ವಿಡಿಯೋ / ಆಡಿಯೋ ಸಮಾಲೋಚನೆ",
    "Connect with doctors instantly": "ವೈದ್ಯರೊಂದಿಗೆ ತಕ್ಷಣ ಸಂಪರ್ಕ ಸಾಧಿಸಿ",
    "Join Now": "ಈಗಲೇ ಸೇರಿಕೊಳ್ಳಿ",
    "Waiting Room": "ಕಾಯುವ ಕೊಠಡಿ",
    "Patients Ahead": "ರೋಗಿಗಳು ಮುಂದೆ ಇದ್ದಾರೆ",
    "Est. 8 mins wait": "ಅಂದಾಜು 8 ನಿಮಿಷ ಕಾಯುವಿಕೆ",
    "Multi-Doctor": "ಮಲ್ಟಿ-ಡಾಕ್ಟರ್",
    "Conference": "ಕಾನ್ಫರೆನ್ಸ್",
    "Connect with specialists": "ತಜ್ಞರೊಂದಿಗೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ",
    "Marketplace": "ಮಾರುಕಟ್ಟೆ",
    "Medicine Delivery": "ಔಷಧಿ ವಿತರಣೆ",
    "Lab Booking": "ಲ್ಯಾಬ್ ಬುಕಿಂಗ್",
    "Home Sample Collection": "ಮನೆಯಲ್ಲಿ ಮಾದರಿ ಸಂಗ್ರಹಣೆ",
    "Medical Equipment": "ವೈದ್ಯಕೀಯ ಉಪಕರಣಗಳು",
    "Ambulance Booking": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಬುಕಿಂಗ್",
    "Drone Delivery": "ಡ್ರೋನ್ ಡೆಲಿವರಿ",
    "Coming Soon": "ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
    "Medicolegal & Compliance": "ಮೆಡಿಕೋಲೀಗಲ್ ಮತ್ತು ಅನುಸರಣೆ",
    "Medicolegal Support": "ಮೆಡಿಕೋಲೀಗಲ್ ಬೆಂಬಲ",
    "Digital Consent Forms": "ಡಿಜಿಟಲ್ ಒಪ್ಪಿಗೆ ಪತ್ರಗಳು",
    "Prescription Verification": "ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಪರಿಶೀಲನೆ",
    "Secure Health Records": "ಸುರಕ್ಷಿತ ಆರೋಗ್ಯ ದಾಖಲೆಗಳು",
    "Telemedicine Compliance": "ಟೆಲಿಮೆಡಿಸಿನ್ ಅನುಸರಣೆ",
    "Legal Docs Vault": "ಕಾನೂನು ದಾಖಲೆಗಳ ವಾಲ್ಟ್",
    "ABDM Compliant": "ABDM ಕಂಪ್ಲೈಂಟ್",
    "HIPAA Secure": "HIPAA ಸುರಕ್ಷಿತ",
    "GDPR Ready": "GDPR ಸಿದ್ಧ",
    "DPDP Compliant": "DPDP ಕಂಪ್ಲೈಂಟ್",
    "Health Insights & Education": "ಆರೋಗ್ಯ ಒಳನೋಟಗಳು ಮತ್ತು ಶಿಕ್ಷಣ",
    "Health Tips": "ಆರೋಗ್ಯ ಸಲಹೆಗಳು",
    "Daily tips for a healthy life": "ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕಾಗಿ ದೈನಂದಿನ ಸಲಹೆಗಳು",
    "Appointment Reminders": "ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಜ್ಞಾಪನೆಗಳು",
    "Never miss your appointments": "ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳನ್ನು ಎಂದಿಗೂ ತಪ್ಪಿಸಬೇಡಿ",
    "Preventive Care": "ತಡೆಗಟ್ಟುವ ಆರೈಕೆ",
    "Regular checkups for a better you": "ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕಾಗಿ ನಿಯಮಿತ ತಪಾಸಣೆ",
    "Chronic Disease Programs": "ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆ ಕಾರ್ಯಕ್ರಮಗಳು",
    "Specialized care for chronic conditions": "ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆಗಳಿಗೆ ವಿಶೇಷ ಆರೈಕೆ",
    "AI Health Assistant": "ಎಐ ಆರೋಗ್ಯ ಸಹಾಯಕ",
    "Your smart health companion": "ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಆರೋಗ್ಯ ಒಡನಾಡಿ",
    "Home": "ಹೋಮ್",
    "Health": "ಆರೋಗ್ಯ",
    "Appointments": "ನೇಮಕಾತಿಗಳು",
    "Records": "ದಾಖಲೆಗಳು",
    "More": "ಇನ್ನಷ್ಟು"
  }
};

let contentRoot;
let homeMarkup = "";

// Multi-lingual Translation Helper
function _t(key) {
  const state = getAppState();
  const lang = state.language || "EN";
  if (translations[lang] && translations[lang][key]) {
    return translations[lang][key];
  }
  return key;
}

function translateMarkup(markup) {
  let translated = markup;
  const state = getAppState();
  const lang = state.language || "EN";
  if (lang === "EN") return translated;

  // Perform translation on core strings in the markup
  Object.keys(translations[lang]).forEach(engKey => {
    // Escape regex characters
    const escapedKey = engKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(?<=>|^|\\s)${escapedKey}(?=<|\\s|$|\\.)`, "g");
    translated = translated.replace(regex, translations[lang][engKey]);
  });
  return translated;
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function routePath(route) {
  return `#/${route}`;
}

function icon(name, className = "route-icon") {
  return `<i data-lucide="${name}" class="${className}"></i>`;
}

// App Initialization
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

  // Apply saved theme & accessibility tags immediately
  const state = getAppState();
  applyThemeAndAccessibility(state);

  wireHome();
  wireChrome();
  setupSearch();

  // Watch URL changes
  window.addEventListener("hashchange", renderCurrentRoute);
  renderCurrentRoute();
}

// Applies themes/accessibility settings classes to body
function applyThemeAndAccessibility(state) {
  // Clear other themes
  document.body.classList.remove("theme-slate-dark", "theme-ocean-blue", "theme-emerald-light");
  if (state.theme !== "dark-teal") {
    document.body.classList.add(`theme-${state.theme}`);
  }

  // Accessibility modes
  document.body.classList.toggle("accessibility-large-font", !!state.accessibility.largeFont);
  document.body.classList.toggle("accessibility-high-contrast", !!state.accessibility.highContrast);
}

// Sync avatar, notifications unread counts, and active language label
function updateHeaderUI() {
  const state = getAppState();
  const header = document.querySelector(".header");
  if (!header) return;

  // Notifications bell badge
  const badge = header.querySelector(".notification-badge");
  const unreadCount = state.notifications.filter(n => n.unread).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }

  const avatarImg = header.querySelector(".avatar img");
  if (avatarImg) {
    avatarImg.src = "assets/doctors/dr-ayesha-ali.jpeg";
    if (state.currentUser) {
      avatarImg.alt = state.currentUser.name;
    } else {
      avatarImg.alt = "Guest Avatar";
    }
  }

  // Language selector button label
  const langLabel = header.querySelector(".lang-selector span");
  if (langLabel) {
    langLabel.textContent = state.language;
  }
}

function wireChrome() {
  document.querySelector(".logo")?.setAttribute("data-route", "home");
  document.querySelector(".logo")?.setAttribute("role", "link");
  
  // Wire dynamic notifications click
  const notificationBell = document.querySelector(".notification");
  if (notificationBell) {
    notificationBell.addEventListener("click", (e) => {
      e.preventDefault();
      toggleNotificationDrawer();
    });
  }

  // Wire theme picker toggle
  const themeToggle = document.querySelector(".theme-toggle-btn");
  if (themeToggle) {
    themeToggle.addEventListener("click", (e) => {
      e.preventDefault();
      cycleTheme();
    });
  }

  // Wire dynamic profile avatar dropdown click
  const avatarBtn = document.querySelector(".avatar");
  const profileDropdown = document.querySelector(".profile-dropdown");
  if (avatarBtn && profileDropdown) {
    avatarBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = profileDropdown.classList.toggle("is-open");
      avatarBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    avatarBtn.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Esc") {
        profileDropdown.classList.remove("is-open");
        avatarBtn.setAttribute("aria-expanded", "false");
        avatarBtn.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!avatarBtn.contains(event.target) && !profileDropdown.contains(event.target)) {
        profileDropdown.classList.remove("is-open");
        avatarBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Wire language picker quick action
  const langSelector = document.querySelector(".lang-selector");
  if (langSelector) {
    langSelector.addEventListener("click", (e) => {
      e.preventDefault();
      navigate("language");
    });
  }

  document.querySelectorAll(".nav-item").forEach((item) => {
    const label = cleanText(item.textContent);
    let route = "home";
    if (label.includes("Home")) route = "home";
    else if (label.includes("Health")) route = "health";
    else if (label.includes("Scan")) route = "qr-scanner";
    else if (label.includes("Appointments")) route = "appointments";
    else if (label.includes("More")) route = "more";
    
    item.href = routePath(route);
    item.dataset.route = route;
  });

  document.body.addEventListener("click", (event) => {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      handleAction(actionTarget, event);
      return;
    }

    const target = event.target.closest("[data-route]");
    if (!target) return;
    const route = target.dataset.route;
    if (!route) return;
    event.preventDefault();
    
    // Close profile dropdown when navigating
    const profileDropdown = document.querySelector(".profile-dropdown");
    if (profileDropdown) {
      profileDropdown.classList.remove("is-open");
      document.querySelector(".avatar")?.setAttribute("aria-expanded", "false");
    }
    
    navigate(route);
  });
}

function highlightQueryText(text, query) {
  if (!query) return text;
  const escaped = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  return text.replace(regex, `<mark class="search-highlight">$1</mark>`);
}

function setupSearch() {
  const searchInput = document.querySelector("#service-search");
  const suggestions = document.querySelector("#search-suggestions");
  if (!searchInput || !suggestions) return;

  const globalSearchBox = document.querySelector(".global-search");
  const closeBtn = document.querySelector(".search-close-btn");

  let activeSuggestionIndex = -1;
  let currentMatches = [];

  function closeSuggestions() {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    activeSuggestionIndex = -1;
    if (globalSearchBox) globalSearchBox.classList.remove("is-active");
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      searchInput.value = "";
      closeSuggestions();
      searchInput.blur();
    });
  }

  function openSuggestions(matches) {
    currentMatches = matches;
    activeSuggestionIndex = -1;
    if (!matches.length) {
      suggestions.innerHTML = `<div class="suggestion-empty">${_t("No matching services found")}</div>`;
      suggestions.classList.add("is-open");
      return;
    }

    const query = searchInput.value.trim();

    // Group matches by type
    const groups = {};
    matches.forEach(item => {
      if (!groups[item.type]) {
        groups[item.type] = [];
      }
      groups[item.type].push(item);
    });

    let html = "";
    let itemIdx = 0; // for keyboard navigation indexing
    Object.keys(groups).forEach(type => {
      html += `<div class="suggestion-group-header">${_t(type)}</div>`;
      groups[type].forEach(item => {
        const highlightedTitle = highlightQueryText(_t(item.title), query);
        const highlightedDesc = highlightQueryText(_t(item.desc), query);
        html += `
          <button type="button" class="suggestion-item" data-route="${item.route}" data-index="${itemIdx}" role="option" tabindex="-1">
            ${icon(item.icon || "search", "small-icon")}
            <span>
              <strong>${highlightedTitle}</strong>
              <small>${highlightedDesc}</small>
            </span>
          </button>
        `;
        itemIdx++;
      });
    });

    suggestions.innerHTML = html;
    suggestions.classList.add("is-open");
    if (window.lucide) lucide.createIcons();
  }

  function highlightSuggestion(index) {
    const items = suggestions.querySelectorAll(".suggestion-item");
    items.forEach(el => el.classList.remove("active-suggestion"));
    if (index >= 0 && index < items.length) {
      const activeEl = items[index];
      activeEl.classList.add("active-suggestion");
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }

  function updateSuggestions() {
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      closeSuggestions();
      return;
    }

    const state = getAppState();

    // Include dynamic and static searchable items
    const searchableItems = [
      // Services / Pages
      { type: "Services", title: "ABHA Card", route: "abdm-services", icon: "id-card", desc: "Create, view, download or verify ABHA Card." },
      { type: "Services", title: "Order Medicines", route: "order-medicine", icon: "pill", desc: "Browse OTC/Prescription medicines, add to cart." },
      { type: "Services", title: "Book Lab Tests", route: "book-lab-test", icon: "flask-conical", desc: "Book NABL diagnostics, check slots, and sync ABHA." },
      { type: "Services", title: "Hospitals Registry", route: "hospitals", icon: "building-2", desc: "Verified HFR hospitals directory, check-in queues." },
      { type: "Services", title: "Blood Bank Directory", route: "blood-bank", icon: "droplet", desc: "Check blood units availability, request or donate blood." },
      { type: "Services", title: "Organ Donation Pledge", route: "organ-donation", icon: "heart-handshake", desc: "Submit organ transplant pledge, download NHA certificate." },
      { type: "Services", title: "Connected Facilities", route: "connected-facilities", icon: "building", desc: "Scan and share at active hospitals and diagnostics." },
      { type: "Services", title: "Security Dashboard", route: "security", icon: "shield-check", desc: "Check role permissions, token logs, security credentials." },
      { type: "Services", title: "Theme Switching", route: "settings", icon: "palette", desc: "Choose color themes." },
      { type: "Services", title: "Accessibility Settings", route: "settings", icon: "accessibility", desc: "Font sizes, screen reader, high contrast options." },
      { type: "Services", title: "Language Preferences", route: "settings", icon: "languages", desc: "Select multilingual preferences." },
      { type: "Services", title: "Telemedicine Room", route: "telemedicine-room", icon: "video", desc: "Enter private virtual health appointment room." },

      // Hospitals (Dynamic)
      ...hospitalsList.map(h => ({
        type: "Hospitals",
        title: h.name,
        route: "hospitals",
        icon: "building-2",
        desc: `HFR: ${h.hfrId} | ${h.address}`
      })),

      // Doctors (Dynamic)
      ...doctors.map(d => ({
        type: "Doctors",
        title: d.name,
        route: "telemedicine",
        icon: "user-round",
        desc: `${d.role} | Rating: ${d.rating} ★ | ${d.experience}`
      })),

      // Blood Donors (Dynamic / Real)
      ...(state.bloodDonors || [
        { name: "Ashish Patel", age: 33, bg: "B+", mobile: "9981435702", lastDon: "3 months ago" },
        { name: "Anant Agrahri", age: 32, bg: "B+", mobile: "9977756362", lastDon: "3 months ago" },
        { name: "Priyanka Mehra", age: 32, bg: "O+", mobile: "Not Available", lastDon: "3 months ago" },
        { name: "Manoj Jhariya", age: 37, bg: "O+", mobile: "Not Available", lastDon: "3 months ago" }
      ]).map(d => ({
        type: "Blood Donors",
        title: `${d.name} (${d.bg})`,
        route: "blood-bank",
        icon: "user-round",
        desc: `Age: ${d.age} Years | Contact: ${d.mobile} | Last: ${d.lastDon}`
      })),

      // Medicines (Dynamic)
      ...medicinesList.map(m => ({
        type: "Medicines",
        title: m.name,
        route: "order-medicine",
        icon: "pill",
        desc: `Price: ₹${m.price} | Category: ${m.category} | ${m.desc}`
      })),

      // Courses (Static)
      { type: "Courses", title: "First Aid Certification Course", route: "more", icon: "graduation-cap", desc: "CPR training and basic life support certificate." },
      { type: "Courses", title: "ABDM Integration Training", route: "more", icon: "graduation-cap", desc: "Training for health facilities to integrate under Ayushman Bharat." },
      { type: "Courses", title: "Primary Care Nursing Specialization", route: "more", icon: "graduation-cap", desc: "Nursing training course for emergency triage." },

      // Insurance (Static)
      { type: "Insurance", title: "Ayushman Bharat PM-JAY Policy", route: "abdm-services", icon: "shield-check", desc: "Verify eligibility and link PM-JAY insurance cards." },
      { type: "Insurance", title: "Care Shield Plus Insurance Plan", route: "digital-locker", icon: "shield", desc: "Review claim histories and upload digital policy cards." },

      // Labs (Static)
      { type: "Labs", title: "ECG Diagnostic Screening", route: "book-lab-test", icon: "activity", desc: "Diagnostic lab slot for heart screening scans." },
      { type: "Labs", title: "NABL Pathology Lab Tests", route: "book-lab-test", icon: "flask-conical", desc: "NABL certified blood tests and sample collection." },

      // Facilities (Dynamic)
      ...connectedFacilities.map(f => ({
        type: "Facilities",
        title: f.title,
        route: f.route,
        icon: "building",
        desc: `${f.type} | HFR: ${f.hfrId} | ${f.desc}`
      })),

      // Departments
      { type: "Departments", title: "Cardiology Department", route: "connected-facilities", icon: "heart-pulse", desc: "Heart health specialist consultations, cardiology clinic." },
      { type: "Departments", title: "Neurology Department", route: "hospitals", icon: "brain-circuit", desc: "Brain, spine, and central nervous system specialty department." },
      { type: "Departments", title: "Homeopathy OPD", route: "telemedicine", icon: "stethoscope", desc: "Ayush Homeopathy consultancy, wellness plans." },

      // Emergency Services
      { type: "Emergency Services", title: "Emergency Ambulance Booking", route: "more", icon: "ambulance", desc: "Simulated rapid ambulance dispatch and tracking." },
      { type: "Emergency Services", title: "Urgent Blood Request Board", route: "blood-bank", icon: "droplet", desc: "Post emergency blood units request to the community." }
    ];

    const matches = searchableItems
      .filter((item) => `${item.title} ${item.desc} ${item.type}`.toLowerCase().includes(query))
      .slice(0, 15); // Show more results since they are grouped
    openSuggestions(matches);
  }

  searchInput.addEventListener("input", updateSuggestions);
  searchInput.addEventListener("focus", () => {
    if (globalSearchBox) globalSearchBox.classList.add("is-active");
    updateSuggestions();
  });
  searchInput.addEventListener("keydown", (event) => {
    const items = suggestions.querySelectorAll(".suggestion-item");
    
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!suggestions.classList.contains("is-open")) {
        updateSuggestions();
        return;
      }
      if (items.length > 0) {
        activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
        highlightSuggestion(activeSuggestionIndex);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!suggestions.classList.contains("is-open")) return;
      if (items.length > 0) {
        activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
        highlightSuggestion(activeSuggestionIndex);
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
        const route = items[activeSuggestionIndex].dataset.route;
        searchInput.value = "";
        closeSuggestions();
        navigate(route);
      } else {
        const first = suggestions.querySelector(".suggestion-item");
        if (first) {
          searchInput.value = "";
          closeSuggestions();
          navigate(first.dataset.route);
        }
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeSuggestions();
      searchInput.blur();
    }
  });

  suggestions.addEventListener("click", (event) => {
    const item = event.target.closest(".suggestion-item");
    if (!item) return;
    const route = item.dataset.route;
    searchInput.value = "";
    navigate(route);
    closeSuggestions();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".global-search")) closeSuggestions();
  });
}

function wireHome() {
  contentRoot.querySelectorAll(".hero-btn, .quick-item, .health-card, .status-card, .tele-card, .market-item, .legal-item, .insight-card, .badge").forEach((item) => {
    const label = cleanText(item.textContent);
    let route = "more";
    if (label.includes("Create ABHA") || label.includes("ABHA")) route = "abdm-services";
    else if (label.includes("Consult Doctor") || label.includes("Book Consultation") || label.includes("Physician")) route = "telemedicine";
    else if (label.includes("Digital Locker") || label.includes("Health Locker")) route = "digital-locker";
    else if (label.includes("Health ATM")) route = "health-atm";
    else if (label.includes("QR Scanner")) route = "qr-scanner";
    else if (label.includes("Order Medicines") || label.includes("Order")) route = "order-medicine";
    else if (label.includes("Book Lab Tests") || label.includes("Book Lab")) route = "book-lab-test";
    else if (label.includes("Hospitals")) route = "hospitals";
    else if (label.includes("Blood Bank")) route = "blood-bank";
    else if (label.includes("Organ Donation")) route = "organ-donation";
    else if (label.includes("Live Health Dashboard")) route = "live-dashboard";
    else if (label.includes("Device Sync")) route = "devices";
    else if (label.includes("AI Alerts")) route = "ai-alerts";
    else if (label.includes("Compliance") || label.includes("ABDM")) route = "compliance";
    
    item.dataset.route = route;
    item.setAttribute("role", "link");
    item.tabIndex = 0;
  });

  contentRoot.querySelectorAll(".view-all").forEach((link) => {
    const heading = link.closest(".section")?.querySelector("h3");
    const headingText = cleanText(heading?.textContent || "");
    let route = "more";
    if (headingText.includes("Live Health")) route = "live-dashboard";
    else if (headingText.includes("Telemedicine")) route = "telemedicine";
    else if (headingText.includes("Insights")) route = "insights";
    
    link.href = routePath(route);
    link.dataset.route = route;
  });

  contentRoot.querySelector(".join-btn")?.setAttribute("data-route", "telemedicine");
}

function navigate(route) {
  if (route === "home") {
    window.location.hash = "";
    renderCurrentRoute();
    return;
  }
  window.location.hash = routePath(route);
}

// Router & Guard Controller
function renderCurrentRoute() {
  const state = getAppState();
  let route = window.location.hash.replace(/^#\/?/, "") || "home";

  // Auth Guard
  if (!state.currentUser && route !== "login" && route !== "register") {
    window.location.hash = "#/login";
    return;
  }

  // Redirect if logged in trying to access login/register
  if (state.currentUser && (route === "login" || route === "register")) {
    window.location.hash = "#/";
    return;
  }

  // Access Guards (Role check)
  if (state.currentUser) {
    const allowed = rolePermissions[state.currentUser.role.toLowerCase()] || [];
    if (!allowed.includes(route) && !route.startsWith("facility-")) {
      contentRoot.className = "route-shell";
      contentRoot.innerHTML = renderUnauthorized(route);
      appendFooter();
      setActiveNav(route);
      if (window.lucide) lucide.createIcons();
      return;
    }
  }

  // Show/Hide Header and Nav based on Auth View
  const headerEl = document.querySelector(".header");
  const navEl = document.querySelector(".bottom-nav");
  if (route === "login" || route === "register") {
    if (headerEl) headerEl.style.display = "none";
    if (navEl) navEl.style.display = "none";
  } else {
    if (headerEl) headerEl.style.display = "flex";
    if (navEl) navEl.style.display = "flex";
  }

  // Sync Header elements
  updateHeaderUI();

  if (route === "home") {
    contentRoot.className = "home-shell";
    contentRoot.innerHTML = translateMarkup(homeMarkup);
    appendFooter();
    wireHome();
  } else {
    contentRoot.className = "route-shell";
    contentRoot.innerHTML = renderRoute(route);
    appendFooter();
  }

  setActiveNav(route);
  if (window.lucide) lucide.createIcons();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function appendFooter() {
  contentRoot.insertAdjacentHTML("beforeend", renderFooter());
}

function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer" aria-label="AbhaSetu footer">
      <div class="footer-brand">
        <div class="footer-logo">
          <div class="logo-icon">${icon("plus", "logo-plus")}</div>
          <div>
            <h2>ABHA SETU</h2>
            <p>${_t("Digital Health Bridge for ABDM-ready healthcare operations, telemedicine, connected facilities, QR flows, and secure patient journeys.")}</p>
          </div>
        </div>
        <div class="footer-trust" aria-label="Compliance readiness">
          <span>${icon("shield-check", "small-icon")} ABDM Ready</span>
          <span>${icon("lock", "small-icon")} Consent-first</span>
          <span>${icon("accessibility", "small-icon")} Accessible</span>
        </div>
      </div>
      <div class="footer-grid">
        <section>
          <h3>Platform</h3>
          <a href="#/abdm-services" data-route="abdm-services">ABDM Services</a>
          <a href="#/telemedicine" data-route="telemedicine">Telemedicine</a>
          <a href="#/connected-facilities" data-route="connected-facilities">Connected Facilities</a>
          <a href="#/qr-scanner" data-route="qr-scanner">QR Scanner</a>
        </section>
        <section>
          <h3>Operations</h3>
          <a href="#/health" data-route="health">Health Insights</a>
          <a href="#/compliance" data-route="compliance">Compliance</a>
          <a href="#/security" data-route="security">Security Logs</a>
          <a href="#/settings" data-route="settings">Settings</a>
        </section>
        <section>
          <h3>Company</h3>
          <a href="#/about" data-route="about">About</a>
          <a href="#/contact" data-route="contact">Contact</a>
          <a href="#/terms" data-route="terms">Terms</a>
          <a href="#/privacy" data-route="privacy">Privacy</a>
        </section>
        <section>
          <h3>Contact</h3>
          <a href="mailto:contact@abhasetu.com"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="mail" aria-hidden="true" class="lucide lucide-mail small-icon"><path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect></svg> contact@abhasetu.com</a>
          <a href="tel:+919981057765"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="phone" aria-hidden="true" class="lucide lucide-phone small-icon"><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path></svg> +91-9981057765</a>
          <p><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="map-pin" aria-hidden="true" class="lucide lucide-map-pin small-icon"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg> Madar Gate, Panchampura, Katangi, Jabalpur, Madhya Pradesh 483105</p>
        </section>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ABHA SETU. All rights reserved.</span>
        <span>Healthcare workflows shown in demo mode. Live ABDM use requires approved sandbox or production credentials.</span>
      </div>
    </footer>
  `;
}

function setActiveNav(route) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    const itemRoute = item.dataset.route;
    const isActive = itemRoute === route;
    item.classList.toggle("active", isActive || (route === "home" && itemRoute === "home"));
  });
}

// Router map
function renderRoute(route) {
  const renderers = {
    login: renderLogin,
    register: renderRegister,
    health: renderHealth,
    appointments: renderAppointments,
    records: renderRecords,
    more: renderMore,
    "book-consultation": renderTelemedicine,
    "health-atm": renderHealthAtm,
    "digital-locker": renderDigitalLocker,
    "live-dashboard": renderLiveDashboard,
    telemedicine: renderTelemedicine,
    "telemedicine-room": renderTelemedicineRoom,
    "qr-scanner": renderQrScanner,
    "abdm-services": renderAbdmServices,
    "connected-facilities": renderConnectedFacilities,
    security: renderSecurity,
    settings: renderSettings,
    contact: renderContact,
    about: renderAbout,
    terms: renderTerms,
    privacy: renderPrivacy,
    compliance: renderCompliance,
    insights: renderInsights,
    notifications: renderNotifications,
    profile: renderProfile,
    language: renderLanguage,
    "ai-alerts": renderAiAlerts,
    devices: renderDevices,
    "order-medicine": renderOrderMedicine,
    "book-lab-test": renderBookLabTest,
    hospitals: renderHospitals,
    "blood-bank": renderBloodBank,
    "organ-donation": renderOrganDonation
  };

  if (renderers[route]) return renderers[route]();
  if (route.startsWith("facility-")) return renderFacilityPage(route);
  return renderGenericService(route);
}

function pageHeader(title, subtitle, action = "") {
  return `
    <section class="route-hero">
      <a href="#/" data-route="home" class="back-link">${icon("arrow-left", "small-icon")} ${_t("Home")}</a>
      <div>
        <p class="eyebrow">ABHA SETU</p>
        <h2>${_t(title)}</h2>
        <p>${_t(subtitle)}</p>
      </div>
      ${action}
    </section>
  `;
}

// --------------------------------------------------------------------------
// SCREEN RENDERERS
// --------------------------------------------------------------------------

// 1. LOGIN SCREEN
function renderLogin() {
  return `
    <div class="login-container">
      <div class="login-card">
        <div class="logo" style="justify-content: center; margin-bottom: 18px;">
          <div class="logo-icon">${icon("plus", "logo-plus")}</div>
          <div class="logo-text" style="text-align: left;">
            <h1 style="font-size: 18px;">ABHA SETU</h1>
            <span>Digital Health Bridge</span>
          </div>
        </div>
        <h2>Secure Portal Sign-In</h2>
        <p class="subtitle">Select a quick demo role to prefill or sign in manually.</p>
        
        <div class="role-prefill-grid">
          <button type="button" class="prefill-btn" onclick="selectPrefilledRole('patient')">
            ${icon("user-round")}
            <span>Patient</span>
          </button>
          <button type="button" class="prefill-btn" onclick="selectPrefilledRole('doctor')">
            ${icon("stethoscope")}
            <span>Doctor</span>
          </button>
          <button type="button" class="prefill-btn" onclick="selectPrefilledRole('operator')">
            ${icon("users")}
            <span>Operator</span>
          </button>
          <button type="button" class="prefill-btn" onclick="selectPrefilledRole('admin')">
            ${icon("shield-check")}
            <span>Admin</span>
          </button>
        </div>

        <div class="divider">OR SIGN IN MANUALLY</div>

        <form id="manual-login-form" class="form-grid" onsubmit="handleManualLogin(event)" style="gap: 12px;">
          <label>Email Address
            <input type="email" id="login-email" required placeholder="name@domain.com">
          </label>
          <label>Password
            <input type="password" id="login-pass" required placeholder="••••••••">
          </label>
          <div id="login-error" style="color: var(--danger); font-size: 11px; display: none;">Invalid credentials. Please verify.</div>
          <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 8px;">Verify and Access</button>
        </form>

        <p style="text-align: center; font-size: 12px; margin-top: 18px; color: var(--text-secondary);">
          New to the ecosystem? <a href="#/register" style="color: var(--accent-teal); font-weight: 700; text-decoration: none;">Register Health Account</a>
        </p>
      </div>
    </div>
  `;
}

// Prefill Helper called inline
window.selectPrefilledRole = function(role) {
  document.querySelectorAll(".prefill-btn").forEach(btn => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");
  const creds = demoCredentials[role];
  if (creds) {
    document.getElementById("login-email").value = creds.email;
    document.getElementById("login-pass").value = creds.pass;
    showToast(`Prefilled credentials for ${creds.name}`);
  }
};

window.handleManualLogin = function(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const pass = document.getElementById("login-pass").value;
  const errorDiv = document.getElementById("login-error");

  // Auth matching
  let matchedRole = null;
  let matchedName = "";
  
  for (const [role, creds] of Object.entries(demoCredentials)) {
    if (creds.email === email && creds.pass === pass) {
      matchedRole = role;
      matchedName = creds.name;
      break;
    }
  }

  if (matchedRole) {
    updateAppState(state => {
      state.currentUser = {
        email,
        role: matchedRole,
        name: matchedName,
        abhaId: matchedRole === "patient" ? "ananya@abdm" : ""
      };
    });
    logSecurityEvent("User Login", `Authenticated as ${matchedName} (${matchedRole.toUpperCase()})`);
    showToast(`Welcome back, ${matchedName}!`);
    announceAccessibility(`Logged in successfully as ${matchedName}`);
    window.location.hash = "#/";
  } else {
    errorDiv.style.display = "block";
    logSecurityEvent("Login Failed", `Attempted email: ${email}`);
  }
};

// 2. REGISTER SCREEN
function renderRegister() {
  return `
    <div class="login-container">
      <div class="login-card">
        <h2>Register Health Account</h2>
        <p class="subtitle">Enroll in the ABDM-linked healthcare ecosystem instantly.</p>
        
        <form class="form-grid" onsubmit="handleRegistration(event)" style="gap: 12px;">
          <label>Full Name
            <input type="text" id="reg-name" required placeholder="Ananya Verma">
          </label>
          <label>Email Address
            <input type="email" id="reg-email" required placeholder="ananya@domain.com">
          </label>
          <label>Mobile Number
            <input type="tel" id="reg-mobile" required placeholder="9876542070">
          </label>
          <label>Create Password
            <input type="password" id="reg-pass" required placeholder="••••••••">
          </label>
          <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 8px;">Create Account & Login</button>
        </form>

        <p style="text-align: center; font-size: 12px; margin-top: 18px; color: var(--text-secondary);">
          Already registered? <a href="#/login" style="color: var(--accent-teal); font-weight: 700; text-decoration: none;">Login Here</a>
        </p>
      </div>
    </div>
  `;
}

window.handleRegistration = function(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const mobile = document.getElementById("reg-mobile").value;

  updateAppState(state => {
    state.currentUser = {
      email,
      role: "patient",
      name,
      abhaId: ""
    };
  });
  logSecurityEvent("User Registered", `Patient account created: ${name}, ${email}`);
  showToast("Account created successfully!");
  window.location.hash = "#/";
};

// 3. UNAUTHORIZED / PERMISSION SCREEN
function renderUnauthorized(route) {
  const state = getAppState();
  return `
    <div class="route-card unauthorized-card">
      ${icon("shield-alert")}
      <h2>Access Denied</h2>
      <p style="margin: 10px 0 20px; color: var(--text-secondary);">
        Your current role <strong>${state.currentUser.role.toUpperCase()}</strong> does not have permission to access the <strong>${route.toUpperCase()}</strong> dashboard.
      </p>
      <button class="join-btn" onclick="navigate('home')">Return to Safe Dashboard</button>
    </div>
  `;
}

// 4. HEALTH VITAL RECORDS
function renderHealth() {
  const state = getAppState();
  const bp = state.records.find(r => r.name.includes("ATM")) ? "118/78" : "120/80";
  const water = state.waterIntake || 1200;
  
  return `
    ${pageHeader("Health Dashboard", "Monitor your live vital telemetry and clinical signals.")}
    <section class="route-grid metrics-grid">
      <article class="metric-card">
        ${icon("activity")}
        <span>Blood Pressure</span>
        <strong>${bp}</strong>
        <small>mmHg - Stable</small>
      </article>
      <article class="metric-card">
        ${icon("heart-pulse")}
        <span>SpO2 (Pulse)</span>
        <strong>${state.spo2 || "98%"}</strong>
        <small>Normal range</small>
      </article>
      <article class="metric-card">
        ${icon("droplet")}
        <span>Blood Glucose</span>
        <strong>${state.glucose || "96"}</strong>
        <small>mg/dL - Fasting</small>
      </article>
      <article class="metric-card">
        ${icon("award")}
        <span>Wellness Score</span>
        <strong>84/100</strong>
        <small>Highly active</small>
      </article>
    </section>

    <!-- Animated ECG Segment -->
    <article class="route-card wide-card" style="margin-top: 16px; padding: 16px;">
      <div class="card-title-row" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          ${icon("heart-pulse")}
          <h3 style="margin:0;">Live Electrocardiogram (ECG) Signals</h3>
        </div>
        <span class="live-badge"><span class="live-dot"></span> Active Link</span>
      </div>
      <div class="hero-ecg" style="height: 60px; background: rgba(0,0,0,0.25); border-radius: 8px; margin-top: 12px; position: relative; overflow: hidden; border: 1px solid var(--border-color);">
        <svg viewBox="0 0 300 60" class="ecg-line" style="width: 100%; height: 100%;">
          <path d="M0,30 L40,30 L50,30 L55,15 L60,45 L65,10 L70,50 L75,30 L80,30 L120,30 L125,25 L130,35 L135,20 L140,40 L145,30 L150,30 L190,30 L195,20 L200,40 L205,15 L210,45 L215,30 L220,30 L260,30 L265,25 L270,35 L275,20 L280,40 L285,30 L300,30" fill="none" stroke="#00d4aa" stroke-width="1.5"/>
        </svg>
      </div>
    </article>

    <section class="route-grid two-col" style="margin-top: 16px;">
      <article class="route-card">
        <div class="card-title-row">${icon("clipboard-check")}<h3>Interactive Vitals Tracker</h3></div>
        <!-- Steps & Calories -->
        <div style="margin-top: 8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
            <span>Daily Steps Progress</span>
            <strong>6,420 / 10,000 steps</strong>
          </div>
          <div style="width:100%; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden;">
            <div style="width: 64.2%; height:100%; background:var(--accent-teal);"></div>
          </div>
        </div>
        
        <div style="margin-top: 12px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
            <span>Active Calories</span>
            <strong>420 / 600 kcal</strong>
          </div>
          <div style="width:100%; height:6px; background:var(--border-color); border-radius:3px; overflow:hidden;">
            <div style="width: 70%; height:100%; background:#f59e0b;"></div>
          </div>
        </div>
        
        <!-- Water Logger -->
        <div class="water-logger-container" style="display: flex; align-items: center; gap: 16px; margin-top: 16px; border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; background: var(--bg-secondary);">
          <div class="water-tank">
            <div class="water-wave" style="height: ${(water / 2500) * 100}%;"></div>
            <div class="water-text">${water}ml</div>
          </div>
          <div>
            <h4 style="font-size: 13px;">Hydration Logger</h4>
            <p style="font-size: 11px; color: var(--text-secondary); margin: 3px 0 8px;">Target: 2500ml (Vitals stabilization nudge)</p>
            <button class="prefill-btn" onclick="logWaterIntake(250)">+ 250ml Water</button>
          </div>
        </div>
      </article>

      <article class="route-card">
        <div class="card-title-row">${icon("brain-circuit")}<h3>AI Health Alerts & Nudges</h3></div>
        <ul style="padding-left: 20px; font-size: 12px; line-height: 1.8; color: var(--text-secondary);">
          <li>Vitals sync verified: 4/4 connected devices synced perfectly.</li>
          <li>Sleep regularity is stable for 7 consecutive days.</li>
          <li>Alert: Hydration lower than week median. Nudge sent.</li>
        </ul>
      </article>
    </section>

    <!-- Cardiovascular Risk Calculator -->
    <article class="route-card wide-card" style="margin-top: 16px;">
      <div class="card-title-row">${icon("heart-pulse")}<h3>Ayushman Bharat AI Cardiovascular Risk Calculator</h3></div>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
        Assess cardiovascular risk using simulated biometric variables and lifestyle indicators under ABDM clinical guidelines.
      </p>
      <div class="form-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
        <div>
          <label style="font-size: 11px; color: var(--text-secondary);">Age Group</label>
          <select id="calc-age" style="width:100%; padding: 8px; border-radius: 6px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:12px; margin-top:4px;">
            <option value="young">18 - 39 years</option>
            <option value="middle">40 - 59 years</option>
            <option value="senior">60+ years</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px; color: var(--text-secondary);">Systolic BP</label>
          <select id="calc-bp" style="width:100%; padding: 8px; border-radius: 6px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:12px; margin-top:4px;">
            <option value="normal">Normal (&lt; 120 mmHg)</option>
            <option value="pre">Prehypertension (120-139)</option>
            <option value="high">Hypertension (140+)</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px; color: var(--text-secondary);">Lifestyle / Smoker Status</label>
          <select id="calc-smoker" style="width:100%; padding: 8px; border-radius: 6px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:12px; margin-top:4px;">
            <option value="no">Non-smoker</option>
            <option value="yes">Active Smoker</option>
          </select>
        </div>
        <div>
          <label style="font-size: 11px; color: var(--text-secondary);">Diabetes Status</label>
          <select id="calc-diabetes" style="width:100%; padding: 8px; border-radius: 6px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-primary); font-size:12px; margin-top:4px;">
            <option value="no">Non-Diabetic</option>
            <option value="yes">Diabetic</option>
          </select>
        </div>
      </div>
      <div style="margin-top: 14px; display:flex; justify-content:space-between; align-items:center; gap: 12px; flex-wrap:wrap;">
        <button class="join-btn" onclick="calculateCVRisk()" style="margin:0;">Calculate Risk Score</button>
        <div id="risk-result" style="font-size: 13px; font-weight: 750; color: var(--accent-teal); display:none; background: rgba(0, 212, 170, 0.08); padding: 8px 12px; border-radius: 6px; border: 1px dashed var(--accent-teal);"></div>
      </div>
    </article>
  `;
}

// 5. APPOINTMENTS
function renderAppointments() {
  const state = getAppState();
  return `
    ${pageHeader("Appointments", "Manage consultations, waiting room slot queues, and tickets.", `<a href="#/telemedicine" class="primary-action">${icon("plus", "small-icon")} Book Consultation</a>`)}
    <section class="route-grid list-grid">
      ${state.appointments.map(item => `
        <article class="route-card">
          <div class="card-title-row">
            ${icon("calendar")}
            <div>
              <h3>${_t(item.title)}</h3>
              <p>${item.doctor}</p>
            </div>
          </div>
          <div class="pill-row" style="margin-top: 10px;">
            <span>${item.meta}</span>
            <span style="color: var(--accent-teal); font-weight: 800;">${item.status}</span>
            <span>Token: <strong>${item.token}</strong></span>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

// 6. RECORDS TABLE
function renderRecords() {
  const state = getAppState();
  return `
    ${pageHeader("Locker Records", "Securely linked ABDM electronic health records vault.")}
    <section class="record-table">
      <div class="table-row table-head">
        <span>Document Name</span>
        <span>Type</span>
        <span>Date Uploaded</span>
        <span>Verified Provider</span>
      </div>
      ${state.records.map(record => `
        <div class="table-row" style="border-bottom: 1px solid var(--border-color); padding: 12px 6px;">
          <span style="font-weight: 700;">${record.name}</span>
          <span>${record.type}</span>
          <span>${record.date}</span>
          <span style="color: var(--accent-teal);">${record.source}</span>
        </div>
      `).join("")}
    </section>
  `;
}

// 7. MORE DIRECTORY
function renderMore() {
  return `
    ${pageHeader("More Services", "Navigate compliant healthcare SaaS workflows.")}
    <section class="route-grid service-grid">
      <article class="route-card" data-route="abdm-services">
        ${icon("id-card")}
        <h3>ABDM Services</h3>
        <p>ABHA generation, Aadhaar verification, profiles linking sandboxes.</p>
      </article>
      <article class="route-card" data-route="connected-facilities">
        ${icon("building-2")}
        <h3>Connected Facilities</h3>
        <p>Register OPD tokens at linked smart hospitals instantly.</p>
      </article>
      <article class="route-card" data-route="security">
        ${icon("shield-check")}
        <h3>Security Audit Logs</h3>
        <p>Aadhaar-masked data logs, session variables, proxy controls.</p>
      </article>
      <article class="route-card" data-route="settings">
        ${icon("settings")}
        <h3>Preferences Settings</h3>
        <p>Themes, multi-lingual dynamic dictionaries, high contrast.</p>
      </article>
    </section>
  `;
}

// 8. TELEMEDICINE & Waiting Room
function renderTelemedicine() {
  const state = getAppState();
  return `
    ${pageHeader("Telemedicine", "Virtual patient queues, certificate verification, and appointment booking.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 22px;">
      <article class="route-card">
        <div class="card-title-row">${icon("clock")}<h3>Live Waiting Room Queues</h3></div>
        <p style="margin: 8px 0; color: var(--text-secondary); font-size: 13px;">
          Patients currently in digital OPD rooms: <strong>3 ahead</strong>. Estimated waiting: <strong>8 minutes</strong>.
        </p>
        <div class="wait-bar"><div class="wait-progress" style="width: 75%;"></div></div>
      </article>
    </div>

    <section class="route-grid doctor-grid">
      ${doctors.map((d, index) => `
        <article class="route-card" style="display: flex; gap: 16px; align-items: flex-start; flex-direction: row; flex-wrap: wrap;">
          <img src="${d.photo}" alt="${d.name}" style="width: 74px; height: 74px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-teal);">
          <div style="flex: 1; min-width: 200px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <h3 style="font-size: 15px;">${d.name}</h3>
              <span class="live-badge" style="padding: 2px 8px; font-size: 9px;">${d.badge}</span>
            </div>
            <p style="font-size: 11px; color: var(--accent-cyan); font-weight: 700; margin: 2px 0;">${d.degree} - ${d.experience}</p>
            <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">${d.description}</p>
            <div class="pill-row">
              <span>Fee: ${d.fee}</span>
              <span>Rating: ★ ${d.rating}</span>
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
              <button class="join-btn" style="margin-top: 0; padding: 6px 12px; font-size: 11px;" onclick="openDoctorCertificate(${index})">View NHA Credentials</button>
              <button class="primary-action" style="padding: 6px 12px; font-size: 11px;" onclick="openBookingModal(${index})">Book Slot</button>
            </div>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

// Telemedicine pre-call simulation screen
function renderTelemedicineRoom() {
  return `
    ${pageHeader("OPD Consultation Room", "Video/Audio telehealth gateway with diagnostic tools.")}
    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
      <div style="position: relative; width: 100%; height: 320px; background: #000; border-radius: 14px; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-color);">
        <img src="assets/doctors/dr-ayesha-ali.jpeg" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
        <div style="position: absolute; bottom: 12px; left: 12px; background: rgba(0,0,0,0.6); padding: 4px 8px; border-radius: 4px; font-size: 11px;">
          Dr. Ayesha Ali (Senior Homeopathy Consultant & Telehealth Lead)
        </div>
        <div style="position: absolute; top: 12px; right: 12px; width: 80px; height: 110px; background: #334155; border-radius: 8px; overflow: hidden; border: 2px solid var(--accent-teal);">
          <div style="width:100%; height:100%; display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--text-secondary);">You</div>
        </div>
      </div>
      <div style="display: flex; justify-content: center; gap: 14px; margin-top: 18px;">
        <button class="prefill-btn" style="border-radius: 50%; width: 50px; height: 50px; padding:0;" onclick="showToast('Mic Muted')">${icon("mic")}</button>
        <button class="prefill-btn" style="border-radius: 50%; width: 50px; height: 50px; padding:0;" onclick="showToast('Camera toggled')">${icon("video")}</button>
        <button class="join-btn" style="background: var(--danger); border-radius: 50%; width: 50px; height: 50px; padding:0; margin: 0;" onclick="navigate('appointments')">${icon("phone-off")}</button>
      </div>
    </div>
  `;
}

// 9. TELEMEDICINE ACTIONS & MODALS
window.openDoctorCertificate = function(idx) {
  const d = doctors[idx];
  const modalHTML = `
    <div class="modal-overlay" id="cert-modal" onclick="closeModal('cert-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Doctor Verification Certificate</h3>
          <button class="modal-close" onclick="closeModal('cert-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body">
          <div class="certificate-frame">
            <div class="certificate-watermark"></div>
            <div class="certificate-header">
              <h4>National Health Authority</h4>
              <p>Government of India - Ayushman Bharat Digital Mission</p>
            </div>
            <div class="certificate-title">Medical Practitioner Credentials License</div>
            <div class="certificate-recipient">
              This is to verify medical registry status for
              <strong>${d.name}</strong>
              Degree: <em>${d.degree}</em>
            </div>
            <div class="certificate-body">
              Successfully enrolled in the ABDM Healthcare Professionals Registry (HPR). Authorized to conduct interoperable telemedicine, sign e-prescriptions, and link patient health records digitally.
            </div>
            <div class="certificate-footer">
              <div>
                Registry ID: <strong>${d.certificateId}</strong><br>
                Linked Facility: <strong>${d.hfrId}</strong>
              </div>
              <div class="nha-seal">NHA<br>VERIFIED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
};

window.openBookingModal = function(idx) {
  const d = doctors[idx];
  const modalHTML = `
    <div class="modal-overlay" id="booking-modal" onclick="closeModal('booking-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Consultation Booking Details</h3>
          <button class="modal-close" onclick="closeModal('booking-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body">
          <form class="form-grid" onsubmit="confirmAppointmentSlot(event, ${idx})">
            <label>Selected Professional
              <input type="text" readonly value="${d.name} (${d.role})">
            </label>
            <label>Describe Active Symptoms
              <input type="text" id="symptoms-input" required placeholder="Fever, mild cough, body fatigue">
            </label>
            <label>Preferred Mode
              <select id="consult-mode">
                <option value="Video Call">Video Call Consultation (OPD Virtual)</option>
                <option value="Audio Call">Audio Call Consultation</option>
                <option value="Clinic OPD Visit">In-Clinic OPD Appointment</option>
              </select>
            </label>
            <label>Consultation Ticket Fee
              <input type="text" readonly value="${d.fee}">
            </label>
            <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 12px;">Confirm Booking & Generate OPD Token</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
};

window.confirmAppointmentSlot = function(e, idx) {
  e.preventDefault();
  const d = doctors[idx];
  const symptoms = document.getElementById("symptoms-input").value;
  const mode = document.getElementById("consult-mode").value;
  const tokenNum = `SETU-TKN-${Math.floor(100 + Math.random() * 900)}`;

  updateAppState(state => {
    state.appointments.unshift({
      id: `SETU-APP-${Math.floor(100 + Math.random() * 900)}`,
      title: `${mode} - ${symptoms}`,
      doctor: d.name,
      meta: "Scheduled for Today, 5:00 PM",
      status: "Confirmed",
      token: tokenNum
    });
    // Add toast notification
    state.notifications.unshift({
      id: Date.now(),
      title: "Appointment Booked",
      message: `OPD Queue Token ${tokenNum} created successfully for ${d.name}.`,
      time: "Just now",
      type: "appointment",
      unread: true
    });
  });

  closeModal("booking-modal");
  logSecurityEvent("OPD Booked", `Consultation booked with ${d.name} (Token: ${tokenNum})`);
  announceAccessibility(`Appointment booked with ${d.name}. Token number is ${tokenNum}`);

  // Visual Confirmation Screen Modal
  const successHTML = `
    <div class="modal-overlay" id="confirm-modal" onclick="closeModal('confirm-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-body" style="text-align: center; padding: 30px 20px;">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(0, 212, 170, 0.15); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 16px;">
            ${icon("check-circle", "logo-plus")}
          </div>
          <h2 style="font-size: 20px;">OPD Token Confirmed!</h2>
          <p style="color: var(--text-secondary); font-size: 13px; margin: 8px 0 20px;">
            Your token queue ticket has been sent to the clinic desk. Present the QR code on arrival or join the telehealth link directly.
          </p>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">OPD Queue Token</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-teal); margin: 4px 0;">${tokenNum}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Estimated queue time: <strong>14 mins</strong></div>
          </div>
          <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('confirm-modal'); navigate('appointments')">Go to My Tickets</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", successHTML);
  if (window.lucide) lucide.createIcons();
};

window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (m) m.remove();
};

// 10. QR SCANNER HUD & FLOW
// 10. QR SCANNER HUD & FLOW
function renderQrScanner() {
  return `
    ${pageHeader("ABDM QR Scanner", "Scan patient cards, healthcare facilities, and check-in tickets.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px; max-width: 580px; margin: 0 auto;">
      <div class="scanner-panel" style="margin-bottom: 0;">
        <div class="scanner-frame" id="qr-reader">
          <div class="scanner-camera-viewport">
            <div class="scanner-mask-overlay">
              <div class="scanner-viewport-brackets">
                <div class="bracket-tl"></div>
                <div class="bracket-tr"></div>
                <div class="bracket-bl"></div>
                <div class="bracket-br"></div>
                <div class="scan-beam-laser"></div>
                <div class="sonar-glow"></div>
              </div>
            </div>
            <!-- HUD overlays -->
            <div class="camera-grid-simulation"></div>
            <div class="camera-status-hud">Simulated Active ABDM Camera Feed</div>
            <!-- Flashlight & camera glass controls -->
            <div class="camera-glass-controls">
              <button class="control-btn" onclick="toggleSimulatedFlashlight()">${icon("zap", "small-icon")} Flashlight</button>
              <button class="control-btn" onclick="openSimulatedGallery()">${icon("image", "small-icon")} Gallery</button>
            </div>
          </div>
        </div>
        
        <div class="route-card" style="margin-top: 14px;">
          <h3>Simulated Scan Actions</h3>
          <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 14px;">
            Select a mock barcode payload below to simulate checking in at a physical hospital desk or syncing an ABHA profile card.
          </p>
          <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
            <button class="prefill-btn" style="text-align: left; align-items: flex-start; padding: 10px 14px;" onclick="simulateQrScan('abha')">
              <strong>${icon("id-card", "small-icon")} Scan Patient ABHA QR Card</strong>
              <small style="color: var(--text-muted); display: block;">Simulate loading Ananya Verma's health profile into operator view.</small>
            </button>
            <button class="prefill-btn" style="text-align: left; align-items: flex-start; padding: 10px 14px;" onclick="simulateQrScan('facility')">
              <strong>${icon("building-2", "small-icon")} Scan CityCare Hospital OPD QR</strong>
              <small style="color: var(--text-muted); display: block;">Simulate rapid desk queue-sharing check-in at physical OPD desk.</small>
            </button>
            <button class="prefill-btn" style="text-align: left; align-items: flex-start; padding: 10px 14px;" onclick="simulateQrScan('token')">
              <strong>${icon("ticket", "small-icon")} Scan Active Consultation Token QR</strong>
              <small style="color: var(--text-muted); display: block;">Simulate prescription lookup at smart pharmacy counters.</small>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.toggleSimulatedFlashlight = function() {
  const vp = document.querySelector(".scanner-camera-viewport");
  if (vp) {
    vp.classList.toggle("flashlight-on");
    const active = vp.classList.contains("flashlight-on");
    showToast(active ? "Simulated Flashlight Enabled" : "Simulated Flashlight Disabled");
  }
};

window.openSimulatedGallery = function() {
  showToast("Opening secure gallery container...");
  setTimeout(() => {
    const types = ["abha", "facility", "token"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    showToast(`Loaded secure image. Starting decrypter...`);
    simulateQrScan(randomType);
  }, 1200);
};

window.simulateQrScan = function(type) {
  const reader = document.getElementById("qr-reader");
  if (!reader) {
    executeScanModal(type);
    return;
  }
  
  // Show active multi-phase decrypter loading states overlay
  const progressOverlay = document.createElement("div");
  progressOverlay.className = "scan-progress-overlay";
  progressOverlay.innerHTML = `
    <div class="scan-progress-box">
      <div class="scan-spinner"></div>
      <div class="scan-status-text">Initializing sensor array...</div>
      <div class="scan-percentage">0%</div>
    </div>
  `;
  reader.appendChild(progressOverlay);
  
  const statusEl = progressOverlay.querySelector(".scan-status-text");
  const pctEl = progressOverlay.querySelector(".scan-percentage");
  
  let progress = 0;
  const timer = setInterval(() => {
    progress += 5;
    if (pctEl) pctEl.textContent = `${progress}%`;
    
    if (progress === 20) {
      if (statusEl) statusEl.textContent = "Locking focus & adjusting lens...";
    } else if (progress === 45) {
      if (statusEl) statusEl.textContent = "Aligning ABDM secure QR frame...";
    } else if (progress === 70) {
      if (statusEl) statusEl.textContent = "Decrypting secure ABDM payload...";
    } else if (progress === 90) {
      if (statusEl) statusEl.textContent = "Verifying digital signature at gateway...";
    }
    
    if (progress >= 100) {
      clearInterval(timer);
      progressOverlay.remove();
      executeScanModal(type);
    }
  }, 120);
};

window.executeScanModal = function(type) {
  let resultHTML = "";
  if (type === "abha") {
    resultHTML = `
      <div class="modal-overlay" id="qr-result-modal" onclick="closeModal('qr-result-modal')">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>ABHA Card Scanned</h3>
            <button class="modal-close" onclick="closeModal('qr-result-modal')">${icon("x")}</button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
              ${icon("user-check")}
            </div>
            <h4>Patient Profile Verified</h4>
            <p style="color: var(--text-secondary); font-size: 12px; margin: 6px 0 16px;">
              ABDM identity data extracted successfully from decrypted secure QR payload.
            </p>
            <table style="width: 100%; text-align: left; font-size: 12px; border-collapse: collapse; margin-bottom: 20px;">
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 8px 0; color: var(--text-muted);">Name</td><td style="font-weight: 700;">Ananya Verma</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 8px 0; color: var(--text-muted);">ABHA ID</td><td style="font-weight: 700; color: var(--accent-teal);">91-4207-8837-1928</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 8px 0; color: var(--text-muted);">Address</td><td style="font-weight: 700;">ananya@abdm</td></tr>
              <tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 8px 0; color: var(--text-muted);">Consent Type</td><td style="font-weight: 700; color: var(--success);">Purpose: Care Triage</td></tr>
            </table>
            <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('qr-result-modal'); showToast('Patient added to OPD Desk Triage')">Link Patient Record</button>
          </div>
        </div>
      </div>
    `;
  } else if (type === "facility") {
    const state = getAppState();
    const tokenNum = `SETU-OPD-${Math.floor(100 + Math.random() * 900)}`;
    resultHTML = `
      <div class="modal-overlay" id="qr-result-modal" onclick="closeModal('qr-result-modal')">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>Facility QR Scanned</h3>
            <button class="modal-close" onclick="closeModal('qr-result-modal')">${icon("x")}</button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 180, 216, 0.1); color: var(--accent-cyan); display: grid; place-items: center; margin: 0 auto 12px;">
              ${icon("building")}
            </div>
            <h4>Hospital Queue Handoff</h4>
            <p style="color: var(--text-secondary); font-size: 12px; margin: 6px 0 16px;">
              Do you consent to share your ABHA identity credentials with <strong>CityCare Hospital</strong>?
            </p>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-size: 11px; text-align: left; margin-bottom: 20px; line-height: 1.4;">
              • Shared data: Name, Age, Gender, ABHA address.<br>
              • Purpose: OPD counter check-in and queue token generation.
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="prefill-btn" style="flex: 1;" onclick="closeModal('qr-result-modal')">Reject</button>
              <button class="join-btn" style="flex: 2; margin:0;" onclick="handleFacilityScanCheckin('${tokenNum}')">Share & Check-In</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    resultHTML = `
      <div class="modal-overlay" id="qr-result-modal" onclick="closeModal('qr-result-modal')">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>Pharmacy Prescription Scanned</h3>
            <button class="modal-close" onclick="closeModal('qr-result-modal')">${icon("x")}</button>
          </div>
          <div class="modal-body" style="text-align: center;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
              ${icon("file-check")}
            </div>
            <h4>Smart Rx Token Validated</h4>
            <p style="color: var(--text-secondary); font-size: 12px; margin: 6px 0 16px;">
              Digital Prescription signed by <strong>Dr. Ayesha Ali</strong> is valid.
            </p>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-size: 12px; text-align: left; margin-bottom: 20px;">
              • Paracetamol 650mg - 10 tabs<br>
              • ORS sachets - 4 packs<br>
              <span style="color: var(--success); font-weight: 700; font-size: 10px;">✔ Digitally Signed by ABDM Gateway</span>
            </div>
            <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('qr-result-modal'); showToast('Prescription added to Pharmacy Cart')">Refill medicines</button>
          </div>
        </div>
      </div>
    `;
  }
  document.body.insertAdjacentHTML("beforeend", resultHTML);
  if (window.lucide) lucide.createIcons();
};

window.handleFacilityScanCheckin = function(tokenNum) {
  closeModal("qr-result-modal");
  updateAppState(state => {
    state.appointments.unshift({
      id: `SETU-FAC-${Math.floor(100 + Math.random() * 900)}`,
      title: "OPD Check-In Queue ticket",
      doctor: "CityCare Hospital - General Medicine",
      meta: "Present today at Counter 4",
      status: "Checked In",
      token: tokenNum
    });
    state.notifications.unshift({
      id: Date.now(),
      title: "OPD Ticket Created",
      message: `Successfully check-in at CityCare Hospital. Queue Token: ${tokenNum}`,
      time: "Just now",
      type: "abdm",
      unread: true
    });
  });
  logSecurityEvent("OPD Checked-In", `Facility Scan Share check-in ticket: ${tokenNum}`);
  announceAccessibility(`Check in successful. OPD queue ticket is ${tokenNum}`);
  
  // Custom screen showing confirmation
  const screenHTML = `
    <div class="modal-overlay" id="queue-success-modal" onclick="closeModal('queue-success-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-body" style="text-align: center; padding: 30px 20px;">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(34, 197, 94, 0.15); color: var(--success); display: grid; place-items: center; margin: 0 auto 16px;">
            ${icon("check-circle")}
          </div>
          <h2 style="font-size: 20px;">OPD Ticket Active</h2>
          <p style="color: var(--text-secondary); font-size: 13px; margin: 8px 0 20px;">
            Your patient details have been shared with the hospital. Direct check-in OPD ticket:
          </p>
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">OPD Queue Token</div>
            <div style="font-size: 26px; font-weight: 800; color: var(--accent-teal); margin: 4px 0;">${tokenNum}</div>
            <div style="font-size: 11px; color: var(--text-secondary);">Assigned OPD Desk Counter: <strong>Counter 4</strong></div>
          </div>
          <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('queue-success-modal'); navigate('appointments')">Go to Appointments</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", screenHTML);
  if (window.lucide) lucide.createIcons();
};

// 11. ABDM SERVICES (Milestone 1 Workflows)
function renderAbdmServices() {
  const state = getAppState();
  
  // Conditionally render card preview if generated
  const cardHTML = state.abhaCreated && state.abhaCard ? `
    <div class="route-card" style="margin-bottom: 22px;">
      <div class="card-title-row">${icon("id-card")}<h3>Your Digital ABHA ID Card</h3></div>
      <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
        Holographic verification badge active. Copy your ABHA number or download the certificate below.
      </p>
      
      <div class="abha-card-preview">
        <div class="abha-card-header">
          <span style="color: #ffffff; font-size: 11px;">ABHA SETU BRIDGE</span>
          <span>Ayushman Bharat</span>
        </div>
        <div class="abha-card-body">
          <div class="abha-card-avatar">
            <img src="assets/doctors/dr-ayesha-ali.jpeg" alt="Avatar">
          </div>
          <div class="abha-card-info">
            <strong>${state.abhaCard.name}</strong>
            <p>ABHA Address: <strong>${state.abhaCard.abhaAddress}</strong></p>
            <p class="abha-num">${state.abhaCard.abhaNumber}</p>
            <p>Gender: ${state.abhaCard.gender} | Mobile: ${state.abhaCard.mobile}</p>
          </div>
        </div>
        <div class="abha-card-footer">
          <span class="address">Govt of India Interoperable Health ID</span>
          <div class="abha-card-qr">
            <svg viewBox="0 0 24 24" style="width:100%; height:100%;">
              <path d="M2 2h6v6H2V2zm1 1v4h4V3H3zm11-1h6v6h-6V2zm1 1v4h4V3h-4zM2 14h6v6H2v-6zm1 1v4h4v-4H3zm11 0h3v3h-3v-3zm3 3h3v3h-3v-3zm0-3h3v3h-3v-3zm-3 3h-3v-3h3v3zm-3-3h-3v-3h3v3zm3 0v-3h3v3h-3zm-6-2h2v2H8v-2zm4 4h2v2h-2v-2z" fill="#000"/>
            </svg>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px; justify-content: center; margin-top: 14px;">
        <button class="join-btn" style="margin:0; padding: 6px 12px;" onclick="copyAbhaNumber('${state.abhaCard.abhaNumber}')">Copy ABHA Number</button>
        <button class="primary-action" style="padding: 6px 12px;" onclick="downloadAbhaCardPDF()">Download Card PDF</button>
      </div>
    </div>
  ` : `
    <div class="route-card" style="margin-bottom: 22px;">
      <div class="card-title-row">${icon("id-card")}<h3>No ABHA Card Generated</h3></div>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 14px;">
        Generate your Ayushman Bharat Health Account (ABHA) instantly to start linking electronic health locker records and telehealth certificates.
      </p>
      <button class="join-btn" style="margin: 0;" onclick="openAbhaCreationWizard()">${icon("plus", "small-icon")} Generate My ABHA</button>
    </div>
  `;

  return `
    ${pageHeader("ABDM Milestone 1", "Verify, search, and generate electronic patient health IDs.")}
    
    ${cardHTML}

    <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-top: 16px;">
      <article class="route-card">
        <div class="card-title-row">${icon("badge-check")}<h3>Verify Existing ABHA ID</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Retrieve verified public profile keys from Ayushman Bharat databases by specifying an active ABHA number or address.
        </p>
        <form class="form-grid" style="grid-template-columns: 1fr auto; gap: 8px; align-items: flex-end;" onsubmit="handleVerifyAbhaAddress(event)">
          <label>ABHA ID (Address or Number)
            <input type="text" id="verify-abha-input" required placeholder="e.g. ananya@abdm">
          </label>
          <button type="submit" class="join-btn" style="margin: 0; min-height: 42px;">Verify ID</button>
        </form>
      </article>

      <article class="route-card">
        <div class="card-title-row">${icon("search")}<h3>Mobile-Linked ABDM Search</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Search multi-linked families registered on the same mobile gateway.
        </p>
        <form class="form-grid" style="grid-template-columns: 1fr auto; gap: 8px; align-items: flex-end;" onsubmit="handleMobileRecordsSearch(event)">
          <label>Linked Mobile Number
            <input type="tel" id="verify-mobile-input" required placeholder="e.g. 9876542070">
          </label>
          <button type="submit" class="join-btn" style="margin: 0; min-height: 42px;">Fetch Records</button>
        </form>
      </article>
    </div>
  `;
}

// Interactive ABHA Creation Wizard Modal
window.openAbhaCreationWizard = function() {
  const wizardHTML = `
    <div class="modal-overlay" id="abha-wizard" onclick="closeModal('abha-wizard')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Generate ABHA Health Card</h3>
          <button class="modal-close" onclick="closeModal('abha-wizard')">${icon("x")}</button>
        </div>
        <div class="modal-body" id="abha-wizard-body">
          <form class="form-grid" onsubmit="triggerAbhaOtpRequest(event)">
            <p style="color: var(--text-secondary); font-size: 12px; line-height: 1.4; margin-bottom: 12px;">
              Enter your 12-digit Aadhaar card or mobile number. ABDM sandbox will request UIDAI identity certificate validation.
            </p>
            <label>Aadhaar Card (12-digit Number)
              <input type="text" id="abha-aadhaar-input" required maxlength="12" placeholder="e.g. 123456789012" oninput="this.value=this.value.replace(/\\D/g,'')">
            </label>
            <label>Linked Mobile Number
              <input type="tel" id="abha-mobile-input" required placeholder="e.g. 9876542070">
            </label>
            <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 12px;">Request OTP</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", wizardHTML);
  if (window.lucide) lucide.createIcons();
};

window.triggerAbhaOtpRequest = function(e) {
  e.preventDefault();
  const aadhaar = document.getElementById("abha-aadhaar-input").value;
  const mobile = document.getElementById("abha-mobile-input").value;
  
  if (aadhaar.length !== 12) {
    showToast("Aadhaar must be a 12-digit number.");
    return;
  }

  logSecurityEvent("ABHA OTP Request", `Requested credentials mapping for Aadhaar ${aadhaar} and mobile ${mobile}`);
  showToast("Mock OTP Sent: 123456");

  // Load OTP view with countdown resend timer
  const body = document.getElementById("abha-wizard-body");
  body.innerHTML = `
    <form class="form-grid" onsubmit="verifyAbhaGenerationOtp(event, '${aadhaar}', '${mobile}')">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
        ${icon("smartphone")}
      </div>
      <h4 style="text-align: center; margin-bottom: 8px;">Verify Aadhaar OTP</h4>
      <p style="color: var(--text-secondary); font-size: 11px; text-align: center; line-height: 1.4; margin-bottom: 12px;">
        A 6-digit mock OTP has been sent. Enter <strong>123456</strong> to complete authorization check.
      </p>
      <label>Enter 6-digit Verification OTP
        <input type="text" id="abha-otp-input" required maxlength="6" placeholder="••••••" oninput="this.value=this.value.replace(/\\D/g,'')" style="text-align: center; font-size: 18px; letter-spacing: 4px;">
      </label>
      <div id="otp-timer-lbl" style="text-align: center; font-size: 11px; color: var(--text-muted); margin: 6px 0;">
        Resend OTP in <strong id="otp-countdown">30</strong> seconds
      </div>
      <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 8px;">Verify OTP & Generate Profile</button>
    </form>
  `;
  if (window.lucide) lucide.createIcons();

  // Start Resend timer countdown
  let count = 30;
  const interval = setInterval(() => {
    count--;
    const num = document.getElementById("otp-countdown");
    if (!num) {
      clearInterval(interval);
      return;
    }
    num.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      document.getElementById("otp-timer-lbl").innerHTML = `
        Didn't receive code? <a href="#" style="color: var(--accent-teal); font-weight: 700; text-decoration: none;" onclick="resendMockOtp(event)">Resend Code</a>
      `;
    }
  }, 1000);
};

window.resendMockOtp = function(e) {
  e.preventDefault();
  showToast("Mock OTP Sent: 123456");
  announceAccessibility("Mock OTP has been resent successfully. Code is 123456");
};

window.verifyAbhaGenerationOtp = function(e, aadhaar, mobile) {
  e.preventDefault();
  const otp = document.getElementById("abha-otp-input").value;
  
  if (otp !== "123456") {
    showToast("Invalid verification OTP. Try entering 123456");
    logSecurityEvent("ABHA Verification Error", "Incorrect OTP entered");
    return;
  }

  // Load securing loader state
  const body = document.getElementById("abha-wizard-body");
  body.innerHTML = `
    <div style="text-align: center; padding: 24px;">
      <div class="live-dot" style="width: 24px; height: 24px; margin: 0 auto 16px; background: var(--accent-teal); animation: pulse 1s infinite;"></div>
      <h4>Securing Identity...</h4>
      <p style="color: var(--text-secondary); font-size: 12px; margin-top: 6px; line-height: 1.4;">
        UIDAI electronic handshake in progress. Creating holographic keys and registering HFR endpoints...
      </p>
    </div>
  `;

  setTimeout(() => {
    // Generate ABHA Card
    const state = getAppState();
    const abhaNum = "91-4207-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000);
    const abhaAddress = state.currentUser ? `${state.currentUser.name.toLowerCase().replace(/\s+/g, ".")}@abdm` : "ananya@abdm";
    
    updateAppState(st => {
      st.abhaCreated = true;
      st.abhaCard = {
        name: st.currentUser ? st.currentUser.name : "Ananya Verma",
        abhaNumber: abhaNum,
        abhaAddress: abhaAddress,
        gender: "Female",
        mobile: mobile,
        dob: "12-05-1992"
      };
      st.notifications.unshift({
        id: Date.now(),
        title: "ABHA Card Generated",
        message: `Your Ayushman Bharat Health Account ${abhaNum} has been registered.`,
        time: "Just now",
        type: "abdm",
        unread: true
      });
    });

    logSecurityEvent("ABHA Generated", `Card generated successfully for ${state.currentUser ? state.currentUser.name : "Ananya Verma"}. Address: ${abhaAddress}`);
    announceAccessibility("ABHA card generated successfully. Your ABHA ID address is " + abhaAddress);
    
    closeModal("abha-wizard");
    renderCurrentRoute(); // Refresh UI view
  }, 2200);
};

window.copyAbhaNumber = function(num) {
  navigator.clipboard.writeText(num);
  showToast("ABHA Number copied to clipboard!");
  announceAccessibility("ABHA number copied successfully");
};

window.downloadAbhaCardPDF = function() {
  showToast("Downloading ABHA card PDF...");
  const text = `AYUSHMAN BHARAT HEALTH ACCOUNT (ABHA) CARD\n--------------------------------------------\nName: Ananya Verma\nABHA Number: ${getAppState().abhaCard.abhaNumber}\nABHA Address: ${getAppState().abhaCard.abhaAddress}\nStatus: ABDM Sandbox Verified`;
  const blob = new Blob([text], {type: "text/plain;charset=utf-8"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "abha-card-setu.txt";
  link.click();
  logSecurityEvent("ABHA Download", "Downloaded electronic identity card certificate");
};

window.handleVerifyAbhaAddress = function(e) {
  e.preventDefault();
  const val = document.getElementById("verify-abha-input").value;
  
  showToast("Validating Ayushman gateway...");
  logSecurityEvent("ABHA Verification", `Requested verification for account query: ${val}`);

  setTimeout(() => {
    const successHTML = `
      <div class="modal-overlay" id="verify-success" onclick="closeModal('verify-success')">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-body" style="text-align: center; padding: 24px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0,212,170,0.1); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
              ${icon("check-circle")}
            </div>
            <h4>ABHA ID Verified</h4>
            <p style="color: var(--text-secondary); font-size: 12px; margin-top: 6px;">
              Ayushman Bharat database matched. Profile status is active.
            </p>
            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; text-align: left; font-size: 12px; margin: 16px 0;">
              • Profile Name: Ananya Verma<br>
              • Registered KYC: Aadhaar Handshake Verified<br>
              • Address: ${val}
            </div>
            <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('verify-success')">Complete Check</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", successHTML);
    if (window.lucide) lucide.createIcons();
    announceAccessibility("ABHA address verification completed. Public profile found.");
  }, 1200);
};

window.handleMobileRecordsSearch = function(e) {
  e.preventDefault();
  const val = document.getElementById("verify-mobile-input").value;
  showToast("Searching database records...");
  
  setTimeout(() => {
    const recordsHTML = `
      <div class="modal-overlay" id="mobile-records-modal" onclick="closeModal('mobile-records-modal')">
        <div class="modal-content" onclick="event.stopPropagation()">
          <div class="modal-header">
            <h3>Linked ABHA Accounts</h3>
            <button class="modal-close" onclick="closeModal('mobile-records-modal')">${icon("x")}</button>
          </div>
          <div class="modal-body">
            <p style="font-size: 12px; color: var(--text-secondary); margin-bottom: 12px;">
              The following profiles were matched with mobile gateway ending in <strong>4207</strong>.
            </p>
            <div style="display: grid; gap: 8px;">
              <div style="border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="display: block; font-size: 13px;">Ananya Verma</strong>
                  <span style="font-size: 11px; color: var(--accent-teal);">ananya@abdm (Verified)</span>
                </div>
                <button class="primary-action" style="padding: 4px 8px; font-size: 10px;" onclick="closeModal('mobile-records-modal'); showToast('Ananya profile loaded')">Select</button>
              </div>
              <div style="border: 1px solid var(--border-color); background: var(--bg-secondary); border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="display: block; font-size: 13px;">Rohan Verma (Spouse)</strong>
                  <span style="font-size: 11px; color: var(--text-muted);">rohan.verma@abdm</span>
                </div>
                <button class="primary-action" style="padding: 4px 8px; font-size: 10px;" onclick="closeModal('mobile-records-modal'); showToast('Rohan profile loaded')">Select</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", recordsHTML);
    if (window.lucide) lucide.createIcons();
    announceAccessibility("Search matched two accounts on this mobile gateway");
  }, 1200);
};

// 12. CONNECTED FACILITIES DIRECTORY
function renderConnectedFacilities() {
  return `
    ${pageHeader("Connected Facilities", "AYUSHMAN BHARAT Health Facility Registry (HFR) network.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 22px;">
      <article class="route-card">
        <div class="card-title-row">${icon("qr-code")}<h3>Scan Facility Check-In</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Arrived at a network facility? Click below to launch the scanner HUD and generate a rapid OPD Queue Ticket.
        </p>
        <button class="join-btn" style="margin:0;" onclick="navigate('qr-scanner')">Open ABDM QR Scanner</button>
      </article>
    </div>

    <section class="route-grid service-grid">
      ${connectedFacilities.map(f => `
        <article class="route-card" data-route="${f.route}">
          ${icon(f.icon)}
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
            <h3>${f.title}</h3>
            <span class="live-badge" style="padding: 2px 8px; font-size: 9px; background: rgba(0, 212, 170, 0.15); color: var(--accent-teal);">HFR Verified</span>
          </div>
          <p>${f.desc}</p>
          <a href="#/${f.route}" data-route="${f.route}" style="margin-top: 8px; display: inline-block;">Open Details</a>
        </article>
      `).join("")}
    </section>
  `;
}

// Connected Facility details subpage
function renderFacilityPage(route) {
  const f = connectedFacilities.find(fac => fac.route === route);
  if (!f) return renderUnauthorized(route);
  
  return `
    ${pageHeader(f.title, "AYUSHMAN BHARAT verified network clinic.")}
    <section class="route-grid metrics-grid">
      <article class="metric-card">
        ${icon("building")}
        <span>HFR Register ID</span>
        <strong>${f.hfrId}</strong>
        <small>National Registry Valid</small>
      </article>
      <article class="metric-card">
        ${icon("heart")}
        <span>Connected Pipeline</span>
        <strong>ABDM V3 Ready</strong>
        <small>Encrypted FHIR logs</small>
      </article>
      <article class="metric-card">
        ${icon("users")}
        <span>OPD Desk queues</span>
        <strong>Active</strong>
        <small>Generate instant ticket</small>
      </article>
    </section>

    <section class="route-grid two-col" style="margin-top: 16px;">
      <article class="route-card">
        <div class="card-title-row">${icon("clipboard-check")}<h3>Connected Services</h3></div>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
          This facility is integrated with the Ayushman Bharat Digital Mission. You can check in automatically, retrieve prescriptions digitally in your locker, and verify laboratory diagnostics:
          <br><br>
          <strong>Specialities:</strong> ${f.services}
        </p>
      </article>
      <article class="route-card">
        <div class="card-title-row">${icon("qr-code")}<h3>Scan & Share Check-In</h3></div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
          Present your ABHA card details instantly via scanning or pre-register OPD tickets digitally to bypass physical reception desks.
        </p>
        <button class="join-btn" style="margin: 0;" onclick="simulateQrScan('facility')">Share Profile & Check In</button>
      </article>
    </section>
  `;
}

// 13. SECURITY AUDIT LOGS
function renderSecurity() {
  const state = getAppState();
  return `
    ${pageHeader("Security Logs", "Masked compliance logs, token parameters, and JWT session structures.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 22px;">
      <article class="route-card">
        <div class="card-title-row">${icon("key")}<h3>Session Token Representation (JWT)</h3></div>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
          Healthcare portal sessions are protected via cryptographically signed JWT tokens holding active role permissions.
        </p>
        <div style="font-family: monospace; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; font-size: 10px; word-break: break-all; color: var(--text-secondary);">
          <span style="color: var(--danger);">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.<span style="color: var(--accent-teal);">eyJlbWFpbCI6InBhdGllbnRAYWJoYXNldHUuY29tIiwicm9sZSI6InBhdGllbnQiLCJuYW1lIjoiQW5hbnlhIFZlcm1hIiwiaWF0IjoxNzg0ODI5MjM4LCJleHAiOjE3ODQ4MzI4Mzh9</span>.<span style="color: var(--accent-cyan);">9S2d_12KdaUis92Jdklso01AdksoW921s</span>
        </div>
      </article>
    </div>

    <section class="route-card wide-card">
      <div class="card-title-row">${icon("file-text")}<h3>Secure Security Logs (Aadhaar Masked)</h3></div>
      <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 14px;">
        All personal identifiers (vitals, Aadhaar, OTPs) are cryptographically hashed and redacted prior to system audit persistence.
      </p>
      <div style="display: grid; gap: 8px;">
        ${state.securityLogs.map(l => `
          <div style="border-bottom: 1px solid var(--border-color); padding: 8px 0; display: flex; justify-content: space-between; gap: 12px; font-size: 11px;">
            <div>
              <strong style="color: var(--accent-teal);">${l.event}</strong> - 
              <span style="color: var(--text-secondary);">${l.details}</span>
            </div>
            <span style="color: var(--text-muted); flex-shrink: 0;">${l.time}</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

// 14. PREFERENCES SETTINGS
function renderSettings() {
  const state = getAppState();
  return `
    ${pageHeader("Settings", "Manage themes, translation languages, and access controls.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
      <article class="route-card">
        <div class="card-title-row">${icon("palette")}<h3>Visual Color Themes</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Choose an app theme. Your color variables preference is stored locally.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          <button class="prefill-btn ${state.theme === "dark-teal" ? "selected-card" : ""}" onclick="setGlobalTheme('dark-teal')">
            <span style="color: #00d4aa;">●</span> Dark Teal (Default)
          </button>
          <button class="prefill-btn ${state.theme === "slate-dark" ? "selected-card" : ""}" onclick="setGlobalTheme('slate-dark')">
            <span style="color: #38bdf8;">●</span> Slate Dark
          </button>
          <button class="prefill-btn ${state.theme === "ocean-blue" ? "selected-card" : ""}" onclick="setGlobalTheme('ocean-blue')">
            <span style="color: #0077b6;">●</span> Ocean Blue
          </button>
          <button class="prefill-btn ${state.theme === "emerald-light" ? "selected-card" : ""}" onclick="setGlobalTheme('emerald-light')">
            <span style="color: #059669;">●</span> Emerald Light
          </button>
        </div>
      </article>

      <article class="route-card">
        <div class="card-title-row">${icon("languages")}<h3>Language Preferences</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Translate the complete dashboard, forms, and clinical workflows instantly.
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px;">
          <button class="prefill-btn ${state.language === "EN" ? "selected-card" : ""}" onclick="setGlobalLanguage('EN')">English (EN)</button>
          <button class="prefill-btn ${state.language === "HI" ? "selected-card" : ""}" onclick="setGlobalLanguage('HI')">हिन्दी (HI)</button>
          <button class="prefill-btn ${state.language === "TA" ? "selected-card" : ""}" onclick="setGlobalLanguage('TA')">தமிழ் (TA)</button>
          <button class="prefill-btn ${state.language === "TE" ? "selected-card" : ""}" onclick="setGlobalLanguage('TE')">తెలుగు (TE)</button>
          <button class="prefill-btn ${state.language === "BN" ? "selected-card" : ""}" onclick="setGlobalLanguage('BN')">বাংলা (BN)</button>
          <button class="prefill-btn ${state.language === "MR" ? "selected-card" : ""}" onclick="setGlobalLanguage('MR')">मराठी (MR)</button>
          <button class="prefill-btn ${state.language === "GU" ? "selected-card" : ""}" onclick="setGlobalLanguage('GU')">ગુજરાતી (GU)</button>
          <button class="prefill-btn ${state.language === "KN" ? "selected-card" : ""}" onclick="setGlobalLanguage('KN')">ಕನ್ನಡ (KN)</button>
        </div>
      </article>

      <article class="route-card">
        <div class="card-title-row">${icon("accessibility")}<h3>Accessibility Configurations</h3></div>
        <p style="color: var(--text-secondary); font-size: 12px; margin-bottom: 12px;">
          Enable accessibility helpers for visual screen readers or contrast preferences.
        </p>
        <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
          <label style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <span>High Contrast Layout</span>
            <input type="checkbox" id="check-highcontrast" ${state.accessibility.highContrast ? "checked" : ""} onchange="toggleAccessSetting('highContrast')">
          </label>
          <label style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <span>Enlarge Relative Typography Font</span>
            <input type="checkbox" id="check-largefont" ${state.accessibility.largeFont ? "checked" : ""} onchange="toggleAccessSetting('largeFont')">
          </label>
          <label style="display: flex; align-items: center; justify-content: space-between;">
            <span>Simulate Screen Reader Voice Announcements</span>
            <input type="checkbox" id="check-screenreader" ${state.accessibility.screenReader ? "checked" : ""} onchange="toggleAccessSetting('screenReader')">
          </label>
        </div>
      </article>
    </div>
  `;
}

window.setGlobalTheme = function(theme) {
  updateAppState(state => {
    state.theme = theme;
  });
  logSecurityEvent("Theme Changed", `Switched visual layout theme to ${theme}`);
  showToast(`Switched theme to ${theme.replace("-", " ").toUpperCase()}`);
  renderCurrentRoute();
};

window.cycleTheme = function() {
  const themes = ["dark-teal", "slate-dark", "ocean-blue", "emerald-light"];
  const state = getAppState();
  const currentIdx = themes.indexOf(state.theme);
  const nextIdx = (currentIdx + 1) % themes.length;
  const nextTheme = themes[nextIdx];
  setGlobalTheme(nextTheme);
};

window.setGlobalLanguage = function(lang) {
  updateAppState(state => {
    state.language = lang;
  });
  logSecurityEvent("Language Switched", `Changed dynamic dictionary mapping to ${lang}`);
  showToast(`Language set to ${lang}`);
  renderCurrentRoute();
};

window.toggleAccessSetting = function(key) {
  updateAppState(state => {
    state.accessibility[key] = !state.accessibility[key];
  });
  logSecurityEvent("Access Configuration", `Toggled accessibility parameter: ${key}`);
  showToast("Accessibility settings updated.");
  renderCurrentRoute();
};

// 15. PROFILE MANAGEMENT
function renderProfile() {
  const state = getAppState();
  return `
    ${pageHeader("My Account Profile", "Manage your personal profile and linked health identity.")}
    
    <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
      <section class="profile-panel" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 18px; border-radius: 12px; display: flex; gap: 16px; align-items: center; flex-wrap: wrap;">
        <img src="assets/doctors/dr-ayesha-ali.jpeg" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid var(--accent-teal); object-fit: cover;">
        <div>
          <h3 style="font-size: 18px; font-weight: 800;">${state.currentUser ? state.currentUser.name : "Ananya Verma"}</h3>
          <p style="color: var(--accent-cyan); font-weight: 700; font-size: 13px;">Role: ${state.currentUser ? state.currentUser.role.toUpperCase() : "PATIENT"}</p>
          <p style="color: var(--text-secondary); font-size: 12px;">Linked ABHA ID: ${state.abhaCreated && state.abhaCard ? state.abhaCard.abhaAddress : "None Linked"}</p>
        </div>
      </section>

      <article class="route-card">
        <div class="card-title-row">${icon("user")}<h3>Personal Details Form</h3></div>
        <form class="form-grid" onsubmit="saveProfileDetails(event)" style="gap: 12px;">
          <label>Full Patient Name
            <input type="text" id="prof-name" required value="${state.currentUser ? state.currentUser.name : "Ananya Verma"}">
          </label>
          <label>Contact Mobile Number
            <input type="tel" id="prof-mobile" required value="${state.abhaCard ? state.abhaCard.mobile : "9876542070"}">
          </label>
          <label>Emergency Kin Contact (Mobile)
            <input type="tel" id="prof-kin" value="9928374207">
          </label>
          <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 8px;">Save Profile Sync</button>
        </form>
      </article>

      <button class="join-btn" style="background: var(--danger); width: 100%; min-height: 44px; margin: 8px 0;" onclick="handlePlatformLogout()">Sign Out and Clear Session</button>
    </div>
  `;
}

window.saveProfileDetails = function(e) {
  e.preventDefault();
  const name = document.getElementById("prof-name").value;
  const mobile = document.getElementById("prof-mobile").value;

  updateAppState(state => {
    if (state.currentUser) state.currentUser.name = name;
    if (state.abhaCard) {
      state.abhaCard.name = name;
      state.abhaCard.mobile = mobile;
    }
  });

  logSecurityEvent("Profile Update", `Synced profile changes for ${name}`);
  showToast("Profile details updated successfully!");
  announceAccessibility("Your profile name has been updated to " + name);
  renderCurrentRoute();
};

window.handlePlatformLogout = function() {
  updateAppState(state => {
    state.currentUser = null;
  });
  logSecurityEvent("Logout", "Session successfully terminated by user");
  showToast("Logged out successfully");
  window.location.hash = "#/login";
};

// 16. NOTIFICATIONS CENTER
function renderNotifications() {
  const state = getAppState();
  return `
    ${pageHeader("Notifications Center", "Your security updates, tickets triggers, and health alerts.")}
    <div style="display: grid; gap: 10px;">
      ${state.notifications.map(n => `
        <div style="border: 1px solid var(--border-color); background: var(--bg-card); padding: 14px; border-radius: 10px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
          <div>
            <h4 style="font-size: 14px; color: var(--accent-teal);">${_t(n.title)}</h4>
            <p style="color: var(--text-secondary); font-size: 12px; margin: 4px 0;">${_t(n.message)}</p>
            <small style="color: var(--text-muted); font-size: 10px;">${n.time}</small>
          </div>
          <button class="prefill-btn" style="padding: 4px; border-radius: 4px;" onclick="dismissNotificationLog(${n.id})">${icon("x", "small-icon")}</button>
        </div>
      `).join("")}
      ${state.notifications.length === 0 ? `<div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">No alerts. Clear check-in triggers!</div>` : ""}
    </div>
  `;
}

window.dismissNotificationLog = function(id) {
  updateAppState(state => {
    state.notifications = state.notifications.filter(n => n.id !== id);
  });
  showToast("Notification cleared");
  renderCurrentRoute();
};

// Global outside click handler for notifications
window.handleNotificationOutsideClick = function(e) {
  const drawer = document.getElementById("n-drawer");
  const notificationBell = document.querySelector(".notification");
  if (drawer && !drawer.contains(e.target) && notificationBell && !notificationBell.contains(e.target)) {
    if (e.target.closest(".modal-overlay") || e.target.closest(".global-search") || e.target.closest(".prefill-btn")) {
      return;
    }
    toggleNotificationDrawer(true);
  }
};

// Notification slide drawer toggle
window.toggleNotificationDrawer = function(forceClose = false) {
  const drawer = document.getElementById("n-drawer");
  if (drawer || forceClose) {
    if (drawer) drawer.remove();
    document.removeEventListener("click", window.handleNotificationOutsideClick);
    document.removeEventListener("touchstart", window.handleNotificationOutsideClick);
    return;
  }

  const state = getAppState();
  // Clear unread tags
  updateAppState(st => {
    st.notifications.forEach(n => n.unread = false);
  });
  updateHeaderUI();

  const drawerHTML = `
    <div class="notification-drawer" id="n-drawer" role="dialog" aria-label="Notifications Alerts Tray">
      <div class="notification-drawer-header">
        <h3>Alerts Tray</h3>
        <button class="modal-close" onclick="toggleNotificationDrawer(true)" aria-label="Close notifications">${icon("x")}</button>
      </div>
      <div class="notification-list">
        ${state.notifications.map(n => `
          <div class="notification-item ${n.unread ? "unread" : ""}">
            <div class="notification-item-icon">${icon(n.type === "security" ? "shield" : "bell")}</div>
            <div class="notification-item-content">
              <strong>${_t(n.title)}</strong>
              <span>${_t(n.message)}</span>
              <small>${n.time}</small>
            </div>
          </div>
        `).join("")}
        ${state.notifications.length === 0 ? `<div style="text-align: center; color: var(--text-muted); padding: 24px; font-size: 12px;">Tray is empty</div>` : ""}
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", drawerHTML);
  if (window.lucide) lucide.createIcons();

  // Use bubbling phase listener to prevent blocking and touch issues on mobile viewports
  setTimeout(() => {
    document.addEventListener("click", window.handleNotificationOutsideClick);
    document.addEventListener("touchstart", window.handleNotificationOutsideClick);
  }, 50);
};

// 17. SUBPAGES & VITALS SCREEN RENDERERS
function renderHealthAtm() {
  return `
    ${pageHeader("Health ATM", "Simulated screening ATM vital diagnostic kiosks.")}
    <div style="display: grid; grid-template-columns: 1fr; gap: 14px;">
      <article class="route-card">
        <div class="card-title-row">${icon("map-pin")}<h3>Find Kiosk Nearby</h3></div>
        <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 12px;">
          The closest ABHA-Setu enabled screening kiosk is located at: <strong>Sector 21 Metro, New Delhi (1.2 km away)</strong>.
          <br>Estimated Queue: <strong>2 people waiting (approx 6 mins wait)</strong>.
        </p>
        <button class="join-btn" style="margin: 0;" onclick="simulateKioskSync()">Simulate Instant ATM Screening Sync</button>
      </article>
    </div>
  `;
}

window.simulateKioskSync = function() {
  showToast("Connecting to screening kiosk...");
  setTimeout(() => {
    updateAppState(state => {
      // Add a vital report
      state.records.unshift({
        name: "ATM Screening - BP & Glucose Check",
        type: "Vitals",
        date: new Date().toLocaleDateString("en-US", {month: 'short', day: '2-digit', year: 'numeric'}),
        source: "Sector 21 ATM Kiosk"
      });
      state.notifications.unshift({
        id: Date.now(),
        title: "Kiosk vitals synced",
        message: "Your vitals from Sector 21 ATM synced to Locker.",
        time: "Just now",
        type: "abdm",
        unread: true
      });
    });
    logSecurityEvent("Kiosk Sync", "Synced vital records parameters from diagnostic ATM");
    showToast("Vitals synced to Digital Health Locker successfully!");
    announceAccessibility("ATM screening synced successfully. BP is 118/78");
    navigate("health");
  }, 1600);
};

function renderDigitalLocker() {
  return `
    ${pageHeader("Digital Health Locker", "Interoperable electronic health records vault.")}
    <div style="display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 22px;">
      <article class="route-card" style="text-align: center; padding: 24px;">
        <div style="width: 48px; height: 48px; border-radius: 50%; background: rgba(0, 212, 170, 0.1); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
          ${icon("folder-lock")}
        </div>
        <h4>Linked Electronic Records Locker</h4>
        <p style="color: var(--text-secondary); font-size: 12px; margin-top: 6px; line-height: 1.5;">
          Upload digital copies, prescriptions, NHA health certificates or insurance files securely under DPDP guidelines.
        </p>
        <button class="join-btn" onclick="triggerFileUploadSim()">Upload Record File</button>
      </article>
    </div>
    ${renderRecords()}
  `;
}

window.triggerFileUploadSim = function() {
  showToast("Opening secure record locker upload...");
  setTimeout(() => {
    updateAppState(state => {
      state.records.unshift({
        name: "Digital Health Policy Card.pdf",
        type: "Insurance",
        date: new Date().toLocaleDateString("en-US", {month: 'short', day: '2-digit', year: 'numeric'}),
        source: "Care Shield Plus Gold"
      });
    });
    logSecurityEvent("File Upload", "Uploaded Digital Health Policy Card.pdf securely");
    showToast("Insurance Policy Card uploaded successfully.");
    renderCurrentRoute();
  }, 1200);
};

function renderLiveDashboard() { return renderHealth(); }
function renderDevices() {
  const state = getAppState();
  const bp = state.bp || "120/80 mmHg";
  const spo2 = state.spo2 || "98%";
  const glucose = state.glucose || "96 mg/dL";
  const heartRate = state.heartRate || "72 bpm";
  
  return `
    ${pageHeader("Devices Sync", "Manage Bluetooth and Wi-Fi diagnostics paired for real-time telemetry.", "")}

    <div style="display:grid; grid-template-columns: 1fr; gap: 16px;">
      <section style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <!-- Pairing controller -->
        <article class="route-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="card-title-row">${icon("smartphone")}<h3>Gateway Pairing Controller</h3></div>
            <p style="color:var(--text-secondary); font-size:12px; margin:8px 0 14px; line-height:1.5;">
              Sync active parameters with home pulse oximeters, smart pressure cuffs or diabetic patches.
            </p>
            
            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:12px;">
              <div style="font-size:11px; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px;">Connected Biometric Telemetry</div>
              <ul style="font-size:12px; padding-left:18px; color:var(--text-secondary); line-height:1.8; display:flex; flex-direction:column; gap:4px;">
                <li>Pulse Oximeter - <span style="color:var(--accent-teal); font-weight:700;">Paired (SpO2: ${spo2})</span></li>
                <li>Systolic Cuff - <span style="color:var(--accent-teal); font-weight:700;">Paired (BP: ${bp})</span></li>
                <li>GlucoSync patch - <span style="color:var(--accent-teal); font-weight:700;">Paired (Sugar: ${glucose})</span></li>
                <li>Smartwatch ECG - <span style="color:var(--accent-teal); font-weight:700;">Paired (Heart: ${heartRate})</span></li>
              </ul>
            </div>
          </div>
          
          <button class="join-btn" onclick="forceDeviceSync()" style="margin:0; width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
            ${icon("refresh-cw", "small-icon pulse-sync-icon")} Pair & Force Sync Telemetry
          </button>
        </article>

        <!-- Device Sync Alerts -->
        <article class="route-card" style="display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="card-title-row">${icon("brain-circuit")}<h3>AI Clinical Sync Alerts</h3></div>
            <p style="color:var(--text-secondary); font-size:12px; margin:6px 0 12px; line-height:1.5;">
              Biometric sensors analyze clinical deviations instantly. Fluctuation of parameters by ±3% simulates direct medical signals.
            </p>
            <ul style="padding-left:18px; font-size:11px; color:var(--text-secondary); line-height:1.8;">
              <li>SpO2 levels drop below 95% triggers a high priority clinical exception request.</li>
              <li>Glucose and pressure indices sync directly with ABDM HFR database profiles.</li>
              <li>Daily logs record paired sensor model variables automatically.</li>
            </ul>
          </div>
          <div style="background:rgba(245, 158, 11, 0.05); border:1px solid rgba(245, 158, 11, 0.2); border-radius:8px; padding:10px; font-size:11px; margin-top:10px;">
            <strong style="color:#f59e0b;">Pairing Alert:</strong> Ensure Bluetooth / Wi-Fi is active on diagnostic sensors.
          </div>
        </article>
      </section>
    </div>
  `;
}

window.forceDeviceSync = function() {
  const modalHTML = `
    <div class="modal-overlay" id="sync-modal">
      <div class="modal-content" style="max-width: 400px; text-align: center; padding: 30px;">
        <div class="pulse-sync-icon" style="color: var(--accent-teal); font-size: 40px; margin-bottom: 16px; display: inline-block;">
          ${icon("smartphone")}
        </div>
        <h3>Smart Device Telemetry Pairing</h3>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 8px 0 16px;">
          Communicating with nearby smartwatch, oximeter and glucose cuff monitors...
        </p>
        <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin-bottom: 12px;">
          <div id="sync-bar" style="width: 0%; height: 100%; background: var(--accent-teal); transition: width 0.1s linear;"></div>
        </div>
        <div id="sync-status" style="font-size: 13px; font-weight: 750; color: var(--accent-teal);">Searching Bluetooth signal...</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
  
  const syncBar = document.getElementById("sync-bar");
  const syncStatus = document.getElementById("sync-status");
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    if (syncBar) syncBar.style.width = `${progress}%`;
    
    if (progress === 20) {
      if (syncStatus) syncStatus.textContent = "Connecting to Oximeter Pulse-Link...";
    } else if (progress === 40) {
      if (syncStatus) syncStatus.textContent = "Reading BP Cuff sensor parameters...";
    } else if (progress === 70) {
      if (syncStatus) syncStatus.textContent = "Syncing GlucoSync patch telemetry...";
    } else if (progress === 90) {
      if (syncStatus) syncStatus.textContent = "Writing parameters to ABDM Health Locker...";
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      closeModal("sync-modal");
      completeDeviceSync();
    }
  }, 60);
};

window.completeDeviceSync = function() {
  updateAppState(state => {
    const spo2Val = Math.round(94 + Math.random() * 6);
    const glucoseVal = Math.round(90 + Math.random() * 15);
    const bpSystolic = Math.round(115 + Math.random() * 12);
    const bpDiastolic = Math.round(75 + Math.random() * 8);
    
    state.spo2 = `${spo2Val}%`;
    state.glucose = `${glucoseVal}`;
    state.bp = `${bpSystolic}/${bpDiastolic}`;
    state.heartRate = `${Math.round(68 + Math.random() * 8)} bpm`;
    
    if (spo2Val < 95) {
      state.notifications.unshift({
        id: Date.now(),
        title: "CLINICAL ALERT: Low Oxygen Saturation",
        message: `High Priority: Paired pulse oximeter synced SpO2 of ${spo2Val}% which is below safe threshold. Please consult Dr. Ayesha Ali.`,
        time: "Just now",
        type: "security",
        unread: true
      });
    } else {
      state.notifications.unshift({
        id: Date.now(),
        title: "Telemetry Sync Successful",
        message: `Smartwatch, BP Monitor and Glucose sensors synced. SpO2: ${spo2Val}%, BP: ${bpSystolic}/${bpDiastolic} mmHg.`,
        time: "Just now",
        type: "abdm",
        unread: true
      });
    }
  });
  
  logSecurityEvent("Device Telemetry Sync", "Completed Bluetooth smartwatch and oximeter paired force-sync");
  showToast("Vitals telemetry synced successfully!");
  announceAccessibility("Biometric vitals sync successfully complete.");
  
  renderCurrentRoute();
};

window.logWaterIntake = function(amount) {
  updateAppState(state => {
    const current = state.waterIntake || 1200;
    state.waterIntake = current + amount;
    state.spo2 = "98%";
    state.bp = "120/80";
  });
  showToast(`Logged ${amount}ml of water intake! Vitals stabilized.`);
  announceAccessibility(`Logged ${amount}ml of water.`);
  renderCurrentRoute();
};

window.calculateCVRisk = function() {
  const age = document.getElementById("calc-age").value;
  const bp = document.getElementById("calc-bp").value;
  const smoker = document.getElementById("calc-smoker").value;
  const diabetes = document.getElementById("calc-diabetes").value;
  const resultDiv = document.getElementById("risk-result");
  
  let riskScore = 5;
  if (age === "middle") riskScore += 10;
  else if (age === "senior") riskScore += 25;
  
  if (bp === "pre") riskScore += 8;
  else if (bp === "high") riskScore += 18;
  
  if (smoker === "yes") riskScore += 15;
  if (diabetes === "yes") riskScore += 12;
  
  if (resultDiv) {
    resultDiv.style.display = "block";
    let riskText = "Low Risk";
    let riskColor = "var(--accent-teal)";
    if (riskScore > 35) {
      riskText = "HIGH RISK (Consult Specialist)";
      riskColor = "var(--danger)";
    } else if (riskScore > 15) {
      riskText = "Moderate Risk (Regular Checkups)";
      riskColor = "#f59e0b";
    }
    resultDiv.innerHTML = `Cardiovascular Risk Score: <span style="color:${riskColor};">${riskScore}% - ${riskText}</span>`;
  }
  
  logSecurityEvent("Risk Calculation", `Calculated Ayushman Bharat Cardiovascular risk percentage as ${riskScore}%`);
  announceAccessibility(`Risk score calculated successfully as ${riskScore} percent.`);
};

// --- Medicines Lists and Helpers ---
const medicinesList = [
  { id: "med-1", name: "Paracetamol 650mg", category: "OTC", price: 40, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=300", desc: "For relief of fever and mild to moderate pain.", dosage: "Take 1 tablet every 4-6 hours as needed." },
  { id: "med-2", name: "Amoxicillin 500mg", category: "Prescription", price: 120, image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?auto=format&fit=crop&q=80&w=300", desc: "Broad-spectrum antibiotic for bacterial infections.", dosage: "Take 1 tablet 3 times a day for 7 days." },
  { id: "med-3", name: "Cetirizine 10mg", category: "OTC", price: 30, image: "https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&q=80&w=300", desc: "Antihistamine for allergy relief, runny nose, and sneezing.", dosage: "Take 1 tablet daily at bedtime." },
  { id: "med-4", name: "Metformin 500mg", category: "Prescription", price: 90, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&q=80&w=300", desc: "Oral diabetes medicine that helps control blood sugar levels.", dosage: "Take 1 tablet twice daily with meals." },
  { id: "med-5", name: "Atorvastatin 10mg", category: "Prescription", price: 250, image: "https://images.unsplash.com/photo-1607619056574-7b8f304b3b89?auto=format&fit=crop&q=80&w=300", desc: "Lowers high cholesterol and triglyceride levels.", dosage: "Take 1 tablet once daily in the evening." },
  { id: "med-6", name: "Ibuprofen 400mg", category: "OTC", price: 50, image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=300", desc: "Nonsteroidal anti-inflammatory drug (NSAID) for pain and swelling.", dosage: "Take 1 tablet every 6 hours as needed." }
];

window.addToCart = function(medId) {
  updateAppState(state => {
    if (!state.cart) state.cart = [];
    const item = state.cart.find(i => i.id === medId);
    if (item) {
      item.quantity += 1;
    } else {
      const med = medicinesList.find(m => m.id === medId);
      state.cart.push({ ...med, quantity: 1 });
    }
  });
  showToast(_t("Medicine added to cart"));
  renderCurrentRoute();
};

window.adjustCartQty = function(medId, delta) {
  updateAppState(state => {
    if (!state.cart) return;
    const item = state.cart.find(i => i.id === medId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        state.cart = state.cart.filter(i => i.id !== medId);
      }
    }
  });
  renderCurrentRoute();
  const cartDrawer = document.getElementById("cart-drawer-container");
  if (cartDrawer) {
    openCartDrawer();
  }
};

window.removeFromCart = function(medId) {
  updateAppState(state => {
    if (state.cart) {
      state.cart = state.cart.filter(i => i.id !== medId);
    }
  });
  showToast(_t("Item removed from cart"));
  renderCurrentRoute();
  const cartDrawer = document.getElementById("cart-drawer-container");
  if (cartDrawer) {
    openCartDrawer();
  }
};

window.openCartDrawer = function() {
  const state = getAppState();
  const cart = state.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const existing = document.getElementById("cart-drawer-container");
  if (existing) existing.remove();
  
  const drawerHTML = `
    <div id="cart-drawer-container">
      <div class="cart-drawer-backdrop" onclick="closeCartDrawer()"></div>
      <div class="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping Cart">
        <div class="cart-header">
          <h3>${_t("Shopping Cart")} (${cart.length})</h3>
          <button class="qty-btn" onclick="closeCartDrawer()">${icon("x", "small-icon")}</button>
        </div>
        <div class="cart-list">
          ${cart.length === 0 ? `
            <div style="text-align:center; margin-top:40px; color:var(--text-secondary);">
              ${icon("shopping-cart", "scanner-icon")}
              <p style="margin-top:12px;">${_t("Your cart is empty")}</p>
            </div>
          ` : cart.map(item => `
            <div class="cart-item">
              <div class="cart-item-details">
                <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${item.name}</div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">₹${item.price} each</div>
                <div class="quantity-controller">
                  <button class="qty-btn" onclick="adjustCartQty('${item.id}', -1)">-</button>
                  <span style="font-size:13px; font-weight:700;">${item.quantity}</span>
                  <button class="qty-btn" onclick="adjustCartQty('${item.id}', 1)">+</button>
                </div>
              </div>
              <div style="text-align:right; display:flex; flex-direction:column; justify-content:space-between; align-items:flex-end;">
                <span style="font-weight:750; font-size:13px; color:var(--accent-teal);">₹${item.price * item.quantity}</span>
                <button class="qty-btn" onclick="removeFromCart('${item.id}')" style="border:0; background:transparent; color:var(--danger); margin-top:8px;">
                  ${icon("trash", "small-icon")}
                </button>
              </div>
            </div>
          `).join("")}
        </div>
        <div class="cart-footer">
          <div class="cart-total-row">
            <span>${_t("Total Subtotal")}:</span>
            <span style="color:var(--accent-teal);">₹${total}</span>
          </div>
          <button class="join-btn" onclick="checkoutCart()" style="width:100%; margin:0; min-height:44px;" ${cart.length === 0 ? "disabled" : ""}>
            ${_t("Proceed to Checkout")}
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", drawerHTML);
  if (window.lucide) lucide.createIcons();
};

window.closeCartDrawer = function() {
  const container = document.getElementById("cart-drawer-container");
  if (container) container.remove();
};

window.checkoutCart = function() {
  const state = getAppState();
  const cart = state.cart || [];
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  
  const modalHTML = `
    <div class="modal-overlay" id="checkout-modal" onclick="closeModal('checkout-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Secure Checkout & Fulfillment</h3>
          <button class="modal-close" onclick="closeModal('checkout-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body">
          <p style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
            Complete your order with secure digital mapping under HIPAA and ABDM guidelines.
          </p>
          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,212,170,0.1); border:1px dashed var(--accent-teal); padding:10px; border-radius:8px; margin-bottom:12px;">
            <span style="font-size:11px; font-weight:700; color:var(--accent-teal);">Auto-populate patient details via linked ABHA Card?</span>
            <button class="join-btn" onclick="autofillCheckoutDetails()" style="margin:0; padding:4px 8px; font-size:10px;">Auto-fill</button>
          </div>
          <form class="form-grid" onsubmit="confirmOrder(event)" style="gap: 10px;">
            <label>Patient Name
              <input type="text" id="chk-name" required placeholder="Full Name">
            </label>
            <label>Delivery Mobile
              <input type="tel" id="chk-mobile" required placeholder="10-digit number">
            </label>
            <label>Shipping Address
              <input type="text" id="chk-address" required placeholder="Flat, Street, Area, City, Pincode">
            </label>
            <label>Payment Method
              <select id="chk-payment" required>
                <option value="UPI">UPI Instant Pay (Simulated Gateway)</option>
                <option value="Card">Credit / Debit Card (Simulated Gateway)</option>
                <option value="COD">Cash on Delivery (Manual)</option>
              </select>
            </label>
            <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 10px;">Proceed to Secure Payment</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
};

window.autofillCheckoutDetails = function() {
  const state = getAppState();
  const nameField = document.getElementById("chk-name");
  const mobileField = document.getElementById("chk-mobile");
  const addressField = document.getElementById("chk-address");
  
  if (state.currentUser) {
    if (nameField) nameField.value = state.currentUser.name || "";
    if (mobileField) mobileField.value = state.abhaCard ? state.abhaCard.mobile : "9876542070";
    if (addressField) addressField.value = "H-24, Ground Floor, Sector 62, Noida, Uttar Pradesh - 201301";
    showToast("ABHA Details auto-populated successfully!");
    announceAccessibility("ABHA profile details auto-populated in the checkout form.");
  } else {
    showToast("Please register or link your ABHA Card first.");
  }
};

window.confirmOrder = function(e) {
  e.preventDefault();
  const name = document.getElementById("chk-name").value;
  const mobile = document.getElementById("chk-mobile").value;
  const address = document.getElementById("chk-address").value;
  const payment = document.getElementById("chk-payment").value;
  
  closeModal("checkout-modal");
  closeCartDrawer();
  
  const loaderHTML = `
    <div class="modal-overlay" id="payment-loader-modal">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 400px; text-align: center; padding: 30px;">
        <div class="pulse-sync-icon" style="color: var(--accent-cyan); font-size: 40px; margin-bottom: 16px; display: inline-block;">
          ${icon("shield-alert", "logo-plus")}
        </div>
        <h3>Simulating Secure Gateway Connect</h3>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 8px 0 16px;">
          Direct communication with HDFC/UPI Gateway established under Milestones guidelines. Masked token generated.
        </p>
        <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin: 12px 0;">
          <div id="payment-progress" style="width: 0%; height: 100%; background: var(--accent-teal); transition: width 0.1s linear;"></div>
        </div>
        <div id="payment-timer" style="font-size: 13px; font-weight: 750; color: var(--accent-teal);">Verifying authentication... 5s</div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", loaderHTML);
  if (window.lucide) lucide.createIcons();
  
  const progressBar = document.getElementById("payment-progress");
  const timerLabel = document.getElementById("payment-timer");
  
  let countdown = 5;
  let progress = 0;
  
  const interval = setInterval(() => {
    progress += 2;
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (progress % 20 === 0) {
      countdown -= 1;
      if (timerLabel && countdown >= 0) {
        timerLabel.textContent = `Verifying authentication... ${countdown}s`;
      }
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      closeModal("payment-loader-modal");
      completeFulfillment(name, mobile, address, payment);
    }
  }, 100);
};

window.completeFulfillment = function(name, mobile, address, payment) {
  const state = getAppState();
  const cart = state.cart || [];
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = `SETU-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  updateAppState(state => {
    state.records.unshift({
      name: `Medicine Invoice ${orderId}`,
      type: "Prescription Invoice",
      date: new Date().toLocaleDateString("en-US", {month: 'short', day: '2-digit', year: 'numeric'}),
      source: "ABHA SETU Pharmacy"
    });
    
    state.notifications.unshift({
      id: Date.now(),
      title: "Order Confirmed",
      message: `Your medicine order ${orderId} has been successfully placed via ${payment}.`,
      time: "Just now",
      type: "billing",
      unread: true
    });
    
    state.cart = [];
  });
  
  logSecurityEvent("Pharmacy Order", `Placed order ${orderId} total: ₹${total} (Payment: ${payment})`);
  announceAccessibility(`Order ${orderId} placed successfully. Total amount was ${total} rupees.`);
  
  const invoiceHTML = `
    <div class="modal-overlay" id="invoice-modal" onclick="closeModal('invoice-modal')">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
        <div class="modal-header">
          <h3>Order Confirmed & Verified!</h3>
          <button class="modal-close" onclick="closeModal('invoice-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 10px 0;">
          <div style="width: 58px; height: 58px; border-radius: 50%; background: rgba(0, 212, 170, 0.15); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
            ${icon("check-circle", "logo-plus")}
          </div>
          <h4>Fulfillment Dispatch Ticket</h4>
          <p style="color: var(--text-secondary); font-size: 11px; margin-bottom: 16px;">
            A digital e-prescription copy has been linked in your ABDM Health Locker.
          </p>
          
          <div style="text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; font-size: 12px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Order ID:</span>
              <strong>${orderId}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Fulfillment Desk:</span>
              <span>MediFast Smart Pharmacy</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Patient Name:</span>
              <span>${name}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Delivery Contact:</span>
              <span>${mobile}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Shipping Address:</span>
              <span>${address}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px; border-top: 1px solid var(--border-color); padding-top:8px; font-weight:750;">
              <span>Total Paid:</span>
              <span style="color:var(--accent-teal);">₹${total}</span>
            </div>
          </div>
          
          <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('invoice-modal'); navigate('records')">View in Health Locker</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", invoiceHTML);
  if (window.lucide) lucide.createIcons();
  
  renderCurrentRoute();
};

function renderOrderMedicine() {
  const state = getAppState();
  const cart = state.cart || [];
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  return `
    ${pageHeader("Order Medicines", "Browse OTC & prescription medicines with direct ABHA-filled checkout.", `
      <button class="primary-action" onclick="openCartDrawer()" style="display:flex; align-items:center; gap:8px; position:relative;">
        ${icon("shopping-cart", "small-icon")}
        <span>${_t("View Cart")}</span>
        ${cartCount > 0 ? `<span style="background:var(--danger); color:#fff; border-radius:50%; font-size:10px; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-weight:800; position:absolute; top:-6px; right:-6px;">${cartCount}</span>` : ""}
      </button>
    `)}
    
    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
      <input type="text" id="medicine-search-input" placeholder="Filter medicines..." oninput="filterMedicinesList()" style="flex:1; padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: var(--text-primary); font-size:13px;">
    </div>

    <section class="med-grid" id="medicines-container-grid">
      ${medicinesList.map(med => {
        const cartItem = cart.find(i => i.id === med.id);
        const inCart = cartItem ? cartItem.quantity : 0;
        
        return `
          <article class="med-card" id="med-card-${med.id}">
            <img class="med-image" src="${med.image}" alt="${med.name}">
            <span class="med-tag ${med.category.toLowerCase()}">${med.category}</span>
            <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between; margin-top:8px;">
              <div>
                <h3 style="font-size:15px; font-weight:800;">${med.name}</h3>
                <p style="font-size:11px; color:var(--text-secondary); margin:4px 0 8px; line-height:1.4;">${med.desc}</p>
                <p style="font-size:10px; color:var(--accent-cyan); font-style:italic; margin-bottom:12px;">Dosage: ${med.dosage}</p>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px;">
                <span style="font-size:16px; font-weight:800; color:var(--accent-teal);">₹${med.price}</span>
                ${inCart > 0 ? `
                  <div class="quantity-controller" style="margin-top:0;">
                    <button class="qty-btn" onclick="adjustCartQty('${med.id}', -1)">-</button>
                    <span style="font-size:13px; font-weight:700; width:20px; text-align:center;">${inCart}</span>
                    <button class="qty-btn" onclick="adjustCartQty('${med.id}', 1)">+</button>
                  </div>
                ` : `
                  <button class="join-btn" onclick="addToCart('${med.id}')" style="margin:0; padding:6px 12px; font-size:11px;">Add to Cart</button>
                `}
              </div>
            </div>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

window.filterMedicinesList = function() {
  const query = document.getElementById("medicine-search-input").value.toLowerCase();
  medicinesList.forEach(med => {
    const card = document.getElementById(`med-card-${med.id}`);
    if (card) {
      const match = med.name.toLowerCase().includes(query) || med.desc.toLowerCase().includes(query);
      card.style.display = match ? "flex" : "none";
    }
  });
};

// --- Lab Test Lists and Helpers ---
const labTestsList = [
  { id: "lab-1", name: "Complete Blood Count (CBC)", price: 299, desc: "Analyzes red/white blood cells, platelets, and hemoglobin levels.", fasting: "Fasting not required", lab: "Apollo Diagnostics Partner" },
  { id: "lab-2", name: "Lipid Profile (Cholesterol)", price: 499, desc: "Measures LDL, HDL, triglycerides and total cholesterol.", fasting: "10-12 hours fasting required", lab: "Metro Labs Partner" },
  { id: "lab-3", name: "HbA1c (Glycated Haemoglobin)", price: 399, desc: "Evaluates average blood glucose levels over 3 months.", fasting: "Fasting not required", lab: "CityCare Labs Partner" },
  { id: "lab-4", name: "Thyroid Profile (T3, T4, TSH)", price: 599, desc: "Assesses overall thyroid function and metabolic health.", fasting: "Fasting not required", lab: "Apollo Diagnostics Partner" },
  { id: "lab-5", name: "Kidney Function Test (KFT)", price: 449, desc: "Tests creatinine, urea, and key electrolyte levels.", fasting: "Fasting optional", lab: "Metro Labs Partner" }
];

function renderBookLabTest() {
  return `
    ${pageHeader("Book Lab Tests", "Schedule NABL-accredited diagnostic scans and blood test collections.", "")}
    
    <div style="background: rgba(0, 212, 170, 0.05); border: 1px dashed var(--accent-teal); border-radius: 10px; padding: 14px; margin-bottom: 20px; display: flex; gap: 12px; align-items: center;">
      <div style="color:var(--accent-teal);">${icon("award", "scanner-icon")}</div>
      <div>
        <h4 style="font-size: 13px; font-weight:750; color:var(--accent-teal);">100% Certified NABL Partner Network</h4>
        <p style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
          All lab partners are HFR-registered. Smart locker integration uploads digital records automatically.
        </p>
      </div>
    </div>

    <section class="lab-grid">
      ${labTestsList.map((test, index) => `
        <article class="lab-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <span style="font-size:9px; font-weight:900; background:rgba(0, 212, 170, 0.15); color:var(--accent-teal); padding:2px 8px; border-radius:4px;">NABL</span>
            <span style="font-size:9px; font-weight:800; color:#f59e0b; background:rgba(245, 158, 11, 0.15); padding:2px 8px; border-radius:4px;">${test.fasting}</span>
          </div>
          <h3 style="font-size:15px; font-weight:800; margin-top:12px;">${test.name}</h3>
          <p style="font-size:11px; color:var(--text-secondary); margin:6px 0 14px; line-height:1.4; flex:1;">${test.desc}</p>
          <div style="font-size:10px; color:var(--text-muted); margin-bottom:12px;">Service: <strong>${test.lab}</strong></div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px;">
            <span style="font-size:16px; font-weight:800; color:var(--accent-teal);">₹${test.price}</span>
            <button class="join-btn" onclick="openLabBookingModal(${index})" style="margin:0; padding:6px 12px; font-size:11px;">Book Test Slot</button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

window.openLabBookingModal = function(idx) {
  const test = labTestsList[idx];
  const state = getAppState();
  
  const modalHTML = `
    <div class="modal-overlay" id="lab-booking-modal" onclick="closeModal('lab-booking-modal')">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Schedule Diagnostic Slot</h3>
          <button class="modal-close" onclick="closeModal('lab-booking-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body">
          <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
            Book a verified diagnostic session. Linked to NABL Accredited partner locker sync.
          </p>
          <form class="form-grid" onsubmit="confirmLabBooking(event, ${idx})" style="gap:10px;">
            <label>Selected Scan Panel
              <input type="text" readonly value="${test.name} (₹${test.price})">
            </label>
            <label>Preferred Date
              <input type="date" id="lab-date" required min="${new Date().toISOString().split('T')[0]}">
            </label>
            <label>Select Collection Time
              <div class="slot-grid">
                <button type="button" class="slot-btn active" onclick="selectBookingSlot(event, '08:00 AM')">08:00 AM (Fasting)</button>
                <button type="button" class="slot-btn" onclick="selectBookingSlot(event, '10:00 AM')">10:00 AM (Fasting)</button>
                <button type="button" class="slot-btn" onclick="selectBookingSlot(event, '12:00 PM')">12:00 PM</button>
                <button type="button" class="slot-btn" onclick="selectBookingSlot(event, '02:00 PM')">02:00 PM</button>
                <button type="button" class="slot-btn" onclick="selectBookingSlot(event, '04:00 PM')">04:00 PM</button>
              </div>
              <input type="hidden" id="selected-time-slot" value="08:00 AM">
            </label>
            <label>Patient ABHA Address
              <input type="text" id="lab-abha" required placeholder="ananya@abdm" value="${state.currentUser ? state.currentUser.abhaId : ""}">
            </label>
            <button type="submit" class="join-btn" style="width: 100%; min-height: 44px; margin-top: 12px;">Confirm & Generate NABL Ticket</button>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
};

window.selectBookingSlot = function(e, time) {
  document.querySelectorAll(".slot-btn").forEach(btn => btn.classList.remove("active"));
  e.currentTarget.classList.add("active");
  document.getElementById("selected-time-slot").value = time;
};

window.confirmLabBooking = function(e, idx) {
  e.preventDefault();
  const test = labTestsList[idx];
  const date = document.getElementById("lab-date").value;
  const time = document.getElementById("selected-time-slot").value;
  const abha = document.getElementById("lab-abha").value;
  const token = `SETU-LAB-${Math.floor(100 + Math.random() * 900)}`;
  
  closeModal("lab-booking-modal");
  
  updateAppState(state => {
    state.appointments.unshift({
      id: token,
      title: `Lab: ${test.name}`,
      doctor: test.lab,
      meta: `${date} at ${time}`,
      status: "Scheduled",
      token: token
    });
    
    state.notifications.unshift({
      id: Date.now(),
      title: "Lab Appointment Booked",
      message: `Diagnostic slot ${token} scheduled for ${test.name} on ${date}.`,
      time: "Just now",
      type: "appointment",
      unread: true
    });
  });
  
  logSecurityEvent("Diagnostic Slot Booked", `Lab Test ${test.name} registered (Token: ${token})`);
  announceAccessibility(`Lab test booked successfully. Token is ${token}`);
  
  const receiptHTML = `
    <div class="modal-overlay" id="receipt-modal" onclick="closeModal('receipt-modal')">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 500px;">
        <div class="modal-header">
          <h3>Diagnostic Receipt & Token</h3>
          <button class="modal-close" onclick="closeModal('receipt-modal')">${icon("x")}</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 10px 0;">
          <div style="font-size:11px; font-weight:800; color:var(--accent-teal); border: 1px solid var(--accent-teal); display:inline-block; padding: 2px 8px; border-radius:4px; margin-bottom:12px;">NABL ACCREDITED PARTNER</div>
          
          <div style="text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; font-size: 12px; margin-bottom: 16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Token Number:</span>
              <strong>${token}</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Diagnostic Panel:</span>
              <span>${test.name}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Fasting Guidance:</span>
              <span style="color:#f59e0b; font-weight:700;">${test.fasting}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Scheduled Date:</span>
              <span>${date}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Scheduled Time:</span>
              <span>${time}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
              <span style="color:var(--text-muted);">Linked ABHA ID:</span>
              <span>${abha}</span>
            </div>
          </div>
          
          <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('receipt-modal'); navigate('appointments')">Go to Appointments</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", receiptHTML);
  if (window.lucide) lucide.createIcons();
  
  renderCurrentRoute();
};

// --- Hospitals Registry ---
const hospitalsList = [
  {
    id: "hosp-1",
    name: "Janki Raman Hospital & Critical Care Centre, Jabalpur",
    hfrId: "IN2310026968",
    address: "5W33+W2V, Gurudev Colony, Jabalpur, Madhya Pradesh 482003",
    contact: "093993 38520",
    verifiedDate: "02 May 2026",
    status: "Verified Digital Health Facility",
    rooms: "15 Active OPD Rooms",
    depts: ["Critical Care", "OPD", "Emergency", "General Medicine"],
    registry: "Health Facility Registry (HFR)",
    under: "Ayushman Bharat Digital Mission",
    authority: "National Health Authority"
  },
  {
    id: "hosp-2",
    name: "DR AYESHAH HOMEO HEALTH MALL, Bhopal",
    hfrId: "IN2310026365",
    address: "Bhopal, Madhya Pradesh, India",
    contact: "Not Available",
    verifiedDate: "23 April 2026",
    status: "Verified Digital Health Facility",
    rooms: "8 Active Consultation Rooms",
    depts: ["Homeopathy", "Primary Care", "Wellness", "Consultation"],
    registry: "Health Facility Registry (HFR)",
    under: "Ayushman Bharat Digital Mission",
    authority: "National Health Authority"
  }
];

function renderHospitals() {
  return `
    ${pageHeader("Hospitals Directory", "Register OPD tokens at linked smart HFR facilities instantly.", "")}

    <section class="hospital-grid">
      ${hospitalsList.map((h, index) => `
        <article class="hospital-card">
          <div>
            <div class="hosp-card-header">
              <div class="hosp-header-left">
                <div class="hosp-icon-wrapper">
                  ${icon("building-2", "logo-plus")}
                </div>
                <div>
                  <h3>${h.name}</h3>
                  <span class="hosp-verified-badge">
                    <span class="live-dot"></span>
                    ${h.status || "Verified Digital Health Facility"}
                  </span>
                </div>
              </div>
            </div>

            <div class="hosp-card-details">
              <div class="hosp-detail-item">
                <div class="hosp-detail-icon-pin">${icon("map-pin", "small-icon")}</div>
                <span class="hosp-address">${h.address}</span>
              </div>
              <div class="hosp-detail-item-center">
                <div class="hosp-detail-icon">${icon("phone", "small-icon")}</div>
                <span class="hosp-text-bold">Contact: <strong>${h.contact}</strong></span>
              </div>
              <div class="hosp-detail-item-center">
                <div class="hosp-detail-icon">${icon("shield-check", "small-icon")}</div>
                <span>HFR Registration No: <strong class="hosp-id-highlight">${h.hfrId}</strong></span>
              </div>
              <div class="hosp-detail-item-center">
                <div class="hosp-detail-icon">${icon("calendar", "small-icon")}</div>
                <span>Verified Date: <strong class="hosp-val-primary">${h.verifiedDate}</strong></span>
              </div>
              
              <div class="abdm-details">
                <div><span>Registry:</span> <strong>${h.registry || "HFR"}</strong></div>
                <div><span>Program:</span> <strong>${h.under || "ABDM"}</strong></div>
                <div><span>Authority:</span> <strong>${h.authority || "NHA"}</strong></div>
              </div>
            </div>

            <div>
              <div class="hosp-depts-title">Specialist Departments</div>
              <div class="hosp-depts-container">
                ${h.depts.map(d => `<span class="hosp-dept-tag">${d}</span>`).join("")}
              </div>
            </div>
          </div>

          <div class="hosp-card-footer">
            <button class="join-btn hosp-checkin-btn" onclick="triggerHospitalCheckIn(${index})">
              ${icon("qr-code", "small-icon")} Scan & Share OPD Check-In
            </button>
          </div>
        </article>
      `).join("")}
    </section>
  `;
}

window.triggerHospitalCheckIn = function(idx) {
  const hospital = hospitalsList[idx];
  const state = getAppState();
  
  if (!state.currentUser) {
    showToast("Please login first to check in!");
    return;
  }
  
  const modalHTML = `
    <div class="modal-overlay" id="checkin-modal" onclick="closeModal('checkin-modal')">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 420px; text-align: center; padding: 30px 20px;">
        <div class="pulse-sync-icon" style="color: var(--accent-teal); font-size: 40px; margin-bottom: 16px; display: inline-block;">
          ${icon("qr-code", "logo-plus")}
        </div>
        <h3>ABDM Scan & Share Check-In</h3>
        <p style="color: var(--text-secondary); font-size: 12px; margin: 8px 0 20px;">
          Simulating check-in at <strong>${hospital.name}</strong>. Consent-first sharing of ABHA details is initiated securely.
        </p>
        
        <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin-bottom: 20px;">
          <div id="checkin-progress" style="width: 0%; height: 100%; background: var(--accent-teal); transition: width 0.1s linear;"></div>
        </div>
        <div id="checkin-status" style="font-size: 12px; font-weight: 700; color: var(--accent-teal);">Initiating secure handshake...</div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML("beforeend", modalHTML);
  if (window.lucide) lucide.createIcons();
  
  const progressBar = document.getElementById("checkin-progress");
  const statusLabel = document.getElementById("checkin-status");
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += 5;
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (progress === 30) {
      if (statusLabel) statusLabel.textContent = "Verifying ABHA ID details...";
    } else if (progress === 60) {
      if (statusLabel) statusLabel.textContent = "Obtaining patient consent signature...";
    } else if (progress === 90) {
      if (statusLabel) statusLabel.textContent = "Generating OPD Token Ticket...";
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      closeModal("checkin-modal");
      confirmHospitalCheckIn(hospital);
    }
  }, 100);
};

window.confirmHospitalCheckIn = function(hospital) {
  const token = `SETU-HFR-${Math.floor(100 + Math.random() * 900)}`;
  
  updateAppState(state => {
    state.appointments.unshift({
      id: token,
      title: `Scan & Share OPD Check-In`,
      doctor: hospital.name,
      meta: "Checked-in Today (Smart Queue)",
      status: "Checked In",
      token: token
    });
    
    state.notifications.unshift({
      id: Date.now(),
      title: "Smart Check-In Confirmed",
      message: `Checked in successfully at ${hospital.name}. Token queue ticket ${token} issued.`,
      time: "Just now",
      type: "abdm",
      unread: true
    });
  });
  
  logSecurityEvent("Smart Check-In", `Scan & Share at ${hospital.name} successful (Token: ${token})`);
  announceAccessibility(`Smart check-in completed. Token is ${token}`);
  
  const ticketHTML = `
    <div class="modal-overlay" id="ticket-modal" onclick="closeModal('ticket-modal')">
      <div class="modal-content" onclick="event.stopPropagation()" style="max-width: 460px; text-align: center; padding: 25px 20px;">
        <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(0, 212, 170, 0.15); color: var(--accent-teal); display: grid; place-items: center; margin: 0 auto 12px;">
          ${icon("building-2", "logo-plus")}
        </div>
        <h3>Interoperable Check-In Ticket</h3>
        <p style="color: var(--text-secondary); font-size: 11px; margin-bottom: 16px;">
          Present this ticket at the smart counter. Linked to HFR Identifier.
        </p>
        
        <div style="text-align: left; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; font-size: 12px; margin-bottom: 20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:var(--text-muted);">Queue Token:</span>
            <strong style="color:var(--accent-teal); font-size: 16px;">${token}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:var(--text-muted);">Facility Name:</span>
            <span>${hospital.name}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:var(--text-muted);">HFR ID:</span>
            <span>${hospital.hfrId}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:var(--text-muted);">Simulated Queue Pos:</span>
            <span><strong>3 patients ahead</strong> (Est. 8 mins wait)</span>
          </div>
        </div>
        
        <button class="join-btn" style="width: 100%; margin: 0;" onclick="closeModal('ticket-modal'); navigate('appointments')">Go to Appointments</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", ticketHTML);
  if (window.lucide) lucide.createIcons();
  
  renderCurrentRoute();
};

function renderBloodBank() {
  const state = getAppState();
  const donors = state.bloodDonors || [
    { name: "Ashish Patel", age: 33, bg: "B+", mobile: "9981435702", lastDon: "3 months ago" },
    { name: "Anant Agrahri", age: 32, bg: "B+", mobile: "9977756362", lastDon: "3 months ago" },
    { name: "Priyanka Mehra", age: 32, bg: "O+", mobile: "Not Available", lastDon: "3 months ago" },
    { name: "Manoj Jhariya", age: 37, bg: "O+", mobile: "Not Available", lastDon: "3 months ago" }
  ];
  const requests = state.bloodRequests || [
    { name: "Suresh Sharma", bg: "B-", units: 3, hospital: "CityCare Multi-Speciality Hospital", urgency: "Critical" }
  ];
  
  const bloodStocks = [
    { bg: "A+", units: 14 },
    { bg: "A-", units: 4, warning: true },
    { bg: "B+", units: 18 },
    { bg: "B-", units: 3, warning: true },
    { bg: "O+", units: 25 },
    { bg: "O-", units: 2, warning: true },
    { bg: "AB+", units: 8 },
    { bg: "AB-", units: 1, warning: true }
  ];
  
  return `
    ${pageHeader("Blood Bank", "Monitor emergency inventory stocks, register as donor, or post active request tickets.", "")}

    <article class="route-card wide-card" style="margin-bottom:16px;">
      <div class="card-title-row">${icon("droplet")}<h3>Emergency Blood Stocks Tracker</h3></div>
      <p style="color:var(--text-secondary); font-size:12px; margin-bottom:14px;">
        Live storage status in sandbox repository. Red indicator signals critical depletion (&lt; 5 units).
      </p>
      
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(80px, 1fr)); gap:10px;">
        ${bloodStocks.map(stock => `
          <div style="background:var(--bg-secondary); border:1px solid ${stock.warning ? "var(--danger)" : "var(--border-color)"}; border-radius:8px; padding:10px; text-align:center; position:relative;">
            <div style="font-size:18px; font-weight:800; color:${stock.warning ? "var(--danger)" : "var(--accent-teal)"};">${stock.bg}</div>
            <div style="font-size:12px; font-weight:700; margin-top:4px;">${stock.units} Units</div>
            ${stock.warning ? `<span style="font-size:7px; font-weight:900; background:rgba(239, 68, 68, 0.15); color:var(--danger); border:1px solid rgba(239, 68, 68, 0.3); border-radius:4px; position:absolute; top:-6px; left:50%; transform:translateX(-50%); text-transform:uppercase;">Low Stock</span>` : ""}
          </div>
        `).join("")}
      </div>
    </article>

    <div style="display:grid; grid-template-columns: 1fr; gap:16px; margin-bottom:16px;">
      <section style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <article class="route-card">
          <div class="card-title-row">${icon("user-round")}<h3>Donor Pledge Enrollment</h3></div>
          <form class="form-grid" onsubmit="registerBloodDonor(event)" style="gap:10px;">
            <label>Full Donor Name
              <input type="text" id="donor-name" required placeholder="Name">
            </label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <label>Age
                <input type="number" id="donor-age" required min="18" max="65" placeholder="Age">
              </label>
              <label>Blood Group
                <select id="donor-bg" required>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </label>
            </div>
            <label>Mobile Number
              <input type="tel" id="donor-phone" required placeholder="Phone">
            </label>
            <label>Last Donation Date (Optional)
              <input type="date" id="donor-last">
            </label>
            <button type="submit" class="join-btn" style="width:100%; margin:4px 0 0;">Register as Active Donor</button>
          </form>
        </article>

        <article class="route-card">
          <div class="card-title-row">${icon("shield-alert")}<h3>Emergency Blood Request</h3></div>
          <form class="form-grid" onsubmit="submitBloodRequest(event)" style="gap:10px;">
            <label>Patient Name
              <input type="text" id="req-name" required placeholder="Patient Name">
            </label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <label>Blood Group Required
                <select id="req-bg" required>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </label>
              <label>Units Needed
                <input type="number" id="req-units" required min="1" max="10" placeholder="Units">
              </label>
            </div>
            <label>Fulfillment Hospital
              <input type="text" id="req-hosp" required placeholder="Hospital Name">
            </label>
            <label>Urgency Level
              <select id="req-urgency" required>
                <option value="Critical">Critical (Immediate dispatch)</option>
                <option value="Urgent">Urgent (Within 4 hours)</option>
                <option value="Standard">Standard (Within 24 hours)</option>
              </select>
            </label>
            <button type="submit" class="join-btn" style="width:100%; margin:4px 0 0; background:var(--danger); border-color:var(--danger);">Post Urgent Call</button>
          </form>
        </article>
      </section>

      <article class="route-card wide-card">
        <div class="card-title-row">${icon("users")}<h3>Active Registered Donors Registry</h3></div>
        <div class="donor-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 14px;">
          ${donors.map(d => {
            const hasPhone = d.mobile && d.mobile !== "Not Available";
            const phoneAction = hasPhone ? `href="tel:${d.mobile}"` : 'style="opacity: 0.6; cursor: not-allowed;" disabled';
            const phoneText = hasPhone ? d.mobile : "Contact Not Available";
            const phoneClass = hasPhone ? "phone-active" : "phone-disabled";
            const phoneIcon = hasPhone ? "phone" : "phone-off";
            return `
              <div class="donor-card">
                <div class="donor-card-header">
                  <div class="donor-avatar-placeholder">
                    ${icon("user-round", "donor-avatar-icon")}
                  </div>
                  <div class="donor-main-info">
                    <h4>${d.name}</h4>
                    <span class="donor-age">${d.age} Years</span>
                  </div>
                  <span class="blood-badge">${d.bg}</span>
                </div>
                <div class="donor-card-body">
                  <div class="donor-meta-item">
                    ${icon("calendar", "small-icon")}
                    <span>Last Donation: <strong>${d.lastDon}</strong></span>
                  </div>
                </div>
                <div class="donor-card-footer">
                  ${hasPhone 
                    ? `<a ${phoneAction} class="donor-contact-btn ${phoneClass}">
                        ${icon(phoneIcon, "small-icon")}
                        <span>Call: ${phoneText}</span>
                       </a>`
                    : `<button ${phoneAction} class="donor-contact-btn ${phoneClass}">
                        ${icon(phoneIcon, "small-icon")}
                        <span>${phoneText}</span>
                       </button>`
                  }
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </article>

      <article class="route-card wide-card">
        <div class="card-title-row">${icon("activity")}<h3>Pending Emergency Requests Board</h3></div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:8px;">
          ${requests.map(r => `
            <div style="background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.2); border-radius:8px; padding:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <h4 style="font-size:13px; font-weight:800; color:var(--danger);">Urgent Dispatch: ${r.units} Units of ${r.bg}</h4>
                <p style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Patient: ${r.name} | Hospital: ${r.hospital}</p>
              </div>
              <span style="font-size:10px; font-weight:900; background:rgba(239,68,68,0.15); color:var(--danger); border:1px solid rgba(239,68,68,0.3); border-radius:4px; padding:2px 8px; text-transform:uppercase;">${r.urgency}</span>
            </div>
          `).join("")}
        </div>
      </article>
    </div>
  `;
}

window.registerBloodDonor = function(e) {
  e.preventDefault();
  const name = document.getElementById("donor-name").value;
  const age = document.getElementById("donor-age").value;
  const bg = document.getElementById("donor-bg").value;
  const mobile = document.getElementById("donor-phone").value;
  const lastDon = document.getElementById("donor-last").value || "Never";
  
  updateAppState(state => {
    if (!state.bloodDonors) state.bloodDonors = [];
    state.bloodDonors.unshift({ name, age, bg, mobile, lastDon });
  });
  
  logSecurityEvent("Blood Donor Registered", `Registered donor ${name} (Blood Group: ${bg})`);
  showToast("Thank you! Donor registered successfully.");
  announceAccessibility(`Thank you. Registered as a blood donor.`);
  
  renderCurrentRoute();
};

window.submitBloodRequest = function(e) {
  e.preventDefault();
  const name = document.getElementById("req-name").value;
  const bg = document.getElementById("req-bg").value;
  const units = document.getElementById("req-units").value;
  const hospital = document.getElementById("req-hosp").value;
  const urgency = document.getElementById("req-urgency").value;
  
  updateAppState(state => {
    if (!state.bloodRequests) state.bloodRequests = [];
    state.bloodRequests.unshift({ name, bg, units, hospital, urgency });
    
    state.notifications.unshift({
      id: Date.now(),
      title: "EMERGENCY BLOOD REQUEST",
      message: `Emergency: ${units} units of ${bg} blood required at ${hospital} for ${name}. Urgency: ${urgency}.`,
      time: "Just now",
      type: "security",
      unread: true
    });
  });
  
  logSecurityEvent("Blood Request", `Urgent blood request submitted for ${name} (${units} units of ${bg})`);
  showToast("Emergency blood request posted successfully!");
  announceAccessibility(`Emergency blood request posted.`);
  
  renderCurrentRoute();
};

function renderOrganDonation() {
  const state = getAppState();
  const pledges = state.organPledges || [];
  
  return `
    ${pageHeader("Organ Donation Pledge", "Enlist in the Ayushman Bharat Digital Mission Transplant Pledge program.", "")}

    <div style="display:grid; grid-template-columns: 1fr; gap:16px;">
      <section style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:16px;">
        <article class="route-card">
          <div class="card-title-row">${icon("heart-handshake")}<h3>Transplant Pledge Enrollment</h3></div>
          <p style="color:var(--text-secondary); font-size:12px; margin-bottom:12px;">
            Your consent parameters are sealed securely under HIPAA rules. You can download your official NHA certificate instantly on submit.
          </p>
          <form class="form-grid" onsubmit="registerOrganPledge(event)" style="gap:10px;">
            <label>Full Donor Name
              <input type="text" id="pledge-name" required placeholder="Full Name" value="${state.currentUser ? state.currentUser.name : ""}">
            </label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <label>Date of Birth
                <input type="date" id="pledge-dob" required>
              </label>
              <label>Mobile Number
                <input type="tel" id="pledge-mobile" required placeholder="Phone" value="${state.abhaCard ? state.abhaCard.mobile : "9876542070"}">
              </label>
            </div>
            
            <div style="margin: 8px 0;">
              <span style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Select Organs / Tissues to Pledge</span>
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-top:8px;">
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-corneas" checked> Corneas (Eyes)
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-kidneys" checked> Kidneys
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-heart" checked> Heart
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-lungs" checked> Lungs
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-liver" checked> Liver
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-pancreas"> Pancreas
                </label>
                <label style="display:flex; align-items:center; gap:8px; font-size:12px;">
                  <input type="checkbox" id="org-bones"> Bones / Tissues
                </label>
              </div>
            </div>

            <label style="display:flex; align-items:flex-start; gap:8px; font-size:11px; color:var(--text-secondary); border-top:1px solid var(--border-color); padding-top:10px;">
              <input type="checkbox" required>
              <span>I hereby authorize NHA and medical officers to register my transplant consent under the Indian Organ Retrieval Act.</span>
            </label>
            
            <button type="submit" class="join-btn" style="width:100%; margin-top:10px;">Register transplant pledge</button>
          </form>
        </article>

        <article class="route-card" style="line-height:1.6; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div class="card-title-row">${icon("book-open")}<h3>Pledge Awareness Guidelines</h3></div>
            <ul style="padding-left:18px; font-size:11px; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px; margin-top:8px;">
              <li><strong>Life Transformation:</strong> One tissue/organ donor has the capacity to stabilize or save up to 8 distinct patient lives.</li>
              <li><strong>Interoperable Verification:</strong> Pledges sync instantly with NHA HFR registries, matching blood groups and MHC tissue types.</li>
              <li><strong>Revocable Consent:</strong> Under DPDP guidelines, donors retain absolute authority to withdraw consent profiles via this portal.</li>
            </ul>
          </div>
          <div style="background:rgba(0, 212, 170, 0.05); border:1px solid var(--border-color); border-radius:8px; padding:10px; font-size:11px; margin-top:14px; display:flex; gap:8px; align-items:center;">
            <div style="color:var(--accent-teal);">${icon("award", "small-icon")}</div>
            <span style="color:var(--text-secondary);">Your certificate contains a masked security seal for regulatory compliance.</span>
          </div>
        </article>
      </section>

      ${pledges.length > 0 ? `
        <article class="route-card wide-card" style="background:#fafafa; border:1px solid var(--border-color); color:#000;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
            <h3 style="color:#0f172a; font-size:14px; font-weight:800; margin:0;">Active Registered Pledge Certificate</h3>
            <button class="join-btn" onclick="downloadPledgeCertificate('${pledges[0].pledgeId}')" style="margin:0; padding:6px 12px; font-size:11px; background:#0f766e; border-color:#0f766e;">
              ${icon("download", "small-icon")} Download Certificate (TXT)
            </button>
          </div>
          
          <div class="certificate-frame">
            <div class="certificate-watermark"></div>
            <div class="certificate-header">
              <h4>National Health Authority</h4>
              <p>Government of India - Ayushman Bharat Digital Mission</p>
            </div>
            <div class="certificate-title">Organ & Tissue Pledge Registration</div>
            <div class="certificate-recipient">
              This is to verify and honor the digital transplant registry enrollment for
              <strong>${pledges[0].name}</strong>
              DOB: <em>${pledges[0].dob}</em>
            </div>
            <div class="certificate-body">
              "I pledge to donate my organs and tissues after my death to give the gift of life to others."<br>
              Pledged Organs: <strong style="color:#0f766e;">${pledges[0].organs.join(", ")}</strong>
            </div>
            <div class="certificate-footer">
              <div>
                Pledge ID: <strong>${pledges[0].pledgeId}</strong><br>
                Date Signed: <strong>${pledges[0].date}</strong>
              </div>
              <div class="nha-seal">NHA<br>PLEDGE</div>
            </div>
          </div>
        </article>
      ` : ""}
    </div>
  `;
}

window.registerOrganPledge = function(e) {
  e.preventDefault();
  const name = document.getElementById("pledge-name").value;
  const dob = document.getElementById("pledge-dob").value;
  const mobile = document.getElementById("pledge-mobile").value;
  
  const checkboxList = ["corneas", "kidneys", "heart", "lungs", "liver", "pancreas", "bones"];
  const pledgedOrgans = [];
  checkboxList.forEach(org => {
    const chk = document.getElementById(`org-${org}`);
    if (chk && chk.checked) {
      pledgedOrgans.push(org.charAt(0).toUpperCase() + org.slice(1));
    }
  });
  
  if (pledgedOrgans.length === 0) {
    showToast("Please select at least one organ to pledge!");
    return;
  }
  
  const pledgeId = `NHA-PLEDGE-${Math.floor(100000 + Math.random() * 900000)}`;
  
  updateAppState(state => {
    if (!state.organPledges) state.organPledges = [];
    state.organPledges.unshift({
      pledgeId, name, dob, mobile, organs: pledgedOrgans, date: new Date().toLocaleDateString()
    });
  });
  
  logSecurityEvent("Organ Pledge Signed", `Signed transplant pledge ${pledgeId} for ${name} (${pledgedOrgans.join(", ")})`);
  showToast("Transplant pledge registered! Loading certificate...");
  announceAccessibility(`Transplant pledge registered successfully.`);
  
  renderCurrentRoute();
};

window.downloadPledgeCertificate = function(pledgeId) {
  const state = getAppState();
  const pledge = (state.organPledges || []).find(p => p.pledgeId === pledgeId);
  if (!pledge) return;
  
  const textContent = `
==================================================
        AYUSHMAN BHARAT DIGITAL MISSION
            NATIONAL HEALTH AUTHORITY
              GOVERNMENT OF INDIA
==================================================

        ORGAN TRANSPLANT PLEDGE CERTIFICATE

This is to verify and honor that:
Donor Name: ${pledge.name}
Date of Birth: ${pledge.dob}
Pledge ID: ${pledge.pledgeId}
Date of Pledge: ${pledge.date}

Has solemnly pledged to donate the following organs/tissues
for transplant surgery following post-mortem verification
under NHA clinical guidelines:

Pledged Organs:
${pledge.organs.map(o => `- ${o}`).join("\n")}

==================================================
             AUTHORIZED Interoperable HFR Seal
==================================================
`;

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Organ_Pledge_Certificate_${pledge.pledgeId}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Certificate downloaded successfully!");
};

function renderAiAlerts() { return renderHealth(); }
function renderCompliance() {
  return `
    ${pageHeader("Medicolegal & Compliance", "Capture digital consents, audit e-prescriptions and legal vault entries.")}
    <section class="route-grid service-grid">
      <article class="route-card">
        ${icon("file-check")}
        <h3>Digital Consent Forms</h3>
        <p>Valid patient consents recorded with IP audit trails, active status.</p>
      </article>
      <article class="route-card">
        ${icon("scale")}
        <h3>Medicolegal Support</h3>
        <p>Incidents notes timelines mapped for regulatory compliance reviews.</p>
      </article>
    </section>
  `;
}

function renderInsights() { return renderHealth(); }
function renderLanguage() { return renderSettings(); }
function renderContact() {
  return `
    ${pageHeader("Contact Support", "Connect with Ayushman Bharat health coordinators.")}
    <section class="route-card wide-card" style="text-align: center; padding: 30px;">
      ${icon("mail", "scanner-icon")}
      <h3 style="margin-top: 12px;">Get in Touch</h3>
      <p style="color: var(--text-secondary); font-size: 13px; margin: 6px 0 20px;">
        For issues regarding ABHA registrations, sandbox credentials or diagnostic HFR clinics:
      </p>
      <div style="font-size: 14px; font-weight: 700; color: var(--accent-teal);">
        support@abhasetu.com | +91-9981057765
      </div>
    </section>
  `;
}

function renderAbout() {
  return `
    ${pageHeader("About Platform", "Mission vision of the interoperable health ecosystem.")}
    <article class="route-card wide-card" style="line-height: 1.6;">
      <h3>Digital Health Bridge</h3>
      <p style="color: var(--text-secondary); font-size: 13px; margin-top: 8px;">
        ABHA Setu provides standard patient-consent based integrations mapped to ABDM Milestone 1 guidelines, linking dynamic teleconsultations, waiting queues, HFR clinics, and diagnostic ATM kiosks.
      </p>
    </article>
  `;
}

function renderTerms() {
  return `
    ${pageHeader("Terms and Conditions", "Platform consent parameters.")}
    <article class="route-card wide-card" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
      All diagnostic screening metrics, public certificates, doctor licenses and electronic records rendered under this platform are simulated demo outputs designed for sandboxed verification.
    </article>
  `;
}

function renderPrivacy() {
  return `
    ${pageHeader("Privacy Policy", "Interoperable data policies under DPDP guidelines.")}
    <article class="route-card wide-card" style="font-size: 13px; color: var(--text-secondary); line-height: 1.6;">
      We prioritize patient data privacy. Vitals, identity details, and medical files are stored locally in the browser's local sandbox, never transmitted onto public networks without explicit consent.
    </article>
  `;
}

function renderGenericService(route) {
  return `
    ${pageHeader(route.replace("-", " ").toUpperCase(), "Simulated healthcare module.")}
    <div class="route-card wide-card" style="text-align: center; padding: 24px;">
      ${icon("grid")}
      <h4 style="margin-top: 12px;">Simulated Sandbox Endpoint</h4>
      <p style="color: var(--text-secondary); font-size: 12px; margin-top: 6px;">
        The requested pathway <strong>/${route}</strong> is successfully loaded.
      </p>
    </div>
  `;
}

// 18. INTERACTIVE TOAST SYSTEM
function showToast(message) {
  const existing = document.querySelector(".setu-toast");
  if (existing) existing.remove();
  
  const toastHTML = `
    <div class="setu-toast">
      ${icon("check-circle", "small-icon")}
      <span>${message}</span>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", toastHTML);
  if (window.lucide) lucide.createIcons();
}

// Actions Controller
function handleAction(target, event) {
  const action = target.dataset.action;
  if (action === "start-scanner") {
    event.preventDefault();
    showToast("Launching oximeter camera...");
  }
}

// Bootstrap Single Page App
document.addEventListener("DOMContentLoaded", initApp);
