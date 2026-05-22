import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

const demoUsers = [
  { email: "admin@abhasetu.com", password: "Admin@123", role: "admin", name: "AbhaSetu Admin" },
  { email: "doctor@abhasetu.com", password: "Doctor@123", role: "doctor", name: "Dr. Care Team" },
  { email: "patient@abhasetu.com", password: "Patient@123", role: "patient", name: "Ananya Verma" },
  { email: "operator@abhasetu.com", password: "Operator@123", role: "operator", name: "Facility Operator" }
] as const;

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  loginDemo(email: string, password: string) {
    const user = demoUsers.find((item) => item.email === email && item.password === password);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    return this.issue(user);
  }

  refreshDemo() {
    return { accessToken: this.jwt.sign({ sub: "demo-refresh", role: "patient" }) };
  }

  private issue(user: (typeof demoUsers)[number]) {
    const payload = { sub: user.email, role: user.role, name: user.name };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: "30d" }),
      user: { email: user.email, role: user.role, name: user.name }
    };
  }
}
