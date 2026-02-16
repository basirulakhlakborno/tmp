import { addCorsHeaders, jsonResponse } from './utils/http.js';
import { buildRequestUrl, getMethod } from './utils/request.js';

import { handleRoot } from './routes/root.js';
import { handleTestSearch } from './routes/testSearch.js';
import { handleTts } from './routes/tts.js';
import { handleNotFound } from './routes/notFound.js';

// Central router for the Netlify function
export async function handleRequest(event, context) {
  try {
    const method = getMethod(event);

    // Preflight CORS
    if (method === 'OPTIONS') {
      return addCorsHeaders({
        statusCode: 200,
        headers: {},
        body: '',
      });
    }

    const url = buildRequestUrl(event);
    const corsify = (response) => addCorsHeaders(response);

    // /test-search
    if (url.pathname === '/test-search') {
      return handleTestSearch({ url, corsify });
    }

    // Root
    if (url.pathname === '/') {
      return handleRoot({ corsify });
    }

    // /tts and /tts/stream
    const ttsResult = await handleTts({ url, method, corsify });
    if (ttsResult) return ttsResult;

    // Fallback 404
    return handleNotFound({ corsify });
  } catch (e) {
    console.error('Unhandled error in Netlify function:', e);
    return addCorsHeaders(
      jsonResponse(500, {
        error: String(e),
      }),
    );
  }
}

