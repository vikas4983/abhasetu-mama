/**
 * @file        stakeholder.constants.ts
 * @description Stakeholder roles, routes, and navigation for facility consoles
 * @module      constants
 * @layer       constants
 * @author      Platform Team
 * @created     2026-06-26
 */

export const STAKEHOLDER_ROLES = [
  "hospital",
  "clinic",
  "pharmacy",
  "lab",
  "diagnostic_centre",
  "insurance_org",
  "individual_doctor",
  "iqra_alumni",
] as const;

export type StakeholderRole = (typeof STAKEHOLDER_ROLES)[number];

export const ADMIN_ROLES = ["admin", "master_admin"] as const;

export const STAKEHOLDER_ROLE_LABELS: Record<string, string> = {
  hospital: "Hospital (HIP)",
  clinic: "Clinic",
  pharmacy: "Pharmacy",
  lab: "Laboratory",
  diagnostic_centre: "Diagnostic Centre",
  insurance_org: "Insurance (NHCX)",
  individual_doctor: "Individual Doctor",
  iqra_alumni: "IQRA Alumni",
  admin: "Platform Admin",
  master_admin: "Master Admin",
};

/** @description Default landing route after staff login */
export function getStakeholderHomePath(role: string): string {
  if (role === "admin" || role === "master_admin") return "/admin";
  if (STAKEHOLDER_ROLES.includes(role as StakeholderRole)) {
    return `/stakeholder/${roleToSlug(role)}`;
  }
  return "/";
}

export function roleToSlug(role: string): string {
  const map: Record<string, string> = {
    diagnostic_centre: "diagnostic",
    insurance_org: "insurance",
    individual_doctor: "doctor",
    iqra_alumni: "alumni",
  };
  return map[role] || role;
}

export function slugToRole(slug: string): string {
  const map: Record<string, string> = {
    diagnostic: "diagnostic_centre",
    insurance: "insurance_org",
    doctor: "individual_doctor",
    alumni: "iqra_alumni",
  };
  return map[slug] || slug;
}

export function isStakeholderRole(role: string | undefined): boolean {
  if (!role) return false;
  return (
    STAKEHOLDER_ROLES.includes(role as StakeholderRole) ||
    ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])
  );
}

export function isFacilityRole(role: string | undefined): boolean {
  return !!role && STAKEHOLDER_ROLES.includes(role as StakeholderRole);
}

export interface StakeholderNavItem {
  label: string;
  path: string;
  icon: string;
}

export function getStakeholderNav(role: string): StakeholderNavItem[] {
  const base = `/stakeholder/${roleToSlug(role)}`;
  const common: StakeholderNavItem[] = [
    { label: "Insights", path: `${base}`, icon: "insights" },
    { label: "My profile", path: `${base}/profile`, icon: "profile" },
    { label: "Documentation", path: `${base}/docs`, icon: "docs" },
  ];

  const byRole: Record<string, StakeholderNavItem[]> = {
    hospital: [
      { label: "Beds", path: `${base}/beds`, icon: "beds" },
      { label: "Appointments", path: `${base}/appointments`, icon: "calendar" },
      { label: "Staff", path: `${base}/staff`, icon: "staff" },
      { label: "Blood bank", path: `${base}/blood-bank`, icon: "blood" },
      { label: "OPD Queue", path: `${base}/opd`, icon: "queue" },
      { label: "Scan & Share", path: `${base}/scan-share`, icon: "scan" },
      { label: "Care Contexts", path: `${base}/care-contexts`, icon: "link" },
      { label: "Consents", path: `${base}/consents`, icon: "consent" },
    ],
    clinic: [
      { label: "Appointments", path: `${base}/appointments`, icon: "calendar" },
      { label: "Scan & Share", path: `${base}/scan-share`, icon: "scan" },
    ],
    pharmacy: [
      { label: "Orders", path: `${base}/orders`, icon: "orders" },
      { label: "Inventory", path: `${base}/inventory`, icon: "inventory" },
    ],
    lab: [
      { label: "Test catalog", path: `${base}/catalog`, icon: "catalog" },
      { label: "Test Orders", path: `${base}/orders`, icon: "orders" },
      { label: "Reports", path: `${base}/reports`, icon: "reports" },
    ],
    diagnostic_centre: [
      { label: "Imaging Orders", path: `${base}/orders`, icon: "orders" },
      { label: "Reports", path: `${base}/reports`, icon: "reports" },
    ],
    insurance_org: [
      { label: "Policies", path: `${base}/policies`, icon: "policy" },
      {
        label: "Eligibility",
        path: `${base}/eligibility`,
        icon: "eligibility",
      },
    ],
    individual_doctor: [
      { label: "Appointments", path: `${base}/appointments`, icon: "calendar" },
      {
        label: "Availability",
        path: `${base}/availability`,
        icon: "availability",
      },
      { label: "HPR Profile", path: `${base}/hpr`, icon: "hpr" },
    ],
    iqra_alumni: [
      { label: "Directory", path: `${base}/directory`, icon: "directory" },
    ],
  };

  return [...common.slice(0, 1), ...(byRole[role] || []), ...common.slice(1)];
}
