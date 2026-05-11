import { useState } from 'react'
import { runWeekly, extractIntelligenceFile, extractBriefing } from '../utils/api'

export default function WeeklyMode({ apiKey, model, baseUrl, intelligenceFile, setIntelligenceFile }) {
  const [finalNotes, setFinalNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [briefing, setBriefing] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (!apiKey) {
      setError('No API key configured. Go to Settings.')
      return
    }
    if (!intelligenceFile) {
      setError('No Intelligence File found. Run Onboarding, then use Daily Mode throughout the week.')
      return
    }

    setError('')
    setLoading(true)
    setBriefing(null)

    try {
      const response = await runWeekly(apiKey, model, baseUrl, intelligenceFile, finalNotes)
      const updatedFile = extractIntelligenceFile(response)
      const briefingText = extractBriefing(response)

      if (updatedFile) {
        setIntelligenceFile(updatedFile)
      }

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
    <div>
      <div className="page-header">
        <h1>Weekly Briefing</h1>
        <p>Generate the Monday briefing from everything accumulated in the Intelligence File.</p>
      </div>

      <div className="mode-layout">
        <div>
          {!apiKey && (
            <div className="alert alert-error">No API key configured. Go to Settings first.</div>
          )}

          {!intelligenceFile && (
            <div className="alert alert-info">
              No Intelligence File found. Complete Onboarding and use Daily Mode throughout the week before generating a briefing.
            </div>
          )}

          <div className="card" style={{ marginBottom: '24px' }}>
            {lastUpdated && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Intelligence File last updated: {lastUpdated}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Final notes before briefing
                <span>— optional</span>
              </label>
              <textarea
                rows={5}
                value={finalNotes}
                onChange={e => setFinalNotes(e.target.value)}
                placeholder="Anything new since your last Daily entry — a conversation from Friday, weekend observations, a context shift you want Compass to factor in before generating the briefing."
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerate}
              disabled={loading || !intelligenceFile}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Generating Monday Briefing…' : 'Generate Monday Briefing'}
            </button>
          </div>

          {briefing && (
            <div>
              <div className="output-header">
                <span className="card-title">Monday Briefing</span>
                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                  {copied ? 'Copied ✓' : 'Copy Briefing'}
                </button>
              </div>
              <BriefingDisplay text={briefing} />
            </div>
          )}
        </div>

        <div className="mode-sidebar">
          <div className="how-it-works">
            <h3>How Weekly Mode Works</h3>
            <ol>
              <li>
                <strong>No data entry needed</strong> if you've been using Daily Mode throughout the week. The Intelligence File already reflects everything.
              </li>
              <li>
                <strong>Add final notes</strong> if there's anything new since your last Daily entry that should inform the briefing.
              </li>
              <li>
                <strong>Compass generates the full Monday Briefing:</strong> What We're Seeing, Intelligence Highlights, This Week's Actions (max 5), Content Recommendations (max 3), and Hold/Deprioritize.
              </li>
              <li>
                <strong>The Intelligence File updates</strong> automatically after the briefing is generated.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

function BriefingDisplay({ text }) {
  const sections = parseBriefingSections(text)

  if (!sections.length) {
    return <div className="output-area">{text}</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sections.map((section, i) => (
        <div key={i} className="card">
          <div className="card-header">
            <span className="card-title">{section.title}</span>
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.75', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  )
}

function parseBriefingSections(text) {
  const partLabels = [
    { pattern: /^(?:—\s*)?PART A[:\s—]+/im, title: 'Part A — What We Are Seeing' },
    { pattern: /^(?:—\s*)?PART B[:\s—]+/im, title: 'Part B — Intelligence Highlights' },
    { pattern: /^(?:—\s*)?PART C[:\s—]+/im, title: "Part C — This Week's Actions" },
    { pattern: /^(?:—\s*)?PART D[:\s—]+/im, title: 'Part D — Content Recommendations' },
    { pattern: /^(?:—\s*)?PART E[:\s—]+/im, title: 'Part E — Hold / Deprioritize' },
  ]

  const sections = []
  let remaining = text

  for (let i = 0; i < partLabels.length; i++) {
    const { pattern, title } = partLabels[i]
    const match = remaining.match(pattern)
    if (!match) continue

    const start = match.index + match[0].length

    let end = remaining.length
    for (let j = i + 1; j < partLabels.length; j++) {
      const nextMatch = remaining.match(partLabels[j].pattern)
      if (nextMatch && nextMatch.index > match.index) {
        end = nextMatch.index
        break
      }
    }

    const content = remaining.slice(start, end).trim()
    if (content) sections.push({ title, content })
  }

  if (!sections.length) return []
  return sections
}
