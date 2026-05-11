import { COMPASS_SYSTEM_PROMPT, UPDATE_APPEND, BRIEFING_APPEND } from './systemPrompt'

const DEFAULT_BASE_URL = 'https://llm.helix.com/llm/api'

async function callClaude(apiKey, model, systemPrompt, userMessage, baseUrl) {
  const url = `${(baseUrl || DEFAULT_BASE_URL).replace(/\/$/, '')}/messages`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    let message = `API error ${response.status}`
    try {
      const err = await response.json()
      message = err.error?.message || message
    } catch (_) {}
    throw new Error(message)
  }

  const data = await response.json()
  return data.content[0].text
}

export async function updateIntelligence(apiKey, model, baseUrl, intelligenceFile, newData) {
  const systemPrompt = COMPASS_SYSTEM_PROMPT + UPDATE_APPEND
  const parts = []
  if (intelligenceFile) {
    parts.push('CURRENT INTELLIGENCE FILE:', intelligenceFile, '')
  }
  parts.push('NEW DATA / OBSERVATIONS:', newData)
  return callClaude(apiKey, model, systemPrompt, parts.join('\n'), baseUrl)
}

export async function generateBriefing(apiKey, model, baseUrl, intelligenceFile) {
  const systemPrompt = COMPASS_SYSTEM_PROMPT + BRIEFING_APPEND
  const userMessage = `CURRENT INTELLIGENCE FILE:\n${intelligenceFile}`
  return callClaude(apiKey, model, systemPrompt, userMessage, baseUrl)
}

export function extractIntelligenceFile(response) {
  const match = response.match(/\[INTELLIGENCE FILE\]([\s\S]*?)\[\/INTELLIGENCE FILE\]/)
  return match ? match[1].trim() : null
}

export function extractObservation(response) {
  const match = response.match(/\[OBSERVATION\]([\s\S]*?)\[\/OBSERVATION\]/)
  if (!match) return null
  const obs = match[1].trim()
  return obs === 'NONE' ? null : obs
}

export function extractBriefing(response) {
  const match = response.match(/\[BRIEFING\]([\s\S]*?)\[\/BRIEFING\]/)
  return match ? match[1].trim() : null
}
