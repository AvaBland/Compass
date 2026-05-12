import { useState } from 'react'
import { updateIntelligence, extractIntelligenceFile } from '../../utils/api'

export default function CustomTracking({ data, apiKey, model, baseUrl, intelligenceFile, setIntelligenceFile }) {
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!question.trim() || !apiKey) return
    setLoading(true)
    setError('')
    try {
      const response = await updateIntelligence(apiKey, model, baseUrl, intelligenceFile, `Track: ${question.trim()}`)
      const updated = extractIntelligenceFile(response)
      setIntelligenceFile(updated || response)
      setQuestion('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  const items = data || []

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Custom Tracking</span>
        {items.length > 0 && <span className="text-muted text-small">{items.length} question{items.length !== 1 ? 's' : ''} tracked</span>}
      </div>
      <div className="panel-body">
        {items.length > 0 && (
          <div className="tracking-list">
            {items.map((q, i) => <TrackingItem key={i} item={q} />)}
          </div>
        )}

        <div className={`tracking-input-section${items.length > 0 ? ' tracking-input-section-mt' : ''}`}>
          <div className="tracking-input-label">
            Ask a question to track over time — Compass will update the answer each session as new data arrives
          </div>
          <div className="tracking-input-row">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. What day of week gets the best reply rates from oncology VPs?"
              disabled={loading}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={loading || !question.trim() || !apiKey}
            >
              {loading && <span className="spinner" />}
              {loading ? '' : 'Track'}
            </button>
          </div>
          {!apiKey && (
            <div className="text-muted text-small" style={{ marginTop: '6px' }}>API key required — go to Settings.</div>
          )}
          {error && <div className="alert alert-error" style={{ marginTop: '8px' }}>{error}</div>}
        </div>
      </div>
    </div>
  )
}

function TrackingItem({ item }) {
  const trendColors = {
    improving: 'var(--confirmed)',
    declining: 'var(--danger)',
    stable: 'var(--text-secondary)',
    'insufficient data': 'var(--text-muted)',
  }
  const trendColor = trendColors[item.trend?.toLowerCase()] || 'var(--text-muted)'

  return (
    <div className="tracking-item">
      <div className="tracking-question">{item.question}</div>
      {item.answer && <div className="tracking-answer">{item.answer}</div>}
      {item.notes && <div className="tracking-notes">{item.notes}</div>}
      <div className="tracking-meta">
        {item.trend && (
          <span className="tracking-trend" style={{ color: trendColor }}>
            {item.trend}
          </span>
        )}
        {item.lastUpdated && <span className="text-muted text-small">Updated {item.lastUpdated}</span>}
      </div>
    </div>
  )
}
