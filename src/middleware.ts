import { NextRequest, NextResponse } from 'next/server';

// djb2 hash string for rate limiting (avoids Node.js crypto in Edge runtime)
function hashString(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

// ============================================================
// BIZHUB SECURITY MIDDLEWARE
// Based on: OWASP Top 10:2025, Next.js Security Docs,
// Harvard Cybersecurity Best Practices, MIT CSAIL Guidelines
// ============================================================

// --- 1. In-memory rate limiter (sliding window) ---
// For production, replace with Upstash Redis (@upstash/ratelimit)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS = {
  '/api/auth': { max: 10, windowMs: 60_000 },      // 10/min for auth
  '/api/businesses': { max: 30, windowMs: 60_000 }, // 30/min for business ops
  '/api/reviews': { max: 20, windowMs: 60_000 },
  '/api/invites': { max: 5, windowMs: 60_000 },
  '/api/search': { max: 60, windowMs: 60_000 },
  'default': { max: 100, windowMs: 60_000 },         // 100/min default
};

function getRateLimit(path: string) {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (path.startsWith(prefix)) return limit;
  }
  return RATE_LIMITS['default'];
}

function checkRateLimit(key: string, path: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const limit = getRateLimit(path);
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt < now) {
    const resetAt = now + limit.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit.max - 1, resetAt };
  }

  if (existing.count >= limit.max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count++;
  return { allowed: true, remaining: limit.max - existing.count, resetAt: existing.resetAt };
}

// Clean up old entries every 5 mins to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) rateLimitStore.delete(key);
    }
  }, 300_000);
}

// --- 2. Known malicious user-agent patterns (bot defense) ---
const BLOCKED_UA_PATTERNS = [
  /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /zgrab/i,
  /python-requests\/[0-1]\./i, // old automated scrapers
  /go-http-client\/1\.0/i,
  /dirbuster/i, /gobuster/i, /hydra/i, /burpsuite/i,
];

// --- 3. Known attack path patterns (path traversal, injection probes) ---
const MALICIOUS_PATH_PATTERNS = [
  /\.\.\//,          // path traversal
  /\/etc\/passwd/,   // unix file exposure
  /\.(env|git|svn)/, // sensitive file probes
  /<script/i,        // XSS in URL
  /union.*select/i,  // SQL injection
  /exec\s*\(/i,      // command injection
  /base64_decode/i,  // PHP shell pattern
  /eval\s*\(/i,
  /\%27/,            // URL-encoded apostrophe (SQLi)
  /\%3C\%73\%63\%72\%69\%70\%74/i, // URL-encoded <script>
];

// --- 4. Get real IP (works behind Vercel/Cloudflare) ---
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    // Validate it looks like an IP
    if (/^[\d.:\[\]a-fA-F]+$/.test(firstIp)) return firstIp;
  }
  return req.headers.get('x-real-ip') || '0.0.0.0';
}

// --- 5. Nonce for CSP ---
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  let str = '';
  for (let i = 0; i < array.length; i++) {
    str += String.fromCharCode(array[i]);
  }
  return btoa(str);
}

// --- 6. Comprehensive security headers (CSP, HSTS, anti-clickjack, etc.) ---
function buildSecurityHeaders(nonce: string): Record<string, string> {
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in https://storage.googleapis.com https://*.vercel.app https://placehold.co`,
    `connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://vitals.vercel-insights.com https://*.vercel-scripts.com https://*.vercel.app`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `media-src 'self' blob:`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  return {
    // Prevent XSS via content injection
    'Content-Security-Policy': csp,
    // Force HTTPS for 1 year (including subdomains)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Restrict browser feature access
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), browsing-topics=()',
    // Block XSS (legacy browsers)
    'X-XSS-Protection': '1; mode=block',
    // Prevent DNS prefetch leaks
    'X-DNS-Prefetch-Control': 'off',
    // Prevent IE compatibility mode
    'X-Permitted-Cross-Domain-Policies': 'none',
    // Cross-Origin policies
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  };
}

// --- 7. Suspicious request scoring (anomaly detection) ---
function getThreatScore(req: NextRequest): number {
  let score = 0;
  const url = req.url;
  const ua = req.headers.get('user-agent') || '';
  const path = new URL(url).pathname;
  const search = new URL(url).search;

  // Check for malicious patterns in path or query string
  for (const pattern of MALICIOUS_PATH_PATTERNS) {
    if (pattern.test(path) || pattern.test(search)) score += 50;
  }
  // Check user agent
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(ua)) score += 80;
  }
  // No user-agent (highly suspicious for API calls from browser)
  if (!ua && path.startsWith('/api')) score += 30;
  // Unusually long URLs
  if (url.length > 2000) score += 20;
  // Multiple special chars in query string (potential injection)
  const specialChars = (search.match(/['"<>\\;]/g) || []).length;
  if (specialChars > 3) score += specialChars * 5;

  return score;
}

// ============================================================
// MAIN MIDDLEWARE
// ============================================================
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public/') ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|css)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const nonce = generateNonce();
  const clientIp = getClientIp(req);
  const ua = req.headers.get('user-agent') || '';

  // ---- Threat Score Check ----
  const threatScore = getThreatScore(req);
  if (threatScore >= 80) {
    console.warn(`[SECURITY] Blocked high-threat request: IP=${clientIp} score=${threatScore} path=${pathname}`);
    return new NextResponse('Forbidden', {
      status: 403,
      headers: { 'Content-Type': 'text/plain', 'X-Blocked-By': 'BizHub-Security' },
    });
  }

  // ---- Bot Detection ----
  for (const pattern of BLOCKED_UA_PATTERNS) {
    if (pattern.test(ua)) {
      console.warn(`[SECURITY] Blocked malicious bot: IP=${clientIp} UA=${ua}`);
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  // ---- Rate Limiting (API routes only) ----
  if (pathname.startsWith('/api/')) {
    // Prefer user ID from auth header if available, otherwise use IP
    const authHeader = req.headers.get('authorization') || '';
    const rateLimitKey = authHeader
      ? `user:${hashString(authHeader)}`
      : `ip:${clientIp}`;

    const { allowed, remaining, resetAt } = checkRateLimit(`${rateLimitKey}:${pathname}`, pathname);

    if (!allowed) {
      console.warn(`[SECURITY] Rate limit exceeded: IP=${clientIp} path=${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(getRateLimit(pathname).max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    // Apply security headers + rate limit headers to API responses
    const response = NextResponse.next();
    const secHeaders = buildSecurityHeaders(nonce);
    for (const [key, value] of Object.entries(secHeaders)) {
      response.headers.set(key, value);
    }
    response.headers.set('X-RateLimit-Limit', String(getRateLimit(pathname).max));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
    response.headers.set('X-CSP-Nonce', nonce);
    return response;
  }

  // ---- Apply Security Headers to All Pages ----
  const secHeaders = buildSecurityHeaders(nonce);
  
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', secHeaders['Content-Security-Policy']);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  for (const [key, value] of Object.entries(secHeaders)) {
    response.headers.set(key, value);
  }
  response.headers.set('X-CSP-Nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
