// Local dev proxy for AI Advisor — mimics the Supabase Edge Function
// Run with: node dev-proxy.mjs (reads ANTHROPIC_API_KEY from .env)

import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

// Load .env file
try {
  const envContent = readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  }
} catch { /* no .env file */ }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not found in .env or environment');
  process.exit(1);
}
const LANGFUSE_PUBLIC_KEY = process.env.LANGFUSE_PUBLIC_KEY;
const LANGFUSE_SECRET_KEY = process.env.LANGFUSE_SECRET_KEY;
const LANGFUSE_HOST = process.env.LANGFUSE_HOST ?? 'https://cloud.langfuse.com';

async function langfuseTrace(traceId, generationId, input, output, model, usage) {
  if (!LANGFUSE_PUBLIC_KEY || !LANGFUSE_SECRET_KEY) return;
  const auth = Buffer.from(`${LANGFUSE_PUBLIC_KEY}:${LANGFUSE_SECRET_KEY}`).toString('base64');
  const now = new Date().toISOString();
  await fetch(`${LANGFUSE_HOST}/api/public/ingestion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
    body: JSON.stringify({
      batch: [
        {
          id: traceId,
          type: 'trace-create',
          timestamp: now,
          body: { id: traceId, name: 'ai-advisor', timestamp: now },
        },
        {
          id: generationId,
          type: 'generation-create',
          timestamp: now,
          body: {
            id: generationId,
            traceId,
            name: 'claude-response',
            model,
            input,
            output,
            startTime: now,
            endTime: now,
            usage: { input: usage.input, output: usage.output, total: usage.total },
          },
        },
      ],
    }),
  }).catch(() => { /* silencieux */ });
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
      proxyRes.on('end', async () => {
        try {
          const result = JSON.parse(data);
          const content = result.content?.[0]?.text || 'No response generated.';

          // Langfuse tracing
          const { randomUUID } = await import('crypto');
          const traceId = randomUUID();
          const generationId = randomUUID();
          const usage = {
            input: result.usage?.input_tokens ?? 0,
            output: result.usage?.output_tokens ?? 0,
            total: (result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0),
          };
          await langfuseTrace(traceId, generationId, { system: systemPrompt, messages }, content, 'claude-sonnet-4-20250514', usage);

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
