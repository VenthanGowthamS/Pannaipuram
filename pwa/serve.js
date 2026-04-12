// PWA dev server — serves static files + proxies /api/* to live backend
const http = require('http');
const https = require('https');
const fs   = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.join(__dirname, '..');
const API_HOST = 'pannaipuram-api.onrender.com';

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

http.createServer((req, res) => {
  // Redirect / to /pwa/
  if (req.url === '/') { res.writeHead(302, { Location: '/pwa/' }); res.end(); return; }

  // Proxy /api/* to live backend
  if (req.url.startsWith('/api/')) {
    const opts = {
      hostname: API_HOST,
      port: 443,
      path: req.url,
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };
    const proxy = https.request(opts, (upstream) => {
      res.writeHead(upstream.statusCode, {
        'Content-Type': upstream.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      upstream.pipe(res);
    });
    proxy.on('error', (e) => {
      res.writeHead(502);
      res.end(JSON.stringify({ success: false, error: 'Backend unreachable: ' + e.message }));
    });
    if (req.method === 'POST') req.pipe(proxy);
    else proxy.end();
    return;
  }

  // Static files
  const filePath = path.join(ROOT, req.url === '/pwa/' ? 'pwa/index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + req.url); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('PWA preview at http://localhost:' + PORT + '/pwa/'));
