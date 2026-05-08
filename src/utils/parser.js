export function parseIntelligenceFile(text) {
  if (!text || !text.trim()) return null

  const result = {
    raw: text,
    lastUpdated: '',
    sessionsCompleted: 0,
    strategicPosture: null,
    personas: [],
    organizations: [],
    narrative: null,
    competitive: null,
    content: null,
    patternLog: [],
  }

  const lastUpdatedMatch = text.match(/Last updated:\s*(.+)/i)
  if (lastUpdatedMatch) result.lastUpdated = lastUpdatedMatch[1].trim()

  const sessionsMatch = text.match(/Sessions completed:\s*(\d+)/i)
  if (sessionsMatch) result.sessionsCompleted = parseInt(sessionsMatch[1], 10)

  const sections = splitSections(text)

  if (sections.A) result.strategicPosture = parseStrategicPosture(sections.A)
  if (sections.B) result.personas = parsePersonas(sections.B)
  if (sections.C) result.organizations = parseOrganizations(sections.C)
  if (sections.D) result.narrative = parseNarrative(sections.D)
  if (sections.E) result.competitive = parseCompetitive(sections.E)
  if (sections.F) result.content = parseContent(sections.F)
  if (sections.G) result.patternLog = parsePatternLog(sections.G)

  return result
}

function splitSections(text) {
  const sections = {}
  const divider = /━{10,}/

  const sectionHeaderRe = /━{10,}\s*\nSECTION ([A-G]) —[^\n]*\n━{10,}/g
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

function parseStrategicPosture(text) {
  return {
    icpHypothesis: extractField(text, 'Current best ICP hypothesis'),
    strongestNarrative: extractField(text, 'Current strongest narrative angle'),
    weakestNarrative: extractField(text, 'Current weakest narrative angle'),
    marketTiming: extractField(text, 'Market timing assessment'),
    topQuestion: extractField(text, 'Top open strategic question'),
    raw: text,
  }
}

function parsePersonas(text) {
  const blocks = text.split(/\n(?=Persona:)/i).filter(b => b.trim())
  return blocks.map(block => ({
    title: extractField(block, 'Persona'),
    engagementPattern: extractField(block, 'Engagement pattern'),
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
