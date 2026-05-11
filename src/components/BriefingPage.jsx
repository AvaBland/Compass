import { useState } from 'react'
import { generateBriefing, extractIntelligenceFile, extractBriefing } from '../utils/api'

export default function BriefingPage({ apiKey, model, baseUrl, intelligenceFile, setIntelligenceFile, setActiveTab }) {
  const [loading, setLoading] = useState(false)
  const [briefing, setBriefing] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!apiKey) { setError('No API key — go to Settings.'); return }
    if (!intelligenceFile) { setError('No intelligence data yet. Add data on the Dashboard first.'); return }
    setError('')
    setLoading(true)
    setBriefing(null)
    try {
      const response = await generateBriefing(apiKey, model, baseUrl, intelligenceFile)
      const updated = extractIntelligenceFile(response)
      const briefingText = extractBriefing(response)
      if (updated) setIntelligenceFile(updated)
      setBriefing(briefingText || response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!briefing) return
    navigator.clipboard.writeText(briefing)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const lastUpdated = intelligenceFile
    ? (intelligenceFile.match(/Last updated:\s*(.+)/i) || [])[1]?.trim()
    : null

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1>Briefing</h1>
        <p>Executive summary of what's working, what's not, and who to re-engage.</p>
      </div>

      {!intelligenceFile && (
        <div className="alert alert-info">
          No intelligence data yet.{' '}
          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('dashboard')}
            style={{ display: 'inline', padding: 0, color: 'var(--accent-hover)', textDecoration: 'underline' }}>
            Add data on the Dashboard →
          </button>
        </div>
      )}

      {intelligenceFile && !briefing && (
        <div className="card" style={{ marginBottom: '24px' }}>
          {lastUpdated && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Intelligence File last updated: {lastUpdated}
            </div>
          )}
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            Compass will synthesize everything in the Intelligence File into a concise briefing — what's working, what's not, and prioritized re-engagement actions for your team.
          </p>
          {error && <div className="alert alert-error">{error}</div>}
          <button
            className="btn btn-primary btn-lg"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading && <span className="spinner" />}
            {loading ? 'Generating Briefing…' : 'Generate Briefing'}
          </button>
        </div>
      )}

      {briefing && (
        <div>
          <div className="output-header" style={{ marginBottom: '16px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setBriefing(null)}>
              ← Regenerate
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
              {copied ? 'Copied ✓' : 'Copy Briefing'}
            </button>
          </div>
          <BriefingDisplay text={briefing} />
        </div>
      )}
    </div>
  )
}

const SECTION_DEFS = [
  { key: 'WHAT\'S WORKING', label: "What's Working", color: 'var(--confirmed)', icon: '↑' },
  { key: 'WHAT\'S NOT WORKING', label: "What's Not Working", color: 'var(--retired)', icon: '↓' },
  { key: 'RE-ENGAGEMENT PRIORITIES', label: 'Re-Engagement Priorities', color: 'var(--accent-hover)', icon: '→' },
  { key: 'HOLD / PULL BACK', label: 'Hold / Pull Back', color: 'var(--emerging)', icon: '⏸' },
]

function BriefingDisplay({ text }) {
  const sections = parseBriefingSections(text)

  if (!sections.length) {
    return <div className="output-area">{text}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {sections.map((section, i) => (
        <div key={i} className="briefing-section" style={{ '--section-color': section.color }}>
          <div className="briefing-section-header">
            <span className="briefing-section-icon">{section.icon}</span>
            <span className="briefing-section-title">{section.label}</span>
          </div>
          <div className="briefing-section-body">
            {section.items.map((item, j) => (
              <BriefingItem key={j} item={item} sectionKey={section.key} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function BriefingItem({ item, sectionKey }) {
  if (sectionKey === 'RE-ENGAGEMENT PRIORITIES') {
    const whoMatch = item.match(/WHO[:\s]+(.+?)(?=HOW[:\s]|WHY[:\s]|$)/is)
    const howMatch = item.match(/HOW[:\s]+(.+?)(?=WHO[:\s]|WHY[:\s]|$)/is)
    const whyMatch = item.match(/WHY[:\s]+(.+?)(?=WHO[:\s]|HOW[:\s]|$)/is)

    if (whoMatch || howMatch || whyMatch) {
      return (
        <div className="reengagement-item">
          {whoMatch && (
            <div className="reengagement-field">
              <span className="reengagement-label">Who</span>
              <span className="reengagement-value">{whoMatch[1].trim()}</span>
            </div>
          )}
          {howMatch && (
            <div className="reengagement-field">
              <span className="reengagement-label">How</span>
              <span className="reengagement-value">{howMatch[1].trim()}</span>
            </div>
          )}
          {whyMatch && (
            <div className="reengagement-field">
              <span className="reengagement-label">Why</span>
              <span className="reengagement-value">{whyMatch[1].trim()}</span>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div className="briefing-bullet">
      <span className="briefing-bullet-dot" />
      <span>{item}</span>
    </div>
  )
}

function parseBriefingSections(text) {
  const sections = []

  for (const def of SECTION_DEFS) {
    const escapedKey = def.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`${escapedKey}\\s*\\n([\\s\\S]*?)(?=${SECTION_DEFS.map(d => d.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}|$)`, 'i')
    const match = text.match(re)
    if (!match) continue

    const raw = match[1].trim()
    const items = raw
      .split(/\n(?=\d+\.|•|-|–)|\n\n/)
      .map(s => s.replace(/^[\d.•\-–*\s]+/, '').trim())
      .filter(s => s.length > 5)

    if (items.length) {
      sections.push({ ...def, items })
    }
  }

  return sections
}
