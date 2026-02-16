// Text utilities for AI / TTS

export function isRefusalResponse(text) {
  // Only detect strong refusals - NOT common conversational phrases
  const refusalPhrases = [
    'i cannot do that',
    "i can't do that",
    'i refuse',
    'i must decline',
    'i have to decline',
    'i must refuse',
    "that's inappropriate",
    "that's not appropriate",
    "i'm not comfortable",
    "i'm not allowed",
    "that's against my",
    'my guidelines',
    'as an ai language model',
    'as an ai assistant',
    'i cannot roleplay',
    "i can't roleplay",
    'i cannot participate',
    "i can't participate",
  ];

  const textLower = text.toLowerCase();
  return refusalPhrases.some((phrase) => textLower.includes(phrase));
}

export function sanitizeForTts(text) {
  if (!text) return text;
  // Remove [expression:...] and [motion:...] and [emotion:...] tags (square brackets)
  let sanitized = text.replace(/\[(?:expression|motion|emotion):[^\]]+\]/gi, '');
  // Remove <expression:...>, <motion:...>, <emotion:...> tags (angle brackets)
  sanitized = sanitized.replace(/<(?:expression|motion|emotion):[^>]+>/gi, '');
  // Remove *expression:...*, *motion:...*, *emotion:...* tags (asterisks)
  sanitized = sanitized.replace(/\*(?:expression|motion|emotion):[^\*]+\*/gi, '');
  // Remove <open opening ...> tags (all variants)
  sanitized = sanitized.replace(/<open opening [^>]*>/gi, '');
  sanitized = sanitized.replace(/<open>[^<]*<\/open>/gi, '');
  sanitized = sanitized.replace(/<open[^>]*>[^<]*(?:<\/open>)?/gi, '');
  // Remove any remaining *...* or [...] that might be animation tags
  sanitized = sanitized.replace(/\*[^*]+\*/g, '');
  sanitized = sanitized.replace(/\[[^\]]+\]/g, '');
  // Collapse whitespace
  return sanitized.replace(/\s+/g, ' ').trim();
}

export function normalizeHistoryItem(item) {
  if (typeof item === 'object' && item !== null) {
    let role = item.role || item.speaker || item.sender || 'user';
    const content = item.content || item.message || item.text || '';
    role = role.toLowerCase();
    if (!['system', 'assistant', 'user'].includes(role)) {
      if (['bot'].includes(role)) {
        role = 'assistant';
      } else {
        role = 'user';
      }
    }
    return { role, content };
  } else {
    return { role: 'user', content: String(item) };
  }
}

