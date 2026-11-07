export interface VisitorTelemetry {
  // IP & Geolocation
  ip: string;
  ipVersion: 'IPv4' | 'IPv6';
  country?: string | null;
  region?: string | null;
  city?: string | null;
  postalCode?: string | null;
  timezone?: string | null;
  asn?: string | null;
  isp?: string | null;
  colo?: string | null;
  tlsVersion?: string | null;

  // Browser & Engine
  browserName: string;
  browserVersion: string;
  engine: string;
  userAgent: string;
  languages: string[];
  primaryLanguage: string;
  cookieEnabled: boolean;
  localStorageAvailable: boolean;
  pdfViewerEnabled?: boolean;
  doNotTrack?: string | null;

  // Operating System & Device
  osName: string;
  osVersion: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  platform: string;
  touchSupport: boolean;
  maxTouchPoints: number;
  cpuCores?: string | number;
  deviceMemoryGb?: string | number;

  // Display & Screen
  screenResolution: string;
  viewportSize: string;
  devicePixelRatio: number;
  colorDepth: number;
  screenOrientation: string;

  // Network Connection (if supported by browser)
  connectionType?: string;
  effectiveType?: string;
  downlinkSpeed?: string;
  roundTripTime?: string;
  saveData?: boolean;

  // Status
  timestamp: string;
  source: 'Cloudflare Edge' | 'Direct Lookup';
}

function parseBrowserDetails(ua: string): {
  browserName: string;
  browserVersion: string;
  engine: string;
} {
  let browserName = 'Unknown Browser';
  let browserVersion = 'Unknown';
  let engine = 'Unknown Engine';

  if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browserName = 'Mozilla Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/i)?.[1] || '';
    engine = 'Gecko';
  } else if (/Edg\/([0-9.]+)/i.test(ua)) {
    browserName = 'Microsoft Edge';
    browserVersion = ua.match(/Edg\/([0-9.]+)/i)?.[1] || '';
    engine = 'Blink';
  } else if (/OPR\/([0-9.]+)/i.test(ua) || /Opera\/([0-9.]+)/i.test(ua)) {
    browserName = 'Opera';
    browserVersion = (ua.match(/OPR\/([0-9.]+)/i) || ua.match(/Opera\/([0-9.]+)/i))?.[1] || '';
    engine = 'Blink';
  } else if (/Chrome\/([0-9.]+)/i.test(ua) && !/Edg/i.test(ua)) {
    browserName = 'Google Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/i)?.[1] || '';
    engine = 'Blink';
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browserName = 'Apple Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/i)?.[1] || ua.match(/Safari\/([0-9.]+)/i)?.[1] || '';
    engine = 'WebKit';
  }

  return { browserName, browserVersion, engine };
}

function parseOperatingSystem(ua: string): {
  osName: string;
  osVersion: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
} {
  let osName = 'Unknown OS';
  let osVersion = 'Unknown';
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';

  if (/iPhone/i.test(ua)) {
    osName = 'iOS (iPhone)';
    deviceType = 'Mobile';
    const match = ua.match(/OS (\d+[_.]\d+)/i);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (/iPad/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua))) {
    osName = 'iPadOS';
    deviceType = 'Tablet';
    const match = ua.match(/OS (\d+[_.]\d+)/i);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (/Android/i.test(ua)) {
    osName = 'Android';
    deviceType = /Mobile/i.test(ua) ? 'Mobile' : 'Tablet';
    const match = ua.match(/Android\s([0-9.]+)/i);
    osVersion = match ? match[1] : '';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    osName = 'macOS';
    deviceType = 'Desktop';
    const match = ua.match(/Mac OS X (\d+[_.]\d+)/i);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (/Windows NT/i.test(ua)) {
    osName = 'Windows';
    deviceType = 'Desktop';
    const match = ua.match(/Windows NT ([0-9.]+)/i);
    if (match) {
      const ver = match[1];
      if (ver === '10.0') osVersion = '10 / 11';
      else if (ver === '6.3') osVersion = '8.1';
      else if (ver === '6.1') osVersion = '7';
      else osVersion = ver;
    }
  } else if (/Linux/i.test(ua)) {
    osName = 'Linux';
    deviceType = 'Desktop';
  } else if (/CrOS/i.test(ua)) {
    osName = 'ChromeOS';
    deviceType = 'Desktop';
  }

  return { osName, osVersion, deviceType };
}

function checkLocalStorage(): boolean {
  try {
    const testKey = '__test_storage__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export async function detectVisitorTelemetry(): Promise<VisitorTelemetry> {
  const ua = navigator.userAgent;
  const { browserName, browserVersion, engine } = parseBrowserDetails(ua);
  const { osName, osVersion, deviceType } = parseOperatingSystem(ua);

  let ip = 'Resolving...';
  let ipVersion: 'IPv4' | 'IPv6' = 'IPv4';
  let country: string | null = null;
  let region: string | null = null;
  let city: string | null = null;
  let timezone: string | null = null;
  let asn: string | null = null;
  let isp: string | null = null;
  let colo: string | null = null;
  let tlsVersion: string | null = null;
  let source: 'Cloudflare Edge' | 'Direct Lookup' = 'Cloudflare Edge';

  // 1. Try Cloudflare Pages Function endpoint first
  try {
    const response = await fetch('/api/visitor-info', {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.ip && data.ip !== '127.0.0.1' && !data.ip.startsWith('192.168.')) {
        ip = data.ip;
        ipVersion = data.ipVersion || (ip.includes(':') ? 'IPv6' : 'IPv4');
        country = data.country || null;
        region = data.region || null;
        city = data.city || null;
        timezone = data.timezone || null;
        asn = data.asn || null;
        isp = data.isp || null;
        colo = data.colo || null;
        tlsVersion = data.tlsVersion || null;
      }
    }
  } catch {
    // Edge function not reachable or in static mode
  }

  // 2. Fallback to public IP lookup if local or unresolved
  if (ip === 'Resolving...' || ip === '127.0.0.1') {
    try {
      const publicIpRes = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      if (publicIpRes.ok) {
        const ipData = await publicIpRes.json();
        if (ipData.ip) {
          ip = ipData.ip;
          ipVersion = ip.includes(':') ? 'IPv6' : 'IPv4';
          source = 'Direct Lookup';
        }
      }
    } catch {
      // Offline or network error
      ip = 'Direct Connection';
    }
  }

  // Fallback timezone from client browser if not detected from IP
  if (!timezone) {
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      timezone = 'UTC';
    }
  }

  // Network connection API (Chromium / modern browsers)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const navConn = (navigator as unknown as { connection?: Record<string, unknown> }).connection;
  let connectionType: string | undefined;
  let effectiveType: string | undefined;
  let downlinkSpeed: string | undefined;
  let roundTripTime: string | undefined;
  let saveData: boolean | undefined;

  if (navConn) {
    connectionType = (navConn.type as string) || undefined;
    effectiveType = (navConn.effectiveType as string)?.toUpperCase();
    if (navConn.downlink) downlinkSpeed = `${navConn.downlink} Mbps`;
    if (navConn.rtt) roundTripTime = `${navConn.rtt} ms`;
    saveData = typeof navConn.saveData === 'boolean' ? navConn.saveData : undefined;
  }

  // Screen and viewport measurements
  const screenResolution = `${window.screen?.width || 0} × ${window.screen?.height || 0}`;
  const viewportSize = `${window.innerWidth} × ${window.innerHeight}`;
  const devicePixelRatio = Math.round((window.devicePixelRatio || 1) * 100) / 100;
  const colorDepth = window.screen?.colorDepth || 24;

  let screenOrientation = 'Unknown';
  try {
    screenOrientation = screen.orientation?.type || (window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait');
  } catch {
    screenOrientation = window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait';
  }

  // Hardware capabilities (where supported by browser without fingerprinting)
  const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'Not disclosed';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const deviceMemoryGb = rawMemory ? `~${rawMemory} GB` : 'Not disclosed';

  return {
    ip,
    ipVersion,
    country,
    region,
    city,
    timezone,
    asn,
    isp,
    colo,
    tlsVersion,
    browserName,
    browserVersion,
    engine,
    userAgent: ua,
    languages: Array.from(navigator.languages || [navigator.language]),
    primaryLanguage: navigator.language || 'en',
    cookieEnabled: navigator.cookieEnabled,
    localStorageAvailable: checkLocalStorage(),
    pdfViewerEnabled: (navigator as unknown as { pdfViewerEnabled?: boolean }).pdfViewerEnabled,
    doNotTrack: navigator.doNotTrack,
    osName,
    osVersion,
    deviceType,
    platform: navigator.platform || 'Unknown',
    touchSupport: navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    cpuCores,
    deviceMemoryGb,
    screenResolution,
    viewportSize,
    devicePixelRatio,
    colorDepth,
    screenOrientation,
    connectionType,
    effectiveType,
    downlinkSpeed,
    roundTripTime,
    saveData,
    timestamp: new Date().toLocaleTimeString(),
    source
  };
}
