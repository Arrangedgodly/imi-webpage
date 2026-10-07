const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const root = path.resolve(__dirname, '..');
  const cleanUrl = req.url.split('?')[0];

  // Route root "/" or "/index.html" directly to preview page
  if (cleanUrl === '/' || cleanUrl === '/index.html') {
    res.writeHead(302, { 'Location': '/gemini-art/index.html' });
    return res.end();
  }

  // Ensure trailing slash on directory paths to avoid relative asset path breakage
  if (cleanUrl === '/gemini-art') {
    res.writeHead(301, { 'Location': '/gemini-art/' });
    return res.end();
  }

  let relPath = decodeURI(cleanUrl);
  let filePath = path.join(root, relPath);

  // If path is a directory, look for index.html inside it
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Fallback: if script was requested from root instead of /gemini-art/, look inside gemini-art/
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const fallbackPath = path.join(__dirname, path.basename(relPath));
    if (fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).isFile()) {
      filePath = fallbackPath;
    }
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    console.log(`[404] ${req.method} ${req.url} -> Not Found`);
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('404 Not Found');
  }

  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(`[500] ${filePath}: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('500 Internal Server Error');
    }
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Content-Length': Buffer.byteLength(data),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
    console.log(`[200] ${req.method} ${req.url} (${Buffer.byteLength(data)} bytes)`);
  });
});

// Listen on all network interfaces (dual stack IPv4 and IPv6)
const PORT = 8192;
server.listen(PORT, () => {
  console.log(`Typewriter Ops Art Preview Server listening on:`);
  console.log(`  -> http://localhost:${PORT}/gemini-art/index.html`);
  console.log(`  -> http://127.0.0.1:${PORT}/gemini-art/index.html`);
});
