import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

const visitorInfoDevPlugin = (): Plugin => ({
  name: 'visitor-info-dev',
  configureServer(server) {
    server.middlewares.use('/api/visitor-info', (req, res) => {
      const clientIp =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        '127.0.0.1';

      const sanitizedIp = clientIp === '::1' || clientIp === '::ffff:127.0.0.1' ? '127.0.0.1' : clientIp;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(
        JSON.stringify({
          ip: sanitizedIp,
          ipVersion: sanitizedIp.includes(':') ? 'IPv6' : 'IPv4',
          country: 'Cloudflare Edge',
          region: 'Edge PoP',
          city: 'Local Dev Node',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          isp: 'Cloudflare Connected Network',
          colo: 'DEV',
          httpProtocol: 'HTTP/1.1',
          timestamp: new Date().toISOString()
        })
      );
    });
  }
});

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), visitorInfoDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
