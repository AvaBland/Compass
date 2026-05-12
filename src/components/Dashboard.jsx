import { useMemo, useState } from 'react'
import { parseIntelligenceFile } from '../utils/parser'
import { updateIntelligence, extractIntelligenceFile, extractObservation } from '../utils/api'
import ActionBoard from './dashboard/ActionBoard'
import PerformanceOverview from './dashboard/StrategicPosture'
import PersonaCards from './dashboard/PersonaCards'
import OrgCoverageMap from './dashboard/OrgCoverageMap'
import NarrativePanel from './dashboard/NarrativePanel'
import ContentPanel from './dashboard/ContentPanel'
import CompetitivePanel from './dashboard/CompetitivePanel'
import PatternLog from './dashboard/PatternLog'
import CustomTracking from './dashboard/CustomTracking'

export default function Dashboard({ apiKey, model, baseUrl, intelligenceFile, setIntelligenceFile, setActiveTab }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [observation, setObservation] = useState(null)
  const [error, setError] = useState('')
  const [inputOpen, setInputOpen] = useState(!intelligenceFile)

  const parsed = useMemo(() => parseIntelligenceFile(intelligenceFile), [intelligenceFile])

  async function handleSubmit() {
    if (!apiKey) { setError('No API key — go to Settings.'); return }
    if (!input.trim()) return
    setError('')
    setLoading(true)
    setObservation(null)
    try {
      const response = await updateIntelligence(apiKey, model, baseUrl, intelligenceFile, input)
      const updated = extractIntelligenceFile(response)
      const obs = extractObservation(response)
      setIntelligenceFile(updated || response)
      setObservation(obs)
      setInput('')
      setInputOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
  }

  const lastUpdated = intelligenceFile
    ? (intelligenceFile.match(/Last updated:\s*(.+)/i) || [])[1]?.trim()
    : null

  return (
    <div>
      {/* Input section */}
      <div className="input-section">
        <div className="input-section-header">
          <div>
            <h1 className="input-section-title">Intelligence Dashboard</h1>
            {lastUpdated && <span className="input-section-meta">Last updated: {lastUpdated}</span>}
          </div>
          <div className="btn-row">
            <button className="btn btn-primary btn-sm" onClick={() => setInputOpen(o => !o)}>
              {inputOpen ? 'Close' : '+ Add Intelligence'}
            </button>
            {intelligenceFile && (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => exportFile(intelligenceFile)}>Export</button>
                <ImportButton setIntelligenceFile={setIntelligenceFile} />
              </>
            )}
          </div>
        </div>

        {inputOpen && (
          <div className="input-panel">
            {observation && (
              <div className="observation-banner">
                <strong>Signal Detected</strong>
                {observation}
              </div>
            )}
            {error && <div className="alert alert-error">{error}</div>}
            <textarea
              rows={6}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              placeholder={intelligenceFile
                ? "Add anything — reply received, open rates from a send, notes from a call, webinar registrations, a pattern you noticed. Any format.\n\nFrom Google Sheets: copy cells and paste directly, or use the Upload CSV button below."
                : "No data yet. Paste everything you have — historical outreach data, email performance, what you know about your personas, what's worked and what hasn't.\n\nFrom Google Sheets: copy cells and paste directly, or export as CSV (File → Download → CSV) and upload below."
              }
            />
            {!apiKey && (
              <div className="alert alert-error" style={{ marginTop: '8px' }}>
                No API key.{' '}
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('settings')}
                  style={{ display: 'inline', padding: 0, color: 'var(--danger)', textDecoration: 'underline' }}>
                  Go to Settings →
                </button>
              </div>
            )}
            <div className="btn-row" style={{ marginTop: '12px' }}>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading || !input.trim() || !apiKey}
              >
                {loading && <span className="spinner" />}
                {loading ? 'Updating…' : 'Update Intelligence'}
              </button>
              <FileLoader onLoad={text => setInput(prev => prev ? prev + '\n\n' + text : text)} />
              <span className="text-muted text-small">⌘↵ to submit</span>
              {intelligenceFile && (
                <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}
                  onClick={() => setActiveTab('briefing')}>
                  Generate Briefing →
                </button>
              )}
            </div>
          </div>
        )}

        {!inputOpen && observation && (
          <div className="observation-banner" style={{ marginTop: '12px' }}>
            <strong>Last Signal</strong>
            {observation}
          </div>
        )}
      </div>

      {/* Dashboard panels */}
      {!intelligenceFile || !parsed ? (
        <div className="empty-state" style={{ marginTop: '40px' }}>
          <div className="empty-state-icon">◎</div>
          <h2>No intelligence yet</h2>
          <p>Add your first entry above — paste historical data, campaign results, or anything you know about your market.</p>
        </div>
      ) : (
        <div className="dashboard-grid">
          <ActionBoard data={parsed.actionBoard} />
          <PerformanceOverview data={parsed.performanceOverview} />
          <PersonaCards personas={parsed.personas} />
          <OrgCoverageMap personas={parsed.personas} organizations={parsed.organizations} />
          <NarrativePanel narrative={parsed.narrative} />
          <CompetitivePanel competitive={parsed.competitive} />
          <ContentPanel content={parsed.content} />
          <PatternLog patterns={parsed.patternLog} />
          <CustomTracking
            data={parsed.customTracking}
            apiKey={apiKey}
            model={model}
            baseUrl={baseUrl}
            intelligenceFile={intelligenceFile}
            setIntelligenceFile={setIntelligenceFile}
          />
        </div>
      )}
    </div>
  )
}

function exportFile(text) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `compass-intelligence-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

function FileLoader({ onLoad }) {
  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target.result) onLoad(ev.target.result) }
    reader.readAsText(file)
    e.target.value = ''
  }
  return (
    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }} title="Upload a CSV or text file">
      Upload CSV
      <input type="file" accept=".csv,.txt,.tsv" style={{ display: 'none' }} onChange={handleChange} />
    </label>
  )
}

function ImportButton({ setIntelligenceFile }) {
  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => { if (ev.target.result) setIntelligenceFile(ev.target.result.trim()) }
    reader.readAsText(file)
    e.target.value = ''
  }
  return (
    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
      Import
      <input type="file" accept=".txt" style={{ display: 'none' }} onChange={handleChange} />
    </label>
  )
}
