import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const allowedOrigin = process.env.CORS_ORIGIN || 'http://127.0.0.1:5173';

const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none'",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-Id',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const json = (response, statusCode, body) => {
  response.writeHead(statusCode, { ...securityHeaders, 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
};

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, securityHeaders);
    response.end();
    return;
  }

  if (request.url === '/health') {
    json(response, 200, { ok: true, service: 'abhasetu-mock-backend' });
    return;
  }

  if (request.url?.startsWith('/api/abdm/v3/')) {
    json(response, 200, {
      status: 'mocked',
      requestId: crypto.randomUUID(),
      message: 'ABDM V3 sandbox proxy placeholder. Replace with certified backend implementation.',
    });
    return;
  }

  json(response, 404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`ABHA SETU mock backend listening on http://127.0.0.1:${PORT}`);
});
