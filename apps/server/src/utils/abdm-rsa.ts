import { constants, publicEncrypt } from "crypto";

export function encryptWithAbdmPublicKey(value: string, publicKey: string) {
  const encrypted = publicEncrypt(
    {
      key: publicKey,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha1"
    },
    Buffer.from(value, "utf8")
  );
  return encrypted.toString("base64");
}
