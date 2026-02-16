import { jsonResponse } from '../utils/http.js';

export function handleRoot({ corsify }) {
  const info = {
    message: 'Voice TTS Server on Netlify Function (Node)',
    endpoints: {
      '/tts': 'GET /tts?q=text&voice=kore (JSON response with base64 audio)',
      '/chat': 'POST /chat with JSON body (JSON response with base64 audio)',
      '/health': 'Health check (not implemented in original worker)',
    },
    description:
      'Uses Groq AI and Unmute TTS (2 voices: male/female) with Kyutai TTS fallback (azelma/alba)',
  };
  return corsify(jsonResponse(200, info));
}

