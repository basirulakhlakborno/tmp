import { KYUTAI_VOICES, TTS_API_URL, VOICE_MAPPING, UNMUTE_VOICES } from '../../config.js';

// Kyutai HTTP TTS fallback
export async function getTtsAudio(text, voice = 'kore') {
  // Map voice to Kyutai fallback voice
  let kyutaiVoice = KYUTAI_VOICES.female; // Default to female
  if (VOICE_MAPPING[voice.toLowerCase()] === UNMUTE_VOICES.male) {
    kyutaiVoice = KYUTAI_VOICES.male;
  }

  const boundary = '----WebKitFormBoundaryNFgLuXtE56AI6QgW';
  const body = `--${boundary}\r\nContent-Disposition: form-data; name="text"\r\n\r\n${text}\r\n--${boundary}\r\nContent-Disposition: form-data; name="voice_url"\r\n\r\n${kyutaiVoice}\r\n--${boundary}--\r\n`;

  const response = await fetch(TTS_API_URL, {
    method: 'POST',
    headers: {
      accept: '*/*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      'content-type': `multipart/form-data; boundary=${boundary}`,
      origin: 'https://kyutai.org',
      pragma: 'no-cache',
      referer: 'https://kyutai.org/',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.status}`);
  }

  return await response.arrayBuffer();
}

