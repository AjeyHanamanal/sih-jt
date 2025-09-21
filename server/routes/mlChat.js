const express = require('express');
const axios = require('axios');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Ensure env is loaded even if this router is required before index initializes it
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();

// Env expectations:
// GROK_API_KEY or OPENAI_API_KEY
// GROK_BASE_URL (default https://api.x.ai/v1), GROK_MODEL (default grok-2-latest)
// TRANSLATION_API_URL (default https://libretranslate.de), TRANSLATION_API_KEY (optional)

const GROK_BASE_URL = process.env.GROK_BASE_URL || 'https://api.x.ai/v1';
const GROK_MODEL = process.env.GROK_MODEL || 'grok-2-latest';
const TRANSLATE_URL = process.env.TRANSLATION_API_URL || 'https://libretranslate.de';
const TRANSLATION_ENABLED = (process.env.TRANSLATION_ENABLED || 'true').toLowerCase() !== 'false';

async function detectLanguage(text) {
  // Fast local heuristic first (no network):
  const hasDevanagari = /[\u0900-\u097F]/.test(text); // Hindi
  const hasBengali = /[\u0980-\u09FF]/.test(text);    // Bengali
  const hasOlChiki = /[\u1C50-\u1C7F]/.test(text);    // Santali (Ol Chiki)
  if (hasDevanagari) return 'hi';
  if (hasBengali) return 'bn';
  if (hasOlChiki) return 'sat';
  // Fallback to API detection (best-effort)
  try {
    const { data } = await axios.post(`${TRANSLATE_URL}/detect`, { q: text }, { timeout: 5000 });
    return Array.isArray(data) && data[0]?.language ? data[0].language : 'en';
  } catch {
    return 'en';
  }
}

async function translate(text, source, target) {
  if (!text || source === target) return text;
  try {
    const { data } = await axios.post(`${TRANSLATE_URL}/translate`, {
      q: text,
      source,
      target,
      format: 'text',
      api_key: process.env.TRANSLATION_API_KEY || undefined
    }, { timeout: 7000 });
    return data?.translatedText || text;
  } catch {
    return text;
  }
}

async function callLLM(prompt) {
  // Use Gemini API if available
  const geminiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!geminiKey) return 'AI key not configured. Please set GEMINI_API_KEY in server/.env.';

  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create the full prompt with system context
    const fullPrompt = `You are a friendly Jharkhand Tourism assistant. Answer concisely with accurate travel info (destinations, culture, routes, tips). If unsure, refer users to https://jharkhandtourism.gov.in.

User Question: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    return result.response.text().trim() || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Sorry, I could not generate a response.';
  }
}

// POST /api/chat/ml-chat { message, lang? }
router.post('/ml-chat', async (req, res) => {
  try {
    const userText = (req.body?.message || '').toString().slice(0, 4000);
    const manual = (req.body?.lang || '').toLowerCase();
    if (!userText) return res.status(400).json({ status: 'error', message: 'message is required' });

  let sourceLang = 'en';
  if (manual && manual !== 'auto') {
    sourceLang = manual;
  } else if (TRANSLATION_ENABLED) {
    sourceLang = await detectLanguage(userText);
  }

  // Translate inbound to English for LLM (only if enabled)
  const toEn = TRANSLATION_ENABLED ? await translate(userText, sourceLang, 'en') : userText;

    // Shallow FAQ injection (can be replaced by DB-backed resolver)
    const faqMap = {
      'best time to visit': 'October to March is best for pleasant weather across Jharkhand.',
      'famous places': 'Ranchi (Hundru, Dassam), Deoghar (Baidyanath Temple), Netarhat, Betla National Park, Hazaribagh Wildlife Sanctuary.'
    };
    const lower = toEn.toLowerCase();
    const hit = Object.entries(faqMap).find(([k]) => lower.includes(k));
    const llmInput = hit ? `${toEn}\n\n(If relevant, include: ${hit[1]})` : toEn;

  const llmEn = await callLLM(llmInput);
  const finalOut = TRANSLATION_ENABLED ? await translate(llmEn, 'en', sourceLang) : llmEn;

    // Optional logging: integrate with a ChatLog model if available
    // await ChatLog.create({ userId: req.user?._id, langIn: sourceLang, query: userText, reply: finalOut });

    return res.json({ status: 'success', reply: finalOut, lang: sourceLang });
  } catch (e) {
    const status = e?.response?.status;
    const body = e?.response?.data;
    const details = body?.error || body || e.message;
    console.error('ml-chat error', { status, details });
    let msg = 'Chat error. Please try again.';
    if (status === 401 || /unauthorized/i.test(`${details}`)) {
      msg = 'AI provider rejected the request. Verify OPENAI_API_KEY (or GROK_API_KEY) in server/.env and restart the backend.';
    } else if (status === 429 || /rate/i.test(`${details}`)) {
      msg = 'AI provider rate limit hit. Please wait a moment and try again.';
    } else if (status === 400 && (body?.message || body?.error)) {
      msg = body?.message || body?.error;
    }
    return res.status(500).json({ status: 'error', message: msg });
  }
});

module.exports = router;

// Lightweight status (dev only) to verify env loading for this router
if (process.env.NODE_ENV !== 'production') {
  router.get('/status', (req, res) => {
    const openai = (process.env.OPENAI_API_KEY || '').trim();
    const grok = (process.env.GROK_API_KEY || '').trim();
    const usingOpenAI = Boolean(openai);
    res.json({
      envLoaded: true,
      openaiKeyLen: openai.length,
      grokKeyLen: grok.length,
      provider: usingOpenAI ? 'openai' : (grok ? 'grok' : 'none'),
      translationEnabled: (process.env.TRANSLATION_ENABLED || 'true').toLowerCase() !== 'false'
    });
  });
}


