import msgpack from 'msgpack-lite';
import WebSocket from 'ws';

import { UNMUTE_VOICES, UNMUTE_WS_URL, VOICE_MAPPING } from '../../config.js';

/**
 * Stream Unmute TTS audio chunks via callback. Does not wait for full audio.
 * @param {string} text
 * @param {string} voice
 * @param {(chunk: Int16Array) => void} onChunk - called for each PCM chunk
 * @returns {Promise<{ provider: string }>}
 */
export function streamUnmuteTtsAudio(text, voice = 'kore', onChunk) {
  const unmuteVoice = VOICE_MAPPING[voice.toLowerCase()] || UNMUTE_VOICES.female;

  return new Promise((resolve, reject) => {
    const wsUrl = `${UNMUTE_WS_URL}/api/tts_streaming?voice=${encodeURIComponent(
      unmuteVoice,
    )}&format=PcmMessagePack&auth_id=public_token`;

    try {
      const ws = new WebSocket(wsUrl);
      let receivedAny = false;

      const connectTimeout = setTimeout(() => {
        try {
          ws.terminate();
        } catch {
          // ignore
        }
        reject(new Error('WebSocket connection timeout'));
      }, 10000);

      ws.on('open', () => {
        clearTimeout(connectTimeout);

        const textMsg = { type: 'Text', text };
        ws.send(msgpack.encode(textMsg));

        setTimeout(() => {
          ws.send(msgpack.encode({ type: 'Eos' }));
        }, 100);
      });

      ws.on('message', (data) => {
        try {
          let uint8;
          if (Buffer.isBuffer(data)) {
            uint8 = new Uint8Array(data);
          } else if (data instanceof ArrayBuffer) {
            uint8 = new Uint8Array(data);
          } else {
            uint8 = new Uint8Array(Buffer.from(data));
          }

          const message = msgpack.decode(uint8);

          if (message && message.type === 'Audio' && message.pcm) {
            const pcmFloat = new Float32Array(message.pcm);
            const pcmInt16 = new Int16Array(pcmFloat.length);

            for (let i = 0; i < pcmFloat.length; i++) {
              const clamped = Math.max(-1, Math.min(1, pcmFloat[i]));
              pcmInt16[i] = Math.round(clamped * 32767);
            }

            receivedAny = true;
            onChunk(pcmInt16);
          }
        } catch {
          // ignore
        }
      });

      ws.on('close', () => {
        clearTimeout(connectTimeout);
        if (receivedAny) {
          resolve({ provider: 'unmute' });
        } else {
          reject(new Error('No audio data received'));
        }
      });

      ws.on('error', (err) => {
        clearTimeout(connectTimeout);
        reject(new Error(`WebSocket error: ${err.message || 'Unknown error'}`));
      });
    } catch (err) {
      reject(err);
    }
  });
}
