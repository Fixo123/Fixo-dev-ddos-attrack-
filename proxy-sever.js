// proxy-server.js - RENDER VERSION
const http = require('http');
const https = require('https');
const url = require('url');

// ⭐ Render එක auto assign කරන PORT එක පාවිච්චි කරන්න
const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent, Accept, Cache-Control');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            message: 'Proxy server is running on Render!'
        }));
        return;
    }

    // Proxy endpoint
    const parsedUrl = url.parse(req.url, true);
    const target = parsedUrl.query.url;

    if (!target) {
        res.writeHead(400);
        res.end(JSON.stringify({
            error: 'Missing url parameter',
            usage: '/proxy?url=https://example.com'
        }));
        return;
    }

    console.log(`📥 [${new Date().toLocaleTimeString()}] Proxying: ${target}`);

    const client = target.startsWith('https') ? https : http;
    const startTime = Date.now();

    client.get(target, (response) => {
        const timeTaken = Date.now() - startTime;
        console.log(`✅ [${new Date().toLocaleTimeString()}] ${response.statusCode} - ${timeTaken}ms`);
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
    }).on('error', (err) => {
        console.log(`❌ [${new Date().toLocaleTimeString()}] Error: ${err.message}`);
        res.writeHead(500);
        res.end(JSON.stringify({
            error: 'Proxy error',
            message: err.message
        }));
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('✅ PROXY SERVER IS RUNNING!');
    console.log('='.repeat(50));
    console.log(`📌 Port: ${PORT}`);
    console.log(`🔄 Proxy endpoint: /proxy?url=https://example.com`);
    console.log(`💚 Health check: /health`);
    console.log('='.repeat(50));
    console.log('⚠️  මෙය අධ්‍යාපනික අරමුණු සඳහා පමණයි!');
    console.log('='.repeat(50));
});
