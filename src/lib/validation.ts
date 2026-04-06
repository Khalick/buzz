/**
 * BizHub Input Validation Library
 * 
 * Based on: OWASP Input Validation Cheat Sheet, NIST SP 800-53,
 * Stanford Web Security Guidelines, MIT CSAIL Secure Coding
 * 
 * Use these validators on ALL API routes before processing user input.
 */

// ---- Character allowlists ----
const SAFE_TEXT_PATTERN = /^[\w\s\-'.,!?@#&()\u00C0-\u024F\u4e00-\u9fff]+$/u; // letters, numbers, common punctuation + unicode
const SAFE_NAME_PATTERN = /^[\w\s\-'.]{1,100}$/u;
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const URL_SAFE_PATTERN = /^https?:\/\/([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i;
const PHONE_PATTERN = /^\+?[\d\s\-().]{7,20}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NUMERIC_PATTERN = /^\d+(\.\d{1,2})?$/;

/** Characters that must never appear in any user input */
const DANGEROUS_CHARS = /[<>'"`;\\]/g;

/** SQL injection patterns */
const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|xp_|sp_)\b)/gi,
  /--\s|\/\*|\*\//g,
  /;\s*(drop|delete|update|insert)/gi,
];

/** XSS attack patterns */
const XSS_PATTERNS = [
  /<script[\s\S]*?>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi, // onerror=, onload=, etc.
  /data:text\/html/gi,
  /vbscript:/gi,
  /<\s*iframe/gi,
  /<\s*object/gi,
  /<\s*embed/gi,
];

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize a string to remove potentially dangerous characters.
 * Always prefer validation over sanitization, but use this as a backstop.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(DANGEROUS_CHARS, '') // remove dangerous chars
    .replace(/\s+/g, ' ')          // collapse whitespace
    .trim();
}

/** Check for SQL injection patterns */
export function hasSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/** Check for XSS patterns */
export function hasXssPayload(input: string): boolean {
  return XSS_PATTERNS.some((pattern) => pattern.test(input));
}

/** Validate and sanitize any text field */
export function validateText(
  value: unknown,
  field: string,
  options: { minLength?: number; maxLength?: number; required?: boolean } = {}
): string {
  const { minLength = 1, maxLength = 5000, required = true } = options;

  if (value === undefined || value === null || value === '') {
    if (required) throw new ValidationError(`${field} is required`, field);
    return '';
  }
  if (typeof value !== 'string') throw new ValidationError(`${field} must be a string`, field);

  const trimmed = value.trim();
  if (required && trimmed.length === 0) throw new ValidationError(`${field} cannot be empty`, field);
  if (trimmed.length < minLength) throw new ValidationError(`${field} must be at least ${minLength} characters`, field);
  if (trimmed.length > maxLength) throw new ValidationError(`${field} must be at most ${maxLength} characters`, field);

  if (hasSqlInjection(trimmed)) throw new ValidationError(`${field} contains invalid characters`, field);
  if (hasXssPayload(trimmed)) throw new ValidationError(`${field} contains invalid content`, field);

  return trimmed;
}

/** Validate a business/person name */
export function validateName(value: unknown, field: string = 'name'): string {
  const text = validateText(value, field, { maxLength: 100 });
  if (!SAFE_NAME_PATTERN.test(text)) {
    throw new ValidationError(`${field} contains invalid characters`, field);
  }
  return text;
}

/** Validate an email address */
export function validateEmail(value: unknown, field: string = 'email'): string {
  const text = validateText(value, field, { maxLength: 254 });
  if (!EMAIL_PATTERN.test(text)) {
    throw new ValidationError(`${field} must be a valid email address`, field);
  }
  return text.toLowerCase();
}

/** Validate a URL */
export function validateUrl(value: unknown, field: string = 'url', required = false): string {
  if (!value || value === '') {
    if (required) throw new ValidationError(`${field} is required`, field);
    return '';
  }
  const text = validateText(value, field, { maxLength: 2048, required });
  if (!URL_SAFE_PATTERN.test(text)) {
    throw new ValidationError(`${field} must be a valid URL starting with http:// or https://`, field);
  }
  return text;
}

/** Validate a phone number */
export function validatePhone(value: unknown, field: string = 'phone', required = false): string {
  if (!value || value === '') {
    if (required) throw new ValidationError(`${field} is required`, field);
    return '';
  }
  const text = validateText(value, field, { maxLength: 20, required });
  if (!PHONE_PATTERN.test(text)) {
    throw new ValidationError(`${field} must be a valid phone number`, field);
  }
  return text;
}

/** Validate a UUID (for IDs) */
export function validateUuid(value: unknown, field: string = 'id'): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new ValidationError(`Invalid ${field}`, field);
  }
  return value.toLowerCase();
}

/** Validate a numeric value within bounds */
export function validateNumber(
  value: unknown,
  field: string,
  options: { min?: number; max?: number; integer?: boolean; required?: boolean } = {}
): number {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false, required = true } = options;
  if (value === undefined || value === null || value === '') {
    if (!required) return 0;
    throw new ValidationError(`${field} is required`, field);
  }
  const num = Number(value);
  if (isNaN(num)) throw new ValidationError(`${field} must be a number`, field);
  if (integer && !Number.isInteger(num)) throw new ValidationError(`${field} must be a whole number`, field);
  if (num < min) throw new ValidationError(`${field} must be at least ${min}`, field);
  if (num > max) throw new ValidationError(`${field} must be at most ${max}`, field);
  return num;
}

/** Validate a rating (1-5 stars) */
export function validateRating(value: unknown): number {
  return validateNumber(value, 'rating', { min: 1, max: 5, integer: true });
}

/** Validate a category against an allowlist */
export function validateCategory(value: unknown, allowedCategories: string[]): string {
  const text = validateText(value, 'category', { maxLength: 100 });
  if (!allowedCategories.includes(text)) {
    throw new ValidationError(`Invalid category. Must be one of: ${allowedCategories.join(', ')}`);
  }
  return text;
}

/** Validate a pagination cursor/page number */
export function validatePagination(page: unknown, limit: unknown): { page: number; limit: number } {
  const p = validateNumber(page, 'page', { min: 1, max: 10000, integer: true, required: false }) || 1;
  const l = validateNumber(limit, 'limit', { min: 1, max: 100, integer: true, required: false }) || 20;
  return { page: p, limit: l };
}

/** 
 * Validate the Origin header against trusted origins (CSRF protection).
 * Call this on any state-mutating API route (POST/PUT/DELETE).
 */
export function validateOrigin(
  originHeader: string | null,
  refererHeader: string | null
): boolean {
  const trustedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://thikabizhub.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter(Boolean) as string[];

  const origin = originHeader || refererHeader || '';
  if (!origin) return false; // no origin = suspicious for mutating ops

  return trustedOrigins.some((trusted) => origin.startsWith(trusted));
}

/**
 * Standard API error response wrapper.
 * Never expose internal error messages in production.
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = 'An error occurred',
  status = 500
): Response {
  const isDev = process.env.NODE_ENV === 'development';
  const message = error instanceof ValidationError
    ? error.message
    : isDev && error instanceof Error
      ? error.message
      : defaultMessage;

  // Log internally but don't expose to client in production
  if (!(error instanceof ValidationError)) {
    console.error('[API Error]', error);
  }

  return Response.json({ error: message }, { status: error instanceof ValidationError ? 400 : status });
}
