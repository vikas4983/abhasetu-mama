export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  appVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
} as const;
