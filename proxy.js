// proxy-server.js
const http = require('http');
const https = require('https');
const url = require('url');

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    
    const parsedUrl = url.parse(req.url, true);
    const target = parsedUrl.query.url;
    
    if (!target) {
        res.writeHead(400);
        res.end('Missing url parameter');
        return;
    }
    
    console.log(`📥 Proxying: ${target}`);
    
    const client = target.startsWith('https') ? https : http;
    const startTime = Date.now();
    
    client.get(target, (response) => {
        const timeTaken = Date.now() - startTime;
        console.log(`✅ ${response.statusCode} - ${timeTaken}ms`);
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
    }).on('error', (err) => {
        console.log(`❌ Error: ${err.message}`);
        res.writeHead(500);
        res.end(`Proxy error: ${err.message}`);
    });
});

server.listen(8080, () => {
    console.log('✅ Proxy server running on http://localhost:8080');
    console.log('📌 Use: http://localhost:8080/proxy?url=https://example.com');
});
