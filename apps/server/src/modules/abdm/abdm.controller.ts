import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AbdmService } from "./abdm.service";

@Controller("abdm")
export class AbdmController {
  constructor(private readonly abdm: AbdmService) {}

  @Post("session")
  createSession() {
    return this.abdm.createSession();
  }

  @Get("certificate")
  getCertificate() {
    return this.abdm.getPublicCertificate();
  }

  @Post("abha/aadhaar/otp")
  requestAadhaarOtp(@Body() body: { aadhaar: string }) {
    return this.abdm.requestAadhaarOtp(body.aadhaar);
  }

  @Post("abha/aadhaar/verify")
  verifyAadhaarOtp(@Body() body: { txnId: string; otp: string }) {
    return this.abdm.verifyAadhaarOtp(body.txnId, body.otp);
  }

  @Post("abha/address")
  createAddress(@Body() body: { txnId: string; abhaAddress: string }) {
    return this.abdm.createAbhaAddress(body);
  }

  @Get("abha/card/:xToken")
  downloadCard(@Param("xToken") xToken: string) {
    return this.abdm.downloadAbhaCard(xToken);
  }
}
