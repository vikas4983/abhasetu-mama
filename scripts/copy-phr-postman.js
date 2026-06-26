/**
 * Copies official PHR Postman collections from Downloads into docs/abdm/postman/
 */
const fs = require('fs');
const path = require('path');

const destDir = path.join(__dirname, '..', 'docs', 'abdm', 'postman');
const mappings = [
  [
    'c:/Users/ADMIN/Downloads/PHR Registration-Enrollment - postman_collection_m1_e66da1f265.json',
    'PHR-Registration-Enrollment.postman_collection.json',
  ],
  [
    'c:/Users/ADMIN/Downloads/PHR Login - postman_collection_m1_e66da1f265 (1).json',
    'PHR-Login.postman_collection.json',
  ],
  [
    'c:/Users/ADMIN/Downloads/PHR Profile - postman_collection_m1_e66da1f265 (1).json',
    'PHR-Profile.postman_collection.json',
  ],
  [
    'c:/Users/ADMIN/Downloads/PHR & Locker (HIECM) - Consent_M_postman_collection_b3ee5be4d9_745d5a72e3.json',
    'PHR-Locker-HIECM.postman_collection.json',
  ],
  [
    'c:/Users/ADMIN/Downloads/Consent pin - Consent_Pin_postman_collection_8287cb66d8_c8136055ff.json',
    'Consent-PIN.postman_collection.json',
  ],
];

fs.mkdirSync(destDir, { recursive: true });
for (const [src, name] of mappings) {
  if (!fs.existsSync(src)) {
    console.warn('SKIP (missing):', src);
    continue;
  }
  const dest = path.join(destDir, name);
  fs.copyFileSync(src, dest);
  console.log('OK', name);
}
