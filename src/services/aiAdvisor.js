import { OPENAI_API_KEY } from '../config/apiKeys';

// AI advisor service — will call OpenAI Chat API when an API key is provided.
// Falls back to simple heuristics when no key is available.
export async function getAIRecommendations(expenses = [], options = {}) {
  const apiKey = options.apiKey || OPENAI_API_KEY;

  const fallback = [
    'Try reducing dining out by 10% to save money.',
    'Set a weekly grocery budget and track it.',
    'Move recurring subscriptions to a single payment day to simplify tracking.',
  ];

  if (!apiKey) return fallback;

  try {
    const shortList = (expenses || []).slice(-50); // limit size
    const system = `You are a concise personal finance assistant. Provide 5 short, actionable budget tips or recommendations based on the user's recent expenses. Return only a JSON array of strings.`;
    const user = `Here are the recent expenses (JSON): ${JSON.stringify(shortList)}.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.6,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      console.warn('OpenAI request failed', await res.text());
      return fallback;
    }

    const payload = await res.json();
    const content = payload?.choices?.[0]?.message?.content || '';

    // Try to parse JSON array from model response; otherwise split by newlines
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch (e) {
      // continue to fallback parsing
    }

    // Fallback: extract lines that look like sentences
    const lines = content
      .split(/\r?\n/)
      .map(l => l.replace(/^[-\d\.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 5);

    return lines.length > 0 ? lines : fallback;
  } catch (e) {
    console.warn('AI advisor error', e.message || e);
    return fallback;
  }
}
