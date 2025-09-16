// Security utilities for input validation and sanitization

import DOMPurify from 'dompurify';

export const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Use DOMPurify for comprehensive XSS protection
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Additional sanitization for dangerous patterns
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:(?!image\/[a-z]+;base64,)/gi, '') // Only remove data: if not a valid image data URL
    .trim();
};

export const sanitizeTextWithSpaces = (text: string): string => {
  if (!text) return '';
  
  // Use DOMPurify for comprehensive XSS protection but preserve spaces
  const sanitized = DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Additional sanitization for dangerous patterns but keep leading/trailing spaces
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
    .replace(/data:(?!image\/[a-z]+;base64,)/gi, ''); // Only remove data: if not a valid image data URL
};

export const sanitizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  // For data URLs (uploaded images), don't remove the data: prefix
  if (url.startsWith('data:image/')) {
    // Use DOMPurify but keep the data URL intact
    return DOMPurify.sanitize(url, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
  }
  
  // For regular URLs, use standard sanitization
  return sanitizeText(url);
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  // Detect if it's an EPUB URL (don't sanitize URLs)
  if (typeof html === 'string' && (html.startsWith('http') || html.startsWith('data:'))) {
    return html;
  }
  
  // Allow safe HTML tags for rich content
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'data:'].includes(urlObj.protocol) && url.length <= 2048;
  } catch {
    return false;
  }
};

export const validateImageUrl = (url: string): boolean => {
  try {
    // Allow data URLs for uploaded images
    if (url.startsWith('data:image/')) {
      return url.length <= 10 * 1024 * 1024; // Max 10MB for base64 images
    }
    
    // For regular URLs
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

export const validateFileName = (fileName: string): boolean => {
  // More permissive filename validation - only block truly dangerous patterns
  const dangerousPatterns = [
    /\.exe$/i, /\.scr$/i, /\.bat$/i, /\.cmd$/i, /\.com$/i, /\.pif$/i,
    /\.vbs$/i, /\.wsf$/i, /\.sh$/i, /\.pl$/i, /\.cgi$/i
  ];
  
  // Allow common characters including colons, apostrophes, spaces, parentheses
  const invalidChars = /[<>"|*?\\\/\x00-\x1f\x7f]/;
  
  return !dangerousPatterns.some(pattern => pattern.test(fileName)) && 
         fileName.length <= 500 &&
         fileName.length > 0 &&
         !invalidChars.test(fileName) &&
         !fileName.startsWith('.') &&
         !fileName.endsWith('.');
};

export const validateMimeTypeByHeader = async (file: File, expectedTypes: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 8);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16).padStart(2, '0');
      }
      
      // More flexible file signatures
      const signatures: Record<string, string[]> = {
        'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2', 'ffd8ffe3', 'ffd8ffe8', 'ffd8ffdb'],
        'image/png': ['89504e47'],
        'application/pdf': ['25504446'], // %PDF
        'audio/mp3': ['494433', 'fffb', 'fff3', 'fff2'],
        'audio/wav': ['52494646'],
        'audio/ogg': ['4f676753'],
        'audio/m4a': ['00000020667479704d344120', '00000018667479704d344120']
      };
      
      // Be more permissive - if we can't validate the header, allow it through
      if (expectedTypes.includes('application/pdf')) {
        // For PDFs, be more flexible as some PDFs might have slight variations
        const isValidPdf = header.startsWith('25504446') || // Standard %PDF
                          file.name.toLowerCase().endsWith('.pdf');
        resolve(isValidPdf);
      } else {
        const isValid = expectedTypes.some(type => 
          signatures[type]?.some(sig => header.startsWith(sig.toLowerCase()))
        );
        resolve(isValid);
      }
    };
    
    reader.onerror = () => {
      // If we can't read the file header, be permissive
      resolve(true);
    };
    
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
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

// Enhanced rate limiting with user-specific tracking
const requestCounts = new Map<string, { count: number; resetTime: number; lastRequest: number }>();

export const checkRateLimit = (identifier: string, maxRequests: number, windowMs: number): boolean => {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || now > userRequests.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs, lastRequest: now });
    return true;
  }

  // Additional protection against rapid requests
  if (now - userRequests.lastRequest < 100) { // Minimum 100ms between requests
    return false;
  }

  if (userRequests.count >= maxRequests) {
    return false;
  }

  userRequests.count++;
  userRequests.lastRequest = now;
  return true;
};

// Input sanitization for tags with UTF-8 support
export const sanitizeTag = (tag: string): string => {
  if (!tag) return '';
  
  // Use DOMPurify for XSS protection
  const sanitized = DOMPurify.sanitize(tag, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  return sanitized
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data: URIs
    .replace(/[<>"|*?\\\/\x00-\x1f\x7f]/g, '') // Remove dangerous characters but keep spaces
    .substring(0, 50);
};

// Content Security Policy helper
export const getCSPDirectives = (): string => {
  return [
    "default-src 'self' blob: data: https:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' blob:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "connect-src 'self' blob: data: https: wss: https://aotzivwzoxmnnawcxioo.supabase.co",
    "font-src 'self' data: blob:",
    "object-src 'self' data:",
    "frame-src 'self' data: blob:",
    "child-src 'self' data: blob:",
    "worker-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
};
