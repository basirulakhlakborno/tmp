// Central configuration for TTS and providers

export const TTS_API_URL =
  'https://kyutaipockettts6ylex2y4-kyutai-pocket-tts.functions.fnc.fr-par.scw.cloud/tts';

// Unmute TTS configuration
export const UNMUTE_WS_URL = 'wss://unmute.sh/tts-server';

export const UNMUTE_VOICES = {
  male: 'expresso/ex03-ex01_calm_001_channel1_1143s.wav',
  female: 'expresso/ex04-ex02_desire_001_channel2_694s.wav',
};

// Voice mapping: convert app voice names to unmute voice paths
export const VOICE_MAPPING = {
  kore: UNMUTE_VOICES.female, // Female voice
  puck: UNMUTE_VOICES.male, // Male voice
  charon: UNMUTE_VOICES.male, // Male voice
  fenrir: UNMUTE_VOICES.male, // Male voice
  zephyr: UNMUTE_VOICES.female, // Female voice
};

// Kyutai TTS fallback voices
export const KYUTAI_VOICES = {
  female: 'azelma',
  male: 'alba',
};

