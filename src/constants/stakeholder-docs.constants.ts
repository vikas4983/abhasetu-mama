/**
 * @file        stakeholder-docs.constants.ts
 * @description Process & ABDM integration documentation per stakeholder type
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 */

export interface StakeholderDocSection {
  title: string;
  body: string;
  apis?: string[];
  flows?: string[];
}

export interface StakeholderDoc {
  role: string;
  title: string;
  summary: string;
  abdmMilestone: string;
  sections: StakeholderDocSection[];
}

export const STAKEHOLDER_DOCUMENTATION: StakeholderDoc[] = [
  {
    role: "hospital",
    title: "Hospital (HIP) — Health Information Provider",
    summary:
      "Registers patients via Scan & Share, links care contexts, and pushes FHIR records after consent.",
    abdmMilestone: "M2 HIP + M1 Scan & Share",
    sections: [
      {
        title: "Onboarding",
        body: "Register via /register-facility with HIP ID from HFR. Admin approves in Facilities tab. Use staff-login with hospital@abhasetu.com after approval.",
        flows: [
          "Facility registration → Admin approval → Staff login → HIP dashboard",
        ],
      },
      {
        title: "Scan & Share (M1)",
        body: "Patient scans HFR QR; demographic profile is shared. Platform generates OPD token and optional Scan & Pay bills.",
        apis: [
          "POST /api/abdm/scan-share",
          "POST /api/abdm/v3/hip/patient/share",
        ],
      },
      {
        title: "Care context linking (M2)",
        body: "Discover patient by ABHA address, init link, confirm with OTP. Care contexts appear in patient PHR locker.",
        apis: [
          "POST /api/abdm/hip (discover-link, confirm-link)",
          "HIE-CM v3 link APIs",
        ],
      },
      {
        title: "Health records transfer",
        body: "After consent artefact is granted, package FHIR R4 bundles and transfer via HIE-CM data-flow APIs with Fidelius encryption.",
        apis: [
          "POST /api/hiecm/data-flow/v3/health-information/hip/on-request",
        ],
      },
    ],
  },
  {
    role: "clinic",
    title: "Clinic — Micro HIP",
    summary:
      "Smaller HIP footprint: OPD appointments, Scan & Share check-in, and limited care-context linking.",
    abdmMilestone: "M2 HIP (lite)",
    sections: [
      {
        title: "Registration",
        body: "Clinic stakeholders register with consultation fee and specialties. Approved clinics access the clinic console.",
        flows: ["register-facility → approval → /stakeholder/clinic"],
      },
      {
        title: "Appointments",
        body: "View and manage telemedicine / OPD slots synced with patient bookings.",
        apis: ["Internal appointments module"],
      },
      {
        title: "Scan & Share",
        body: "Same HIP patient share flow as hospitals with compact queue UI.",
        apis: ["POST /api/abdm/scan-share"],
      },
    ],
  },
  {
    role: "pharmacy",
    title: "Pharmacy",
    summary:
      "Fulfill e-prescriptions linked via ABHA; track orders and inventory (demo analytics in console).",
    abdmMilestone: "M2 linked prescriptions",
    sections: [
      {
        title: "Access",
        body: "Pharmacy staff login after admin approval. Orders can reference ABHA-linked prescriptions from consent-approved FHIR bundles.",
        flows: ["Staff login → Orders dashboard"],
      },
      {
        title: "ABDM linkage",
        body: "Prescription HI type from HIP transfers appears when patient grants consent to pharmacy HIU (future HIU registration).",
        apis: ["M3 consent fetch", "FHIR MedicationRequest"],
      },
    ],
  },
  {
    role: "lab",
    title: "Laboratory",
    summary:
      "Receive diagnostic orders, upload DiagnosticReport FHIR to HIP pipeline.",
    abdmMilestone: "M2 HIP — DiagnosticReport",
    sections: [
      {
        title: "Test orders",
        body: "Pending and completed test orders with ABHA patient reference.",
        apis: ["HIP care context — DiagnosticReport"],
      },
      {
        title: "Approval",
        body: "Lab accounts start as pending; master admin approves in Admin → Facilities.",
        flows: ["register-facility → approve → staff-login"],
      },
    ],
  },
  {
    role: "diagnostic_centre",
    title: "Diagnostic Centre",
    summary:
      "Imaging and advanced diagnostics with report upload to patient locker.",
    abdmMilestone: "M2 HIP",
    sections: [
      {
        title: "Imaging workflow",
        body: "Track imaging orders and publish reports to ABDM-compliant bundles.",
        apis: ["DiagnosticReport FHIR", "HIP link notify"],
      },
    ],
  },
  {
    role: "insurance_org",
    title: "Insurance Organisation (NHCX)",
    summary:
      "Coverage eligibility checks and PM-JAY / private policy verification via NHCX FHIR.",
    abdmMilestone: "NHCX + M3 HIU (read)",
    sections: [
      {
        title: "Eligibility",
        body: "Run CoverageEligibilityRequest against patient ABHA / policy number.",
        apis: ["POST /api/abdm/nhcx (eligibility-check)"],
      },
      {
        title: "Policies",
        body: "Manage policy catalog shown to patients on /insurance (patient app).",
        flows: ["NHCX on_check response → patient UI"],
      },
    ],
  },
  {
    role: "individual_doctor",
    title: "Individual Doctor",
    summary:
      "HPR-verified practitioner with appointments and optional HIP linking for solo practice.",
    abdmMilestone: "HPR + M2 HIP",
    sections: [
      {
        title: "HPR",
        body: "Search and verify National Health Practitioner Registry ID.",
        apis: ["POST /api/abdm/hpr"],
      },
      {
        title: "Practice",
        body: "Telemedicine appointments and patient list (demo).",
        flows: ["Staff login → HPR tab → Appointments"],
      },
    ],
  },
  {
    role: "iqra_alumni",
    title: "IQRA Alumni Network",
    summary:
      "Alumni directory and community health outreach (non-clinical stakeholder).",
    abdmMilestone: "Community / HFR affiliation",
    sections: [
      {
        title: "Directory",
        body: "Approved alumni access member directory and event insights.",
        flows: ["register-facility → approval → directory"],
      },
    ],
  },
  {
    role: "admin",
    title: "Platform Admin",
    summary:
      "Master control: ABDM config, facility approval, pincode directory, audit logs, stakeholder documentation.",
    abdmMilestone: "All milestones",
    sections: [
      {
        title: "Facilities",
        body: "Approve or reject pending hospital, clinic, lab, pharmacy, and other registrations.",
        apis: ["GET/POST /api/abdm/admin/facilities"],
      },
      {
        title: "ABDM Config",
        body: "Gateway URLs, client credentials, session token generation, public key sync.",
        apis: [
          "GET/POST /api/abdm/admin/config",
          "POST /api/abdm/admin/session/generate",
        ],
      },
      {
        title: "Compliance tests",
        body: "Run M1/M2/M3 and PHR compliance suites.",
        apis: ["GET /api/abdm/tests", "GET /api/abdm/tests/phr"],
      },
    ],
  },
];

export function getDocForRole(role: string): StakeholderDoc | undefined {
  return STAKEHOLDER_DOCUMENTATION.find((d) => d.role === role);
}
