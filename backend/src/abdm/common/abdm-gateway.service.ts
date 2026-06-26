/**
 * @file        abdm-gateway.service.ts
 * @description Shared HTTP client for ABDM ABHA V3 and HIE-CM v0.5 gateway calls
 * @module      abdm/common
 * @layer       service
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';
import * as crypto from 'crypto';
import { SessionService } from '../session/session.service';
import { ABDM_HEADERS } from '../../constants/abdm.constants';

export interface AbdmRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  xToken?: string;
  useAbhaBase?: boolean;
  useGatewayBase?: boolean;
  useCmBase?: boolean;
  useHidBase?: boolean;
  extraHeaders?: Record<string, string>;
}

@Injectable()
export class AbdmGatewayService {
  constructor(private readonly sessionService: SessionService) {}

  /**
   * @description Build standard ABDM request headers
   */
  async buildHeaders(xToken?: string, extra?: Record<string, string>, useGatewayBase = false, useHidBase = false): Promise<Record<string, string>> {
    const config = await this.sessionService.getConfig();
    const session = await this.sessionService.getGatewaySession();
    const authValue = useHidBase
      ? `Bearer ${session.tokenPreview}`
      : useGatewayBase
        ? `Bearer ${session.tokenPreview}`
        : `Bearer Token ${session.tokenPreview}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      [ABDM_HEADERS.REQUEST_ID]: crypto.randomUUID(),
      [ABDM_HEADERS.TIMESTAMP]: new Date().toISOString(),
      [ABDM_HEADERS.CM_ID]: config.ABDM_CM_ID || process.env.ABDM_CM_ID || 'sbx',
      [ABDM_HEADERS.AUTHORIZATION]: authValue,
      ...extra,
    };
    if (xToken) {
      const clean = xToken.startsWith('Bearer ') ? xToken : `Bearer ${xToken}`;
      headers[ABDM_HEADERS.X_TOKEN] = clean;
      headers['X-token'] = clean;
    }
    return headers;
  }

  /**
   * @description Execute an ABDM gateway HTTP request
   */
  async request<T = unknown>(options: AbdmRequestOptions): Promise<T> {
    const baseUrl = options.useHidBase
      ? await this.sessionService.getPhrHidBaseUrl()
      : options.useCmBase
        ? await this.sessionService.getPhrCmBaseUrl()
        : options.useGatewayBase
          ? await this.sessionService.getGatewayBaseUrl()
          : await this.sessionService.getAbhaBaseUrl();
    const method = options.method || 'POST';
    const useGatewayAuth = options.useGatewayBase === true || options.useCmBase === true;
    const useHidAuth = options.useHidBase === true;
    const headers = await this.buildHeaders(
      options.xToken,
      options.extraHeaders,
      useGatewayAuth,
      useHidAuth,
    );
    const url = `${baseUrl}${options.path}`;
    const config: AxiosRequestConfig = { headers, timeout: 15000 };
    const response =
      method === 'GET'
        ? await axios.get<T>(url, config)
        : method === 'PATCH'
          ? await axios.patch<T>(url, options.body, config)
          : method === 'PUT'
            ? await axios.put<T>(url, options.body, config)
            : method === 'DELETE'
              ? await axios.delete<T>(url, { ...config, data: options.body })
              : await axios.post<T>(url, options.body, config);
    return response.data;
  }
}
