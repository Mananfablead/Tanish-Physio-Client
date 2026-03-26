import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import prerender from 'prerender-node';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Compression (gzip/brotli where supported by Node)
app.use(compression());

// Enable prerendering for crawlers
app.use(prerender.set('prerenderToken', process.env.PRERENDER_TOKEN || 'demo'));

// Serve static files from dist directory
app.use(
  express.static(path.join(__dirname, 'dist'), {
    setHeaders(res, filePath) {
      // Cache immutable, hashed build assets aggressively.
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }

      // Cache images aggressively (your build outputs are content-hashed or generated at build time).
      if (filePath.match(/\.(png|jpg|jpeg|webp|avif|svg|ico)$/i)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        return;
      }

      // Do not cache HTML (so new deploys are picked up immediately).
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-store');
      }
    },
  })
);

// Handle all routes by serving index.html for SPA
app.get('*', (req, res) => {
    // Check if it's a known route that should return 404
    const knownRoutes = [
        '/',
        '/services',
        '/about',
        '/contact',
        '/faq',
        '/therapists',
        '/plans',
        '/free-consultation',
        '/login',
        '/register',
        '/forgot-password',
        '/terms',
        '/testimonials',
        '/profile',
        '/booking',
        '/coming-soon',
        '/invoice',
        '/reset-password',
        '/chat-history',
        '/video-call',
        '/booking-confirmation',
        '/group-sessions',
        '/group-sessions/register',
        '/group-video-call',
        '/recorded-sessions',
        '/schedule'
    ];

    // Check if it's a service route (dynamic)
    const isServiceRoute = req.path.startsWith('/service/');
    const isKnownRoute = knownRoutes.includes(req.path) || isServiceRoute;

    if (!isKnownRoute) {
        // Return 404 for unknown routes
        res
          .status(404)
          .set('Cache-Control', 'no-store')
          .sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        // Serve the app for known routes
        res
          .set('Cache-Control', 'no-store')
          .sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Prerendering enabled for SEO crawlers`);
});