import { getUnmuteTtsAudio } from './unmuteTts.js';
import { getTtsAudio } from './kyutaiTts.js';

// Main TTS function with Unmute primary and Kyutai fallback
export async function getTtsAudioWithFallback(text, voice = 'kore') {
  try {
    const audioBuffer = await getUnmuteTtsAudio(text, voice);
    return { audioBuffer, provider: 'unmute' };
  } catch (unmuteError) {
    try {
      const audioBuffer = await getTtsAudio(text, voice);
      return { audioBuffer, provider: 'kyutai' };
    } catch {
      throw new Error(`All TTS services failed: ${unmuteError.message}`);
    }
  }
}

