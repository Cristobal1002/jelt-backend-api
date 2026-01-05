// src/config/openai.js
import OpenAI from 'openai';

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export const getOpenAIClient = () => {
  const enabled = process.env.AI_ENABLED !== 'false';
  if (!enabled) return null;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not defined (AI_ENABLED=true)');
  }

  return new OpenAI({ apiKey });
};
