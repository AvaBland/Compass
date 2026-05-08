import { COMPASS_SYSTEM_PROMPT, ONBOARDING_APPEND, DAILY_APPEND, WEEKLY_APPEND } from './systemPrompt'

const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(apiKey, model, systemPrompt, userMessage) {
  const response = await fetch(API_URL, {
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

export async function runOnboarding(apiKey, model, historicalData, existingKnowledge) {
  const systemPrompt = COMPASS_SYSTEM_PROMPT + ONBOARDING_APPEND
  const userMessage = [
    'HISTORICAL OUTREACH DATA:',
    historicalData,
    '',
    'EXISTING KNOWLEDGE ABOUT PERSONAS, ORGANIZATIONS, MESSAGING, AND MARKET POSITIONING:',
    existingKnowledge || '(none provided)',
  ].join('\n')
  return callClaude(apiKey, model, systemPrompt, userMessage)
}

export async function runDaily(apiKey, model, intelligenceFile, todayData) {
  const systemPrompt = COMPASS_SYSTEM_PROMPT + DAILY_APPEND
  const userMessage = [
    'CURRENT INTELLIGENCE FILE:',
    intelligenceFile,
    '',
    "TODAY'S DATA / OBSERVATION:",
    todayData,
  ].join('\n')
  return callClaude(apiKey, model, systemPrompt, userMessage)
}

export async function runWeekly(apiKey, model, intelligenceFile, finalNotes) {
  const systemPrompt = COMPASS_SYSTEM_PROMPT + WEEKLY_APPEND
  const parts = ['CURRENT INTELLIGENCE FILE:', intelligenceFile]
  if (finalNotes?.trim()) {
    parts.push('', 'FINAL NOTES BEFORE BRIEFING:', finalNotes)
  }
  return callClaude(apiKey, model, systemPrompt, parts.join('\n'))
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
