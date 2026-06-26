/**
 * @file        axiosInstance.ts
 * @description Axios instance for ABDM BFF API calls
 * @module      lib/api/config
 * @layer       config
 * @author      Platform Team
 * @created     2026-06-26
 * @modified    2026-06-26
 */

import axios from 'axios';

const baseURL = typeof window !== 'undefined' ? '/api/abdm' : process.env.BACKEND_INTERNAL_URL + '/api/abdm';

export const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  config.headers['X-Correlation-ID'] = crypto.randomUUID();
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    return Promise.reject(new Error(message));
  },
);
