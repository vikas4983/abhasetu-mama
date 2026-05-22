import type { Role } from "@/types/domain";

export const demoUsers = [
  { email: "admin@abhasetu.com", password: "Admin@123", role: "admin", name: "AbhaSetu Admin" },
  { email: "doctor@abhasetu.com", password: "Doctor@123", role: "doctor", name: "Dr. Care Team" },
  { email: "patient@abhasetu.com", password: "Patient@123", role: "patient", name: "Ananya Verma" },
  { email: "operator@abhasetu.com", password: "Operator@123", role: "operator", name: "Facility Operator" }
] satisfies Array<{ email: string; password: string; role: Role; name: string }>;

export function loginDemo(email: string, password: string) {
  const user = demoUsers.find((item) => item.email === email && item.password === password);
  if (!user) throw new Error("Invalid demo credentials");
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    accessToken: `demo.${user.role}.${Date.now()}`
  };
}
