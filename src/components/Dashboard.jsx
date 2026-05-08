import { useMemo } from 'react'
import { parseIntelligenceFile } from '../utils/parser'
import StrategicPosture from './dashboard/StrategicPosture'
import PersonaCards from './dashboard/PersonaCards'
import OrgCards from './dashboard/OrgCards'
import NarrativePanel from './dashboard/NarrativePanel'
import ContentPanel from './dashboard/ContentPanel'
import CompetitivePanel from './dashboard/CompetitivePanel'
import PatternLog from './dashboard/PatternLog'

export default function Dashboard({ intelligenceFile, setIntelligenceFile, setActiveTab }) {
  const parsed = useMemo(() => parseIntelligenceFile(intelligenceFile), [intelligenceFile])

  if (!intelligenceFile || !parsed) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">◎</div>
        <h2>No Intelligence File Yet</h2>
        <p>
          Run Onboarding to build your starter Intelligence File from historical data.
          Once complete, this dashboard will populate automatically.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveTab('onboarding')}>
          Start Onboarding →
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1>Intelligence Dashboard</h1>
          <p>
            {parsed.lastUpdated && `Last updated: ${parsed.lastUpdated}`}
            {parsed.sessionsCompleted > 0 && ` · ${parsed.sessionsCompleted} sessions`}
          </p>
        </div>
        <div className="btn-row">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportFile(intelligenceFile)}
          >
            Export
          </button>
          <ImportButton setIntelligenceFile={setIntelligenceFile} />
        </div>
      </div>

      <div className="dashboard-grid">
        <StrategicPosture data={parsed.strategicPosture} />

        <PersonaCards personas={parsed.personas} />
        <OrgCards organizations={parsed.organizations} />

        <NarrativePanel narrative={parsed.narrative} />
        <CompetitivePanel competitive={parsed.competitive} />

        <ContentPanel content={parsed.content} />

        <PatternLog patterns={parsed.patternLog} />
      </div>
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

function ImportButton({ setIntelligenceFile }) {
  function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target.result
      if (text) setIntelligenceFile(text.trim())
    }
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
