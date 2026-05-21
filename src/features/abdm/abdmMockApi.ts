export interface AbdmRequest {
  aadhaar?: string;
  mobile?: string;
  otp?: string;
  abhaAddress?: string;
  abhaNumber?: string;
  facilityQr?: string;
}

const wait = (ms = 420) => new Promise((resolve) => window.setTimeout(resolve, ms));

const mask = (value = '') => value.replace(/\d(?=\d{4})/g, 'x');

export const abdmMockApi = {
  async requestAadhaarOtp(payload: AbdmRequest) {
    await wait();
    return { txnId: crypto.randomUUID(), message: `OTP sent for Aadhaar ${mask(payload.aadhaar)}` };
  },
  async verifyOtp(payload: AbdmRequest) {
    await wait();
    return { token: `sandbox-${crypto.randomUUID()}`, message: `OTP verified for mobile ${mask(payload.mobile)}` };
  },
  async verifyAbhaNumber(payload: AbdmRequest) {
    await wait();
    return { verified: Boolean(payload.abhaNumber), message: 'ABHA number verification completed in mock V3 flow.' };
  },
  async verifyAbhaAddress(payload: AbdmRequest) {
    await wait();
    return { available: Boolean(payload.abhaAddress), message: 'ABHA address is ready for sandbox linking.' };
  },
  async scanFacilityQr(payload: AbdmRequest) {
    await wait();
    return { facilityId: 'HFR-SBX-483105', message: `Facility QR accepted: ${payload.facilityQr || 'camera scan payload'}` };
  },
};
