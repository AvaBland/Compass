import { useState } from 'react'
import { runOnboarding, extractIntelligenceFile } from '../utils/api'

export default function OnboardingMode({ apiKey, model, setIntelligenceFile, setActiveTab }) {
  const [historicalData, setHistoricalData] = useState('')
  const [existingKnowledge, setExistingKnowledge] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleBuild() {
    if (!apiKey) {
      setError('No API key found. Go to Settings and add your Anthropic API key.')
      return
    }
    if (!historicalData.trim()) {
      setError('Please provide historical outreach data.')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const response = await runOnboarding(apiKey, model, historicalData, existingKnowledge)
      const intelligenceFile = extractIntelligenceFile(response)

      if (intelligenceFile) {
        setIntelligenceFile(intelligenceFile)
        setResult(intelligenceFile)
      } else {
        setResult(response)
        setIntelligenceFile(response)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Onboarding</h1>
        <p>Catch Compass up on months of history and build your starter Intelligence File.</p>
      </div>

      <div className="mode-layout">
        <div>
          {!apiKey && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              No API key configured.{' '}
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveTab('settings')}
                style={{ display: 'inline', padding: '0', color: 'var(--danger)', textDecoration: 'underline' }}
              >
                Go to Settings →
              </button>
            </div>
          )}

          <div className="card">
            <div className="form-group">
              <label className="form-label">
                Historical Outreach Data
                <span>— email performance, engagement data, campaign results</span>
              </label>
              <textarea
                rows={12}
                value={historicalData}
                onChange={e => setHistoricalData(e.target.value)}
                placeholder="Paste everything: open rates, click rates, reply rates, sequence names, subject lines, who engaged, when. Any format works — CSV, copied tables, notes. Include as much as you have."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Existing Knowledge
                <span>— optional</span>
              </label>
              <textarea
                rows={6}
                value={existingKnowledge}
                onChange={e => setExistingKnowledge(e.target.value)}
                placeholder="What do you already know about your personas, best-fit organizations, what messaging has worked, what has failed? Any current positioning hypotheses? Include anything that should inform the Intelligence File from day one."
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="btn-row">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleBuild}
                disabled={loading || !historicalData.trim()}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Building Intelligence File…' : 'Build Intelligence File'}
              </button>
            </div>
          </div>

          {result && (
            <div style={{ marginTop: '24px' }}>
              <div className="output-header">
                <span className="card-title">Intelligence File Generated</span>
                <div className="btn-row">
                  <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('dashboard')}>
                    View Dashboard →
                  </button>
                </div>
              </div>
              <div className="alert alert-success">
                Intelligence File saved. Your dashboard is now populated.
              </div>
              <div className="output-area mono">{result}</div>
            </div>
          )}
        </div>

        <div className="mode-sidebar">
          <div className="how-it-works">
            <h3>How Onboarding Works</h3>
            <ol>
              <li>
                <strong>Paste everything you have.</strong> Email performance data, engagement records, campaign summaries — any format. The more history, the better the starting intelligence.
              </li>
              <li>
                <strong>Add existing knowledge.</strong> Anything your team already knows about personas, best-fit customers, or what messaging has landed — this seeds the file from day one.
              </li>
              <li>
                <strong>Compass builds your Intelligence File.</strong> It synthesizes all inputs into a fully structured file across all seven sections.
              </li>
              <li>
                <strong>You use Daily Mode going forward.</strong> Onboarding is a one-time setup. Use Daily Mode to add new observations throughout the week.
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
