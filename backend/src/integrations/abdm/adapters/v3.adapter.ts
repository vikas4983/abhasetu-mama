import { Injectable } from '@nestjs/common';
import { IABDMAdapter } from '../interfaces/abdm-adapter.interface';
import { AbdmGatewayClient } from '../clients/abdm-gateway.client';
import { CryptoClient } from '../clients/crypto.client';
import { ABDM_ENDPOINTS, ABDM_HEADERS } from '../constants/abdm.constants';

@Injectable()
export class V3Adapter implements IABDMAdapter {
  constructor(
    private readonly gatewayClient: AbdmGatewayClient,
    private readonly cryptoClient: CryptoClient,
  ) {}

  async generateSessionToken(clientId: string, clientSecret: string, abdmCmId: string): Promise<any> {
    const url = `${await this.getGatewayBaseUrl()}${ABDM_ENDPOINTS.SESSIONS_V3}`;
    const headers = {
      [ABDM_HEADERS.CM_ID]: abdmCmId || 'sbx',
    };
    const response = await this.gatewayClient.post(url, {
      clientId,
      clientSecret,
      grantType: 'client_credentials',
    }, { headers });
    return response.data;
  }

  async syncPublicKeyFromGateway(xToken: string, gatewayToken: string): Promise<any> {
    const url = `${await this.getGatewayBaseUrl()}${ABDM_ENDPOINTS.CERT_V3}`;
    const headers = {
      [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${gatewayToken}`,
      [ABDM_HEADERS.X_TOKEN]: xToken.startsWith('Bearer ') ? xToken : `Bearer ${xToken}`,
    };
    const response = await this.gatewayClient.get(url, { headers });
    return response.data;
  }

  async requestAadhaarOtp(aadhaarNumber: string, context?: any): Promise<any> {
    return { status: 'success' };
  }

  async verifyAadhaarOtp(otp: string, txnId: string, mobile?: string, abhaAddress?: string, context?: any): Promise<any> {
    return { status: 'success' };
  }

  async requestMobileOtp(mobileNumber: string, txnId: string, context?: any): Promise<any> {
    return { status: 'success' };
  }

  async verifyMobileOtp(otp: string, txnId: string, context?: any): Promise<any> {
    return { status: 'success' };
  }

  async enrolByDocument(documentData: any, context?: any): Promise<any> {
    return { status: 'success' };
  }

  async downloadAbhaCard(xToken: string, gatewayToken: string): Promise<any> {
    const url = `${await this.getGatewayBaseUrl()}${ABDM_ENDPOINTS.ABHA_CARD}`;
    const headers = {
      [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${gatewayToken}`,
      [ABDM_HEADERS.X_TOKEN]: xToken.startsWith('Bearer ') ? xToken : `Bearer ${xToken}`,
    };
    const response = await this.gatewayClient.get(url, { headers });
    return response.data;
  }

  async requestEmailVerificationLink(email: string, txnId: string, abhaAddress: string, xToken: string, gatewayToken: string): Promise<any> {
    const url = `${await this.getGatewayBaseUrl()}${ABDM_ENDPOINTS.ABHA_EMAIL_VERIFY_LINK}`;
    const headers = {
      [ABDM_HEADERS.AUTHORIZATION]: `Bearer Token ${gatewayToken}`,
      [ABDM_HEADERS.X_TOKEN]: xToken.startsWith('Bearer ') ? xToken : `Bearer ${xToken}`,
    };
    const response = await this.gatewayClient.post(url, { email, txnId, abhaAddress }, { headers });
    return response.data;
  }

  private async getGatewayBaseUrl(): Promise<string> {
    return process.env.ABDM_GATEWAY_URL || 'https://sandbox.abdm.gov.in';
  }
}
