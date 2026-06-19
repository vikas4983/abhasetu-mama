import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ABDM_HEADERS } from '../constants/abdm.constants';
import * as crypto from 'crypto';

@Injectable()
export class AbdmGatewayClient {
  /**
   * Performs a HTTP GET request to the ABDM gateway
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestConfig = this.prepareConfig(config);
    return axios.get<T>(url, requestConfig);
  }

  /**
   * Performs a HTTP POST request to the ABDM gateway
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestConfig = this.prepareConfig(config);
    return axios.post<T>(url, data, requestConfig);
  }

  /**
   * Performs a HTTP PATCH request to the ABDM gateway
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestConfig = this.prepareConfig(config);
    return axios.patch<T>(url, data, requestConfig);
  }

  /**
   * Performs a HTTP PUT request to the ABDM gateway
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestConfig = this.prepareConfig(config);
    return axios.put<T>(url, data, requestConfig);
  }

  /**
   * Performs a HTTP DELETE request to the ABDM gateway
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    const requestConfig = this.prepareConfig(config);
    return axios.delete<T>(url, requestConfig);
  }

  /**
   * Prepares default request config by adding required headers (RequestId, Timestamp, CorrelationId)
   */
  private prepareConfig(config: AxiosRequestConfig = {}): AxiosRequestConfig {
    const headers = { ...(config.headers || {}) };

    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (!headers[ABDM_HEADERS.REQUEST_ID]) {
      headers[ABDM_HEADERS.REQUEST_ID] = crypto.randomUUID();
    }

    if (!headers[ABDM_HEADERS.TIMESTAMP]) {
      headers[ABDM_HEADERS.TIMESTAMP] = new Date().toISOString();
    }

    return {
      ...config,
      headers,
    };
  }
}
