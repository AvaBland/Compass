export function parseIntelligenceFile(text) {
  if (!text || !text.trim()) return null

  const result = {
    raw: text,
    lastUpdated: '',
    sessionsCompleted: 0,
    performanceOverview: null,
    personas: [],
    organizations: [],
    narrative: null,
    competitive: null,
    content: null,
    patternLog: [],
    actionBoard: null,
    customTracking: [],
  }

  const lastUpdatedMatch = text.match(/Last updated:\s*(.+)/i)
  if (lastUpdatedMatch) result.lastUpdated = lastUpdatedMatch[1].trim()

  const sessionsMatch = text.match(/Sessions completed:\s*(\d+)/i)
  if (sessionsMatch) result.sessionsCompleted = parseInt(sessionsMatch[1], 10)

  const sections = splitSections(text)

  if (sections.A) result.performanceOverview = parsePerformanceOverview(sections.A)
  if (sections.B) result.personas = parsePersonas(sections.B)
  if (sections.C) result.organizations = parseOrganizations(sections.C)
  if (sections.D) result.narrative = parseNarrative(sections.D)
  if (sections.E) result.competitive = parseCompetitive(sections.E)
  if (sections.F) result.content = parseContent(sections.F)
  if (sections.G) result.patternLog = parsePatternLog(sections.G)
  if (sections.H) result.actionBoard = parseActionBoard(sections.H)
  if (sections.I) result.customTracking = parseCustomTracking(sections.I)

  return result
}

function splitSections(text) {
  const sections = {}
  const divider = /━{10,}/

  const sectionHeaderRe = /━{10,}\s*\nSECTION ([A-I]) —[^\n]*\n━{10,}/g
  let match
  const boundaries = []

  while ((match = sectionHeaderRe.exec(text)) !== null) {
    boundaries.push({ letter: match[1], end: match.index + match[0].length })
  }

  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i].end
    const end = i + 1 < boundaries.length ? boundaries[i + 1].end - boundaries[i + 1].end + (text.indexOf('━', boundaries[i + 1].end - 60) || text.length) : text.length

    let nextStart = text.length
    if (i + 1 < boundaries.length) {
      const nextDividerPos = text.indexOf('\n━', boundaries[i].end)
      if (nextDividerPos !== -1) nextStart = nextDividerPos
    }

    sections[boundaries[i].letter] = text.slice(start, nextStart).trim()
  }

  return sections
}

function extractField(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped + ':\\s*\\n?([\\s\\S]*?)(?=\\n[A-Za-z][^:\\n]{0,50}:|$)', 'i')
  const m = text.match(re)
  return m ? m[1].trim() : ''
}

function parsePerformanceOverview(text) {
  const learningsRaw = extractSubsection(text, 'LEARNINGS')
  const seqRaw = extractSubsection(text, 'EMAIL SEQUENCE DATA')
  return {
    // Performance Overview fields
    bestSendTime: extractField(text, 'Best send time'),
    topSubjectLines: extractField(text, 'Top subject lines by open rate'),
    highestReplySegments: extractField(text, 'Highest reply segments'),
    highestConversionSegments: extractField(text, 'Highest conversion segments'),
    negativeTrends: extractField(text, 'Negative trends'),
    recommendations: extractField(text, 'Recommendations to act on now'),
    // Learnings log
    learnings: parseLearnings(learningsRaw),
    // Email sequence analytics
    emailSequence: parseEmailSequenceData(seqRaw),
    // Legacy Strategic Posture fields (backward compat)
    icpHypothesis: extractField(text, 'Current best ICP hypothesis'),
    strongestNarrative: extractField(text, 'Current strongest narrative angle'),
    weakestNarrative: extractField(text, 'Current weakest narrative angle'),
    marketTiming: extractField(text, 'Market timing assessment'),
    topQuestion: extractField(text, 'Top open strategic question'),
    raw: text,
  }
}

function parseLearnings(text) {
  if (!text) return []
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.includes('—'))
    .map(line => {
      const idx = line.indexOf('—')
      return { date: line.slice(0, idx).trim(), observation: line.slice(idx + 1).trim() }
    })
    .filter(l => l.date && l.observation)
    .slice(0, 12)
}

function parseEmailSequenceData(text) {
  if (!text) return null
  return {
    avgEmailsToReply: extractField(text, 'Average emails before first reply'),
    avgEmailsToConversion: extractField(text, 'Average emails before meeting conversion'),
    avgDaysBetweenTouches: extractField(text, 'Average days between touches'),
    replyDist: parseDistribution(extractField(text, 'Reply distribution')),
    conversionDist: parseDistribution(extractField(text, 'Conversion distribution')),
    raw: text,
  }
}

function parseDistribution(text) {
  if (!text) return []
  return [...text.matchAll(/Email\s+(\d+\+?):\s*(\d+)/gi)]
    .map(m => ({ label: `E${m[1]}`, value: parseInt(m[2], 10) }))
}

function parseCustomTracking(text) {
  if (!text) return []
  const blocks = ('\n' + text).split(/\n\s*Question:/i).slice(1).map(b => ('Question:' + b).trim())
  return blocks.map(block => ({
    question: extractField(block, 'Question'),
    answer: extractField(block, 'Answer'),
    lastUpdated: extractField(block, 'Last updated'),
    trend: extractField(block, 'Trend'),
    notes: extractField(block, 'Notes'),
  })).filter(q => q.question)
}

function parsePersonas(text) {
  const blocks = text.split(/\n(?=Persona:)/i).filter(b => b.trim())
  return blocks.map(block => ({
    title: extractField(block, 'Persona'),
    seniorityLevel: extractField(block, 'Seniority level'),
    serviceLine: extractField(block, 'Service line'),
    lastOutreachDate: extractField(block, 'Last outreach date'),
    touchHistory: extractField(block, 'Touch history'),
    totalEmailsSent: extractField(block, 'Total emails sent'),
    openReplyRate: extractField(block, 'Open rate / Reply rate'),
    engagementPattern: extractField(block, 'Engagement pattern'),
    expertCohorts: extractField(block, 'Expert cohorts'),
    frameworkAnalysis: extractField(block, 'Email framework analysis'),
    valueProps: extractField(block, 'Value propositions used'),
    resonantSubjectLines: extractField(block, 'Subject lines — resonant'),
    flatSubjectLines: extractField(block, 'Subject lines — flat'),
    resonantAngles: extractField(block, 'Resonant angles'),
    resistantAngles: extractField(block, 'Resistant angles'),
    bestChannel: extractField(block, 'Best channel'),
    confidence: extractField(block, 'Confidence'),
    lastUpdated: extractField(block, 'Last updated'),
    raw: block,
  })).filter(p => p.title)
}

function parseOrganizations(text) {
  const blocks = text.split(/\n(?=Org segment:)/i).filter(b => b.trim())
  return blocks.map(block => ({
    segment: extractField(block, 'Org segment'),
    engagementPattern: extractField(block, 'Engagement pattern'),
    conversionSignal: extractField(block, 'Conversion rate signal'),
    characteristics: extractField(block, 'Notable characteristics'),
    personasReached: extractField(block, 'Personas reached'),
    crossPersonaThemes: extractField(block, 'Cross-persona themes'),
    icpFit: extractField(block, 'ICP fit assessment'),
    confidence: extractField(block, 'Confidence'),
    lastUpdated: extractField(block, 'Last updated'),
    raw: block,
  })).filter(o => o.segment)
}

function parseNarrative(text) {
  return {
    resonant: extractField(text, 'Resonant messages / angles'),
    flat: extractField(text, 'Flat messages / angles'),
    polarizing: extractField(text, 'Polarizing messages'),
    languageBank: extractField(text, 'Prospect language bank'),
    raw: text,
  }
}

function parseCompetitive(text) {
  return {
    themes: extractField(text, 'Observed competitive themes'),
    vulnerabilities: extractField(text, 'Positioning vulnerabilities'),
    strengths: extractField(text, 'Positioning strengths'),
    raw: text,
  }
}

function parseContent(text) {
  return {
    formatPerformance: extractSubsection(text, 'FORMAT PERFORMANCE BY SEGMENT'),
    topicResonance: extractSubsection(text, 'TOPIC RESONANCE MAP'),
    contentFatigue: extractSubsection(text, 'CONTENT FATIGUE LOG'),
    voiceCredibility: extractSubsection(text, 'VOICE & SOURCE CREDIBILITY'),
    contentGaps: extractSubsection(text, 'CONTENT GAP REGISTER'),
    whitespace: extractSubsection(text, 'CONTENT WHITESPACE'),
    raw: text,
  }
}

function extractSubsection(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped + '\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z &/]{3,}\\n|$)', 'i')
  const m = text.match(re)
  return m ? m[1].trim() : ''
}

function parsePatternLog(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.includes('|'))
    .map(line => {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length < 3) return null
      return {
        date: parts[0],
        status: parts[1],
        finding: parts.slice(2).join(' — '),
      }
    })
    .filter(Boolean)
}

function parseActionBoard(text) {
  const nextMovesRaw = extractSubsection(text, 'NEXT MOVES')
  return {
    lastUpdated: extractField(text, 'Last updated'),
    working: extractSubsection(text, 'WHAT IS WORKING'),
    notWorking: extractSubsection(text, 'WHAT IS NOT WORKING'),
    nextMoves: parseNextMoves(nextMovesRaw),
    nextMovesRaw,
    hold: extractSubsection(text, 'HOLD'),
    raw: text,
  }
}

function parseNextMoves(text) {
  if (!text || !text.trim()) return []
  // Prepend \n so the first numbered item is also caught by the split
  const blocks = ('\n' + text)
    .split(/\n\s*\d+\.\s+Who:/i)
    .slice(1)
    .map(b => ('Who:' + b).trim())
    .filter(b => b !== 'Who:')
  return blocks.map(block => ({
    who: extractField(block, 'Who'),
    channel: extractField(block, 'Channel'),
    collateral: extractField(block, 'Collateral'),
    theme: extractField(block, 'Theme'),
    moveType: extractField(block, 'Move type'),
    whyNow: extractField(block, 'Why now'),
  }))
}

export function confidenceColor(confidence) {
  if (!confidence) return 'muted'
  const lower = confidence.toLowerCase()
  if (lower.includes('confirmed')) return 'confirmed'
  if (lower.includes('emerging')) return 'emerging'
  if (lower.includes('hypothesis')) return 'hypothesis'
  if (lower.includes('retired')) return 'retired'
  return 'muted'
}

export function patternStatusColor(status) {
  if (!status) return 'muted'
  const lower = status.toLowerCase()
  if (lower.includes('confirmed')) return 'confirmed'
  if (lower.includes('emerging')) return 'emerging'
  if (lower.includes('retired')) return 'retired'
  return 'muted'
}
