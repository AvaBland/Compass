import { useState } from 'react'
import { runDaily, extractIntelligenceFile, extractObservation } from '../utils/api'

export default function DailyMode({ apiKey, model, intelligenceFile, setIntelligenceFile }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [observation, setObservation] = useState(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleAdd() {
    if (!apiKey) {
      setError('No API key configured. Go to Settings.')
      return
    }
    if (!input.trim()) return
    if (!intelligenceFile) {
      setError('No Intelligence File found. Run Onboarding first to build your base file.')
      return
    }

    setError('')
    setLoading(true)
    setObservation(null)
    setDone(false)

    try {
      const response = await runDaily(apiKey, model, intelligenceFile, input)
      const updatedFile = extractIntelligenceFile(response)
      const obs = extractObservation(response)

      if (updatedFile) {
        setIntelligenceFile(updatedFile)
      } else {
        setIntelligenceFile(response)
      }

      setObservation(obs)
      setDone(true)
      setInput('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleAdd()
    }
  }

  const lastUpdated = intelligenceFile
    ? (intelligenceFile.match(/Last updated:\s*(.+)/i) || [])[1]?.trim()
    : null

  return (
    <div>
      <div className="page-header">
        <h1>Daily Mode</h1>
        <p>Add a data point or observation. Compass absorbs it and updates the Intelligence File instantly.</p>
      </div>

      <div className="mode-layout-full">
        {!apiKey && (
          <div className="alert alert-error">No API key configured. Go to Settings first.</div>
        )}

        {!intelligenceFile && (
          <div className="alert alert-info">
            No Intelligence File found. Complete Onboarding first to build your base file.
          </div>
        )}

        {lastUpdated && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Intelligence File last updated: {lastUpdated}
          </div>
        )}

        {observation && (
          <div className="observation-banner">
            <strong>Compass Signal</strong>
            {observation}
          </div>
        )}

        {done && !observation && (
          <div className="alert alert-success">
            Intelligence File updated. Nothing notable flagged from this entry.
          </div>
        )}

        <div className="card">
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">
              Today's data or observation
              <span>— reply received, open rates, webinar update, conversation note, anything</span>
            </label>
            <textarea
              rows={8}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Examples:
• Got a reply from a VP of Marketing at a Series B SaaS company. They said 'we're actually in the middle of evaluating tools for this.' Warm.
• Email to the CFO segment had 42% open, 0% click, 0% reply. Subject line working, body failing.
• 3 registrations from academic medical centers for the Thursday webinar — higher than usual for that segment.
• Outbound to CMOs at health systems: dead silence across 12 contacts."
              autoFocus
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="btn-row">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleAdd}
              disabled={loading || !input.trim() || !intelligenceFile}
            >
              {loading && <span className="spinner" />}
              {loading ? 'Updating Intelligence…' : 'Add to Intelligence'}
            </button>
            <span className="text-muted text-small">⌘↵ or Ctrl↵ to submit</span>
          </div>
        </div>
      </div>
    </div>
  )
}
