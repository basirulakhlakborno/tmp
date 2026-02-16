import 'dotenv/config';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleRequest } from './src/router.js';
import { processChatStreaming } from './src/services/chatProcessorStream.js';

const PORT = process.env.PORT || 4989;

function toNetlifyEvent(req, body) {
  const [path, rawQueryString = ''] = (req.url || '/').split('?');
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k.toLowerCase()] = v;
  }
  return {
    httpMethod: req.method || 'GET',
    path: path || '/',
    rawPath: path || '/',
    rawQueryString: rawQueryString.trim(),
    headers,
    body: body || '',
    isBase64Encoded: false,
  };
}

function sendResponse(res, { statusCode = 200, headers = {}, body = '' }) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

const server = createServer(async (req, res) => {
  let body = '';
  if (req.method === 'POST' || req.method === 'PUT') {
    for await (const chunk of req) body += chunk.toString();
  }
  const event = toNetlifyEvent(req, body);
  const result = await handleRequest(event, {});
  sendResponse(res, result);
});

// WebSocket server for chat
const wss = new WebSocketServer({ server, path: '/chat' });

wss.on('connection', (ws) => {
  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'chat') return;

      const send = (obj) => {
        if (ws.readyState === 1) ws.send(JSON.stringify(obj));
      };
      const sendBinary = (buf) => {
        if (ws.readyState === 1) ws.send(buf);
      };

      await processChatStreaming(msg.payload || msg, send, sendBinary);
    } catch (e) {
      console.error('WebSocket chat error:', e);
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'error', error: String(e) }));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Voice API running at http://localhost:${PORT}`);
  console.log(`  GET  /           - info`);
  console.log(`  GET  /tts?q=...  - TTS`);
  console.log(`  WS   /chat        - chat (WebSocket)`);
});
