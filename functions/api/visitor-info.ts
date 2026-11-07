interface CloudflarePagesContext {
  request: Request;
  env?: Record<string, unknown>;
  params?: Record<string, string | string[]>;
  waitUntil?: (promise: Promise<unknown>) => void;
  next?: () => Promise<Response>;
  data?: Record<string, unknown>;
}

// Cloudflare Pages Functions endpoint: /api/visitor-info
export const onRequest = async (context: CloudflarePagesContext): Promise<Response> => {
  const { request } = context;

  // Retrieve client IP from Cloudflare's verified headers
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  // Cloudflare request metadata
  const cf = (request as unknown as { cf?: Record<string, unknown> }).cf || {};

  const ipVersion = clientIp.includes(':') ? 'IPv6' : 'IPv4';

  const payload = {
    ip: clientIp,
    ipVersion,
    country: (cf.country as string) || null,
    region: (cf.region as string) || (cf.regionCode as string) || null,
    city: (cf.city as string) || null,
    postalCode: (cf.postalCode as string) || null,
    metroCode: (cf.metroCode as string) || null,
    latitude: (cf.latitude as string | number) || null,
    longitude: (cf.longitude as string | number) || null,
    timezone: (cf.timezone as string) || null,
    asn: cf.asn ? `AS${cf.asn}` : null,
    isp: (cf.asOrganization as string) || null,
    colo: (cf.colo as string) || null,
    httpProtocol: (cf.httpProtocol as string) || null,
    tlsVersion: (cf.tlsVersion as string) || null,
    tlsCipher: (cf.tlsCipher as string) || null,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
};
