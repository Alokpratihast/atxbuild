// lib/rateLimiter.ts

type ClientRecord = {
  count: number;
  timestamp: number;
};

const rateLimitWindow = 60 * 1000; // 1 minute
const maxRequests = 20; // per minute per IP

const ipMap = new Map<string, ClientRecord>();

export function rateLimit(ip: string) {
  const now = Date.now();
  const record = ipMap.get(ip);

  if (!record) {
    ipMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (now - record.timestamp > rateLimitWindow) {
    // Reset window
    ipMap.set(ip, { count: 1, timestamp: now });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    return { allowed: false };
  }

  record.count++;
  ipMap.set(ip, record);
  return { allowed: true };
}
