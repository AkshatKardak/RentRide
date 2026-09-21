/**
 * RentRide - Image Security, Validation & SSRF Defense Utility
 * 
 * Enforces strict SSRF protections, protocol validation, domain allowlisting,
 * content-type verification, payload limits, and duplicate file hashing.
 */

const axios = require('axios');
const crypto = require('crypto');
const { URL } = require('url');

// Trusted external image hosts and CDNs for vehicle photography
const ALLOWED_IMAGE_DOMAINS = new Set([
  'images.unsplash.com',
  'res.cloudinary.com',
  'i.ibb.co',
  'images.pexels.com',
  'upload.wikimedia.org',
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net'
]);

// Maximum permitted image size in bytes (10 MB)
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

// Allowed image MIME types (Strictly no SVG or executable/HTML files)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]);

/**
 * Checks whether an IP or hostname is private, loopback, link-local, or cloud metadata
 * @param {string} host 
 * @returns {boolean}
 */
function isPrivateOrInternalHost(host) {
  if (!host) return true;
  const cleanHost = host.toLowerCase().trim();

  // Loopback & generic internal hostnames
  if (
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost === '0.0.0.0' ||
    cleanHost === '::1' ||
    cleanHost.endsWith('.internal') ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.lan') ||
    cleanHost.endsWith('.localdomain')
  ) {
    return true;
  }

  // IPv4 numerical regex check
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = cleanHost.match(ipv4Regex);
  if (match) {
    const octet1 = parseInt(match[1], 10);
    const octet2 = parseInt(match[2], 10);

    // 127.0.0.0/8 Loopback
    if (octet1 === 127) return true;
    // 10.0.0.0/8 Private
    if (octet1 === 10) return true;
    // 172.16.0.0/12 Private (172.16.x.x - 172.31.x.x)
    if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return true;
    // 192.168.0.0/16 Private
    if (octet1 === 192 && octet2 === 168) return true;
    // 169.254.0.0/16 Link-Local / Cloud Metadata (AWS, GCP, Azure, etc.)
    if (octet1 === 169 && octet2 === 254) return true;
    // 100.64.0.0/10 Carrier-Grade NAT
    if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) return true;
    // 0.0.0.0/8 Current network
    if (octet1 === 0) return true;
  }

  return false;
}

/**
 * Validate format, protocol, and domain security of an image URL
 * @param {string} urlString 
 * @returns {{ valid: boolean, error?: string, sanitizedUrl?: string }}
 */
function validateImageUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, error: 'Image URL must be a non-empty string' };
  }

  const trimmed = urlString.trim();

  // Allow internal relative project assets (e.g. /assets/herocar.png)
  if (trimmed.startsWith('/') || trimmed.startsWith('./assets/') || trimmed.startsWith('assets/')) {
    if (trimmed.includes('..') || trimmed.includes('<') || trimmed.includes('>')) {
      return { valid: false, error: 'Relative asset path contains invalid characters' };
    }
    return { valid: true, sanitizedUrl: trimmed };
  }

  try {
    const parsed = new URL(trimmed);

    // Require HTTPS in production; forbid file:, javascript:, data:, ftp:, etc.
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, error: `Unsupported protocol: ${parsed.protocol}` };
    }

    if (isPrivateOrInternalHost(parsed.hostname)) {
      return { valid: false, error: `Access to internal host is blocked (SSRF defense)` };
    }

    // Domain allowlist check (subdomain-aware matching)
    const host = parsed.hostname.toLowerCase();
    const isDomainAllowed = Array.from(ALLOWED_IMAGE_DOMAINS).some(allowed => 
      host === allowed || host.endsWith('.' + allowed)
    );

    if (!isDomainAllowed) {
      return { valid: false, error: `Host '${host}' is not in the approved CDN domain allowlist` };
    }

    return { valid: true, sanitizedUrl: parsed.toString() };
  } catch (err) {
    return { valid: false, error: `Malformed URL: ${err.message}` };
  }
}

/**
 * Perform a remote probe to verify MIME type, status, and size
 * @param {string} urlString 
 * @param {number} timeoutMs 
 * @returns {Promise<{ reachable: boolean, contentType?: string, contentLength?: number, error?: string }>}
 */
async function probeRemoteImage(urlString, timeoutMs = 3500) {
  const formatCheck = validateImageUrl(urlString);
  if (!formatCheck.valid) {
    return { reachable: false, error: formatCheck.error };
  }

  // Relative asset check
  if (formatCheck.sanitizedUrl.startsWith('/') || formatCheck.sanitizedUrl.startsWith('assets/')) {
    return { reachable: true, contentType: 'image/png' };
  }

  try {
    const response = await axios.head(formatCheck.sanitizedUrl, {
      timeout: timeoutMs,
      maxRedirects: 3,
      validateStatus: status => status >= 200 && status < 400
    });

    const contentType = (response.headers['content-type'] || '').toLowerCase().split(';')[0].trim();
    const contentLength = parseInt(response.headers['content-length'] || '0', 10);

    if (contentLength > MAX_IMAGE_SIZE_BYTES) {
      return { reachable: false, error: `Image exceeds maximum permitted size of 10MB (${contentLength} bytes)` };
    }

    if (!ALLOWED_MIME_TYPES.has(contentType)) {
      return { reachable: false, error: `Invalid MIME type '${contentType}'. Allowed: JPEG, PNG, WebP` };
    }

    return {
      reachable: true,
      contentType,
      contentLength
    };
  } catch (err) {
    return {
      reachable: false,
      error: `Probe failed: ${err.response?.status || err.message}`
    };
  }
}

/**
 * Compute SHA-256 fingerprint of image data for duplicate tracking
 * @param {Buffer|string} data 
 * @returns {string}
 */
function computeImageHash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

module.exports = {
  ALLOWED_IMAGE_DOMAINS,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
  isPrivateOrInternalHost,
  validateImageUrl,
  probeRemoteImage,
  computeImageHash
};
