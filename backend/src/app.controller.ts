import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getSystemStatus() {
    return {
      status: 'ONLINE',
      system: 'Abha Setu High-Performance National Digital Health Bridge',
      version: 'v3.0.0',
      abdmMilestones: {
        M1: 'ACTIVE (ABHA Creation & Verification - Version 3 PKCS1Padding)',
        M2: 'ACTIVE (Consent Engine & Care Context Discovery Linkage)',
        M3: 'ACTIVE (Secure Elliptic Curve Weierstrass Curve25519 Payload Exchange)'
      },
      database: 'ONLINE',
      cache: 'ONLINE',
      timestamp: new Date().toISOString(),
      developerContact: 'Senior Enterprise Solution Architect'
    };
  }
}
