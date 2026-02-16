import msgpack from 'msgpack-lite';
import WebSocket from 'ws';

import { UNMUTE_VOICES, UNMUTE_WS_URL, VOICE_MAPPING } from '../../config.js';

// Unmute TTS implementation (primary)
export async function getUnmuteTtsAudio(text, voice = 'kore') {
  // Map voice name to unmute voice path
  const unmuteVoice = VOICE_MAPPING[voice.toLowerCase()] || UNMUTE_VOICES.female;

  return new Promise((resolve, reject) => {
    const wsUrl = `${UNMUTE_WS_URL}/api/tts_streaming?voice=${encodeURIComponent(
      unmuteVoice,
    )}&format=PcmMessagePack&auth_id=public_token`;

    try {
      const ws = new WebSocket(wsUrl);
      const audioChunks = [];
      const sampleRate = 24000;

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

        // Send text message using msgpack
        const textMsg = { type: 'Text', text };
        ws.send(msgpack.encode(textMsg));

        // Send end of stream after short delay
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
            // Convert PCM data to Int16 (following the reference implementation)
            const pcmFloat = new Float32Array(message.pcm);
            const pcmInt16 = new Int16Array(pcmFloat.length);

            for (let i = 0; i < pcmFloat.length; i++) {
              const clamped = Math.max(-1, Math.min(1, pcmFloat[i]));
              pcmInt16[i] = Math.round(clamped * 32767);
            }

            audioChunks.push(pcmInt16);
          }
        } catch {
          // Failed to parse WebSocket message; ignore and continue
        }
      });

      ws.on('close', () => {
        clearTimeout(connectTimeout);

        if (audioChunks.length > 0) {
          // Build WAV file from chunks
          const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
          const audioData = new Int16Array(totalLength);

          let offset = 0;
          for (const chunk of audioChunks) {
            audioData.set(chunk, offset);
            offset += chunk.length;
          }

          // Create WAV header
          const wavHeader = new ArrayBuffer(44);
          const view = new DataView(wavHeader);

          // RIFF header
          view.setUint32(0, 0x52494646, false); // "RIFF"
          view.setUint32(4, 36 + totalLength * 2, true); // File size
          view.setUint32(8, 0x57415645, false); // "WAVE"

          // Format chunk
          view.setUint32(12, 0x666d7420, false); // "fmt "
          view.setUint32(16, 16, true); // Chunk size
          view.setUint16(20, 1, true); // Audio format (PCM)
          view.setUint16(22, 1, true); // Number of channels
          view.setUint32(24, sampleRate, true); // Sample rate
          view.setUint32(28, sampleRate * 2, true); // Byte rate
          view.setUint16(32, 2, true); // Block align
          view.setUint16(34, 16, true); // Bits per sample

          // Data chunk
          view.setUint32(36, 0x64617461, false); // "data"
          view.setUint32(40, totalLength * 2, true); // Data size

          // Combine header and audio data
          const wavBuffer = new Uint8Array(wavHeader.byteLength + audioData.byteLength);
          wavBuffer.set(new Uint8Array(wavHeader), 0);
          wavBuffer.set(new Uint8Array(audioData.buffer), wavHeader.byteLength);

          resolve(wavBuffer.buffer);
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

