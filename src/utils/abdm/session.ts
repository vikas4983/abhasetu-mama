import crypto from 'crypto';

interface SessionResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

let cachedToken: string | null = null;
let tokenExpiryTime: number = 0; // Epoch timestamp in ms

/**
 * Retrieves a valid ABDM session access token.
 * Leverages in-memory caching and proactive refresh logic to ensure zero latency.
 */
export async function getAbdmAccessToken(): Promise<string> {
  const clientId = process.env.ABDM_CLIENT_ID;
  const clientSecret = process.env.ABDM_CLIENT_SECRET;
  const gatewayUrl = process.env.ABDM_GATEWAY_URL || 'https://dev.abdm.gov.in';
  const cmId = process.env.ABDM_CM_ID || 'sbx';

  // If the credentials are not configured, return a mock/simulated token for development/sandbox fallback
  if (!clientId || !clientSecret || clientId.includes('YOUR_ABDM_CLIENT_ID')) {
    console.warn('ABDM credentials not fully configured in environment. Using sandbox simulation token.');
    return 'simulated-sandbox-access-token-jwt-placeholder';
  }

  const now = Date.now();
  // If we have a cached token and it has at least 5 minutes of validity left, use it
  if (cachedToken && tokenExpiryTime > now + 5 * 60 * 1000) {
    return cachedToken;
  }

  try {
    const requestId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const response = await fetch(`${gatewayUrl}/api/hiecm/gateway/v3/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'REQUEST-ID': requestId,
        'TIMESTAMP': timestamp,
        'X-CM-ID': cmId,
      },
      body: JSON.stringify({
        clientId: clientId,
        clientSecret: clientSecret,
        grantType: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ABDM Gateway returned status ${response.status}: ${errorText}`);
    }

    const data = (await response.json()) as SessionResponse;
    cachedToken = data.accessToken;
    
    // Set expiry time with a 1-minute buffer
    tokenExpiryTime = Date.now() + (data.expiresIn - 60) * 1000;
    
    console.log('Successfully refreshed ABDM Gateway Session Token.');
    return cachedToken;
  } catch (error) {
    console.error('Failed to authenticate with ABDM Gateway:', error);
    // In development or sandbox mode, fall back to mock token if there is a network or configuration issue
    if (process.env.NODE_ENV === 'development' || !process.env.ABDM_CLIENT_ID) {
      console.warn('Authentication failed. Falling back to simulated token.');
      return 'simulated-sandbox-access-token-jwt-fallback';
    }
    throw error;
  }
}
