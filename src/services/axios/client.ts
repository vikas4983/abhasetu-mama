import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { STORAGE_KEYS } from '@/constants/app';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.authToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.authToken);
    }
    return Promise.reject(error);
  },
);
