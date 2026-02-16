import { getAiResponse } from '../providers/groq.js';
import { getTtsAudioWithFallback } from '../providers/tts/index.js';
import { arrayBufferToBase64 } from '../utils/buffer.js';
import { jsonResponse } from '../utils/http.js';
import { sanitizeForTts } from '../utils/text.js';

export async function handleTts({ url, method, corsify }) {
  if (url.pathname === '/tts' && method === 'GET') {
    try {
      const query = url.searchParams.get('q') || '';
      const systemPrompt = url.searchParams.get('sq') || '';
      const voice = url.searchParams.get('voice') || 'kore';

      if (!query) {
        return corsify(
          jsonResponse(400, {
            error: "Please provide a 'q' parameter",
          }),
        );
      }

      const aiResponse = await getAiResponse(query, systemPrompt || undefined, process.env);
      const ttsText = sanitizeForTts(aiResponse);
      if (!ttsText.trim()) {
        return corsify(
          jsonResponse(200, {
            status: 'success',
            query,
            system_prompt: systemPrompt,
            ai_response: aiResponse,
            tts_text: '',
            audio: '', // No audio
            voice,
            provider: null,
          }),
        );
      }

      // Try TTS but don't fail if it's down
      let audioBase64 = '';
      let ttsProvider = null;
      try {
        const result = await getTtsAudioWithFallback(ttsText, voice);
        audioBase64 = `data:audio/wav;base64,${arrayBufferToBase64(result.audioBuffer)}`;
        ttsProvider = result.provider;
      } catch (ttsError) {
        console.error('TTS failed, returning response without audio:', ttsError);
      }

      return corsify(
        jsonResponse(200, {
          status: 'success',
          query,
          system_prompt: systemPrompt,
          ai_response: aiResponse,
          tts_text: ttsText,
          audio: audioBase64,
          voice,
          provider: ttsProvider,
        }),
      );
    } catch (e) {
      console.error(e);
      return corsify(
        jsonResponse(500, {
          error: String(e),
        }),
      );
    }
  }

  // /tts/stream (explicitly not supported, same as worker)
  if (url.pathname === '/tts/stream' && method === 'GET') {
    return corsify(
      jsonResponse(404, {
        error: 'Streaming not supported',
      }),
    );
  }

  return null;
}

