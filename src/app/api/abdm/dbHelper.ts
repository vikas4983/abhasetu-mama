import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'db.json');

export interface Database {
  config: {
    ABDM_CLIENT_ID: string;
    ABDM_CLIENT_SECRET: string;
    ABDM_GATEWAY_URL: string;
    ABDM_CM_ID: string;
    ABDM_HIU_ID: string;
    ABDM_HIP_ID: string;
    sandboxMode: boolean;
  };
  products: any[];
  policies: any[];
  labPackages: any[];
  auditLogs: any[];
}

export function readDb(): Database {
  try {
    if (!fs.existsSync(dbPath)) {
      return {
        config: {
          ABDM_CLIENT_ID: '',
          ABDM_CLIENT_SECRET: '',
          ABDM_GATEWAY_URL: 'https://dev.abdm.gov.in',
          ABDM_CM_ID: 'sbx',
          ABDM_HIU_ID: '',
          ABDM_HIP_ID: '',
          sandboxMode: true
        },
        products: [],
        policies: [],
        labPackages: [],
        auditLogs: []
      };
    }
    const data = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return {
      config: {
        ABDM_CLIENT_ID: '',
        ABDM_CLIENT_SECRET: '',
        ABDM_GATEWAY_URL: 'https://dev.abdm.gov.in',
        ABDM_CM_ID: 'sbx',
        ABDM_HIU_ID: '',
        ABDM_HIP_ID: '',
        sandboxMode: true
      },
      products: [],
      policies: [],
      labPackages: [],
      auditLogs: []
    };
  }
}

export function writeDb(db: Database): boolean {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing to local JSON database:', error);
    return false;
  }
}
