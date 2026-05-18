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
