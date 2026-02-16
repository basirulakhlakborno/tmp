// Groq AI chat provider

import { jsonResponse } from '../utils/http.js';

export function getGroqApiKey(env) {
  // Prefer Netlify/Node env, fall back to passed env (Cloudflare-style)
  return (env && env.GROQ_API_KEY) || process.env.GROQ_API_KEY;
}

export async function getAiResponse(query, systemPrompt, env) {
  const messages = [];
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt,
    });
  }
  messages.push({
    role: 'user',
    content: query,
  });

  const apiKey = getGroqApiKey(env);
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

export async function getAiResponseFromMessages(messages, env) {
  const apiKey = getGroqApiKey(env);
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

