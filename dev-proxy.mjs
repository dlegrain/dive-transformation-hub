// Local dev proxy for AI Advisor — mimics the Supabase Edge Function
// Run with: node dev-proxy.mjs

import http from 'http';
import https from 'https';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY environment variable is required');
  console.error('Run with: ANTHROPIC_API_KEY=sk-ant-... node dev-proxy.mjs');
  process.exit(1);
}
const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, apikey');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/functions/v1/ai-advisor') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const { systemPrompt, messages } = JSON.parse(body);

    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const proxyReq = https.request(options, (proxyRes) => {
      let data = '';
      proxyRes.on('data', (chunk) => data += chunk);
      proxyRes.on('end', () => {
        try {
          const result = JSON.parse(data);
          const content = result.content?.[0]?.text || 'No response generated.';
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ content }));
        } catch (e) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Parse error', details: data }));
        }
      });
    });

    proxyReq.on('error', (e) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(e) }));
    });

    proxyReq.write(payload);
    proxyReq.end();
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`AI Advisor proxy running on http://localhost:${PORT}`);
  console.log('Proxying to Claude API...');
});
