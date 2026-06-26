/**
 * @file        admin.credentials.ts
 * @description Demo stakeholder credentials (sandbox / local dev only)
 * @module      admin
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 */

/** Default password for all seeded demo accounts unless noted */
export const DEMO_DEFAULT_PASSWORD = "DreamProject@2026" as const;
export const DEMO_FACILITY_PASSWORD = "Password@123" as const;

export interface DemoCredential {
  role: string;
  email: string;
  password: string;
  status: "approved" | "pending";
  loginUrl: string;
  notes?: string;
}

/**
 * @description Seeded accounts from backend db.service.ts — use for Stakeholder Suite login
 */
export const STAKEHOLDER_CREDENTIALS: DemoCredential[] = [
  {
    role: "Admin",
    email: "admin@abhasetu.com",
    password: DEMO_DEFAULT_PASSWORD,
    status: "approved",
    loginUrl: "/admin/login",
  },
  {
    role: "Master Admin",
    email: "master@abhasetu.com",
    password: DEMO_DEFAULT_PASSWORD,
    status: "approved",
    loginUrl: "/admin/login",
  },
  {
    role: "Hospital (HIP)",
    email: "hospital@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "approved",
    loginUrl: "/staff-login",
    notes: "ABDM HIP stakeholder",
  },
  {
    role: "Clinic",
    email: "clinic@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "approved",
    loginUrl: "/staff-login",
  },
  {
    role: "Pharmacy",
    email: "pharmacy@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "approved",
    loginUrl: "/staff-login",
  },
  {
    role: "Insurance",
    email: "insurance@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "approved",
    loginUrl: "/staff-login",
  },
  {
    role: "Lab",
    email: "lab@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "pending",
    loginUrl: "/staff-login",
    notes: "Approve in Admin → Facilities first",
  },
  {
    role: "Diagnostic",
    email: "diagnostic@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "pending",
    loginUrl: "/staff-login",
  },
  {
    role: "Doctor",
    email: "doctor@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "pending",
    loginUrl: "/staff-login",
  },
  {
    role: "Alumni",
    email: "alumni@abhasetu.com",
    password: DEMO_FACILITY_PASSWORD,
    status: "pending",
    loginUrl: "/staff-login",
  },
];
