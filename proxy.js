const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8080;

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const target = parsedUrl.query.url;

    if (!target) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Missing url' }));
        return;
    }

    const client = target.startsWith('https') ? https : http;
    client.get(target, (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
    }).on('error', (err) => {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
    });
});

server.listen(PORT, () => {
    console.log(`✅ Local proxy running on http://localhost:${PORT}`);
});
