
// Security utilities for input validation and sanitization

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Basic XSS prevention - remove potentially dangerous characters
  return text
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol) && url.length <= 2048;
  } catch {
    return false;
  }
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

export const validatePrice = (price: number): boolean => {
  return Number.isInteger(price) && price > 0 && price <= 1000000;
};

export const validatePoints = (points: number): boolean => {
  return Number.isInteger(points) && points >= 0 && points <= 100000;
};

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  return true;
};
