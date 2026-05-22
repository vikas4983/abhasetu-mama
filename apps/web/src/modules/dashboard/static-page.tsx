"use client";

import { Card } from "@/components/ui/card";
import { databaseTables } from "@/constants/platform";
import type { RouteKey } from "@/types/domain";

const copy: Record<RouteKey, { eyebrow: string; title: string; body: string; items: string[] }> = {
  dashboard: { eyebrow: "Dashboard", title: "Enterprise Digital Health Command Center", body: "ABDM operations, care delivery, compliance, and patient engagement.", items: [] },
  abdm: { eyebrow: "ABDM", title: "ABDM Services", body: "Milestone 1 V3 workflows are implemented with encrypted payload architecture.", items: [] },
  telemedicine: { eyebrow: "Telemedicine", title: "Telemedicine", body: "Doctor profiles and consultation workflows.", items: [] },
  insights: { eyebrow: "Insights", title: "Health Insights", body: "Vitals and AI health education.", items: [] },
  facilities: { eyebrow: "Facilities", title: "Connected Facilities", body: "Hospitals, clinics, labs, pharmacies, telemedicine, and diagnostics.", items: [] },
  security: { eyebrow: "Security", title: "Security Operations", body: "XSS prevention, CSRF readiness, secure token storage, rate limiting, and logging redaction.", items: ["JWT access token with refresh-token-ready architecture", "Role guards for Admin, Doctor, Patient, Operator", "Helmet, validation, CORS, and rate limiting on backend"] },
  compliance: { eyebrow: "Compliance", title: "Medicolegal & Compliance", body: "Consent-first architecture for prescriptions, telemedicine, and secure records.", items: ["Purpose-bound consent", "Audit trail references", "ABDM and healthcare policy alignment"] },
  reports: { eyebrow: "Reports", title: "Database and Reporting", body: "Scalable PostgreSQL schema for healthcare operations.", items: databaseTables },
  scanner: { eyebrow: "QR", title: "QR Scanner", body: "ABDM, facility, and ABHA QR scanner.", items: [] },
  settings: { eyebrow: "Settings", title: "Settings", body: "Persistent theme, language, accessibility, and session controls.", items: ["Dark and light mode synchronized globally", "English and Hindi translation namespaces", "Reduced motion and keyboard focus support"] },
  contact: { eyebrow: "Contact", title: "Contact", body: "Reach the AbhaSetu team.", items: ["contact@abhasetu.com", "+91-9981057765", "Madar Gate, Panchampura, Katangi, Jabalpur, Madhya Pradesh 483105"] },
  about: { eyebrow: "About", title: "About AbhaSetu", body: "Vision, mission, ABDM role, healthcare transformation, timeline, and company story.", items: ["Vision: bridge patients, doctors, facilities, and records", "Mission: secure ABHA, QR, telemedicine, and connected facility journeys", "Timeline: Milestone 1 now; HIP/HIU and consent manager integrations next"] },
  terms: { eyebrow: "Terms", title: "Terms & Conditions", body: "Healthcare SaaS usage terms and consent references.", items: ["Demo workflows do not create real ABHA records without approved credentials", "Users must capture consent before handling health data", "Facilities must validate identity and records"] },
  privacy: { eyebrow: "Privacy", title: "Privacy Policy", body: "Consent-aware healthcare privacy structure.", items: ["Encrypt Aadhaar, mobile, and OTP values where ABDM requires it", "Store health documents as secure references", "Access must be purpose-bound, role-based, logged, and revocable"] }
};

export function StaticPage({ route }: { route: RouteKey }) {
  const data = copy[route];
  return (
    <section className="col-span-full mt-6 grid gap-4">
      <header className="rounded-2xl border border-border bg-bg-card p-7 shadow-surface">
        <p className="text-sm font-extrabold uppercase text-accent-teal">{data.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-extrabold">{data.title}</h1>
        <p className="mt-3 max-w-3xl text-text-secondary">{data.body}</p>
      </header>
      {data.items.length > 0 && <Card><ul className="grid gap-3 pl-5 text-text-secondary">{data.items.map((item) => <li key={item}>{item}</li>)}</ul></Card>}
    </section>
  );
}
