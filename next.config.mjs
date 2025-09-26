import { createSecureHeaders } from "next-secure-headers";

const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*",
  "connect-src 'self' https://*",
  "font-src 'self' data:",
  "frame-src 'none'"
].join('; ');

const securityHeaders = createSecureHeaders({
  contentSecurityPolicy: {
    directives: {
      ...Object.fromEntries(csp.split('; ').map((line) => line.split(' ')).map(([key, ...rest]) => [key, rest.join(' ')]))
    }
  },
  forceHTTPSRedirect: [true, { maxAge: 63072000, includeSubDomains: true }],
  referrerPolicy: 'no-referrer',
  xssProtection: 'block-rendering',
  nosniff: 'nosniff'
});

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders
    }
  ]
};

export default nextConfig;
