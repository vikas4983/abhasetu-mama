import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { encryptWithAbdmPublicKey } from "../../utils/abdm-rsa";

@Injectable()
export class AbdmService {
  private accessToken?: string;
  private expiresAt = 0;

  constructor(private readonly config: ConfigService) {}

  async createSession() {
    const response = await this.request("/api/hiecm/gateway/v3/sessions", {
      method: "POST",
      body: JSON.stringify({
        clientId: this.config.getOrThrow<string>("ABDM_CLIENT_ID"),
        clientSecret: this.config.getOrThrow<string>("ABDM_CLIENT_SECRET")
      }),
      skipAuth: true
    });
    this.accessToken = response.accessToken ?? response.access_token;
    this.expiresAt = Date.now() + 13 * 60 * 1000;
    return response;
  }

  async getPublicCertificate() {
    return this.request("/v3/profile/public/certificate", { method: "GET" });
  }

  async requestAadhaarOtp(aadhaar: string) {
    const certificate = await this.getPublicCertificate();
    const encryptedAadhaar = encryptWithAbdmPublicKey(aadhaar, certificate.publicKey ?? certificate);
    return this.request("/v3/enrollment/request/otp", {
      method: "POST",
      body: JSON.stringify({ scope: ["abha-enrol"], loginHint: "aadhaar", loginId: encryptedAadhaar, otpSystem: "aadhaar" })
    });
  }

  async verifyAadhaarOtp(txnId: string, otp: string) {
    const certificate = await this.getPublicCertificate();
    const encryptedOtp = encryptWithAbdmPublicKey(otp, certificate.publicKey ?? certificate);
    return this.request("/v3/enrollment/enrol/byAadhaar", {
      method: "POST",
      body: JSON.stringify({ authData: { authMethods: ["otp"], otp: { txnId, otpValue: encryptedOtp } }, consent: { code: "abha-enrollment", version: "1.4" } })
    });
  }

  async createAbhaAddress(body: { txnId: string; abhaAddress: string }) {
    return this.request("/v3/enrollment/enrol/abha-address", { method: "POST", body: JSON.stringify(body) });
  }

  async downloadAbhaCard(xToken: string) {
    return this.request("/v3/profile/account/abha-card", { method: "GET", headers: { "X-Token": xToken } });
  }

  private async request(path: string, init: RequestInit & { skipAuth?: boolean } = {}) {
    if (!init.skipAuth && (!this.accessToken || Date.now() > this.expiresAt)) await this.createSession();
    const baseUrl = this.config.get<string>("ABDM_BASE_URL") ?? "https://dev.abdm.gov.in";
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "REQUEST-ID": randomUUID(),
        "TIMESTAMP": new Date().toISOString(),
        "X-CM-ID": this.config.get<string>("ABDM_XCM_ID") ?? "sbx",
        ...(this.accessToken && !init.skipAuth ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        ...(init.headers ?? {})
      }
    });
    if (!response.ok) throw new InternalServerErrorException(`ABDM request failed: ${response.status}`);
    const contentType = response.headers.get("content-type");
    return contentType?.includes("application/json") ? response.json() : response.text();
  }
}
