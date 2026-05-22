export const abdmV3Endpoints = {
  session: "/api/hiecm/gateway/v3/sessions",
  publicCertificate: "/v3/profile/public/certificate",
  enrolOtp: "/v3/enrollment/request/otp",
  enrolByAadhaar: "/v3/enrollment/enrol/byAadhaar",
  enrolByDocument: "/v3/enrollment/enrol/byDocument",
  createAbhaAddress: "/v3/enrollment/enrol/abha-address",
  loginOtp: "/v3/profile/login/request/otp",
  loginVerify: "/v3/profile/login/verify",
  profile: "/v3/profile/account",
  qrCode: "/v3/profile/account/qrCode",
  card: "/v3/profile/account/abha-card",
  mobileSearch: "/v3/profile/account/abha/search",
  profileShare: "/v3/hip/patient/profile/share"
} as const;

export async function encryptForAbdm(plainText: string, publicKeyPem: string) {
  const body = publicKeyPem.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s/g, "");
  const binaryDer = Uint8Array.from(atob(body), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey("spki", binaryDer, { name: "RSA-OAEP", hash: "SHA-1" }, false, ["encrypt"]);
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, new TextEncoder().encode(plainText));
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
