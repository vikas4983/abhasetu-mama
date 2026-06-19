export interface IABDMAdapter {
  generateSessionToken(clientId: string, clientSecret: string, abdmCmId: string): Promise<any>;
  syncPublicKeyFromGateway(xToken: string, gatewayToken: string): Promise<any>;
  requestAadhaarOtp(aadhaarNumber: string, context?: any): Promise<any>;
  verifyAadhaarOtp(otp: string, txnId: string, mobile?: string, abhaAddress?: string, context?: any): Promise<any>;
  requestMobileOtp(mobileNumber: string, txnId: string, context?: any): Promise<any>;
  verifyMobileOtp(otp: string, txnId: string, context?: any): Promise<any>;
  enrolByDocument(documentData: any, context?: any): Promise<any>;
  downloadAbhaCard(xToken: string, gatewayToken: string): Promise<any>;
  requestEmailVerificationLink(email: string, txnId: string, abhaAddress: string, xToken: string, gatewayToken: string): Promise<any>;
}
