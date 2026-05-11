import { useState } from 'react'

export default function Settings({ apiKey, setApiKey, model, setModel, baseUrl, setBaseUrl, intelligenceFile, setIntelligenceFile }) {
  const [keyInput, setKeyInput] = useState(apiKey)
  const [modelInput, setModelInput] = useState(model)
  const [baseUrlInput, setBaseUrlInput] = useState(baseUrl)
  const [saved, setSaved] = useState(false)
  const [importText, setImportText] = useState('')
  const [importMsg, setImportMsg] = useState('')

  function handleSave() {
    setApiKey(keyInput.trim())
    setModel(modelInput.trim())
    setBaseUrl(baseUrlInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleExport() {
    if (!intelligenceFile) return
    const blob = new Blob([intelligenceFile], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `compass-intelligence-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport() {
    if (!importText.trim()) {
      setImportMsg('Paste your Intelligence File text above first.')
      return
    }
    setIntelligenceFile(importText.trim())
    setImportText('')
    setImportMsg('Intelligence File imported and saved.')
    setTimeout(() => setImportMsg(''), 3000)
  }

  function handleClear() {
    if (!window.confirm('Clear the Intelligence File? This cannot be undone.')) return
    setIntelligenceFile('')
    setImportMsg('Intelligence File cleared.')
    setTimeout(() => setImportMsg(''), 3000)
  }

  const maskedKey = apiKey
    ? `${apiKey.slice(0, 8)}${'•'.repeat(Math.max(0, apiKey.length - 12))}${apiKey.slice(-4)}`
    : null

  return (
    <div className="settings-layout">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Configure your API connection and manage your Intelligence File.</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">API Configuration</div>
        <div className="settings-section-desc">
          Stored locally in your browser. All calls go through your company's LiteLLM proxy.
        </div>

        <div className="form-group">
          <label className="form-label">
            Auth Token
            <span>— your ANTHROPIC_AUTH_TOKEN value</span>
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            placeholder="Paste your auth token here"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Proxy Base URL
          </label>
          <input
            type="text"
            value={baseUrlInput}
            onChange={e => setBaseUrlInput(e.target.value)}
            placeholder="https://llm.helix.com/llm/api"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Model
          </label>
          <input
            type="text"
            value={modelInput}
            onChange={e => setModelInput(e.target.value)}
            placeholder="bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0"
          />
        </div>

        {saved && <div className="alert alert-success">Settings saved.</div>}

        <button className="btn btn-primary" onClick={handleSave}>
          Save Settings
        </button>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">Intelligence File</div>
        <div className="settings-section-desc">
          Export to back up your Intelligence File, or import one from a previous export.
          {intelligenceFile && (
            <span> Last updated: {(intelligenceFile.match(/Last updated:\s*(.+)/i) || [])[1] || 'unknown'}</span>
          )}
        </div>

        <div className="btn-row" style={{ marginBottom: '20px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleExport}
            disabled={!intelligenceFile}
          >
            Export (.txt)
          </button>
          <button
            className="btn btn-ghost"
            onClick={handleClear}
            disabled={!intelligenceFile}
            style={{ color: 'var(--danger)' }}
          >
            Clear File
          </button>
        </div>

        <hr className="settings-divider" />

        <div className="form-group">
          <label className="form-label">Import Intelligence File</label>
          <textarea
            rows={6}
            className="mono"
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Paste Intelligence File text here to restore from a backup..."
          />
        </div>

        {importMsg && <div className="alert alert-info">{importMsg}</div>}

        <button className="btn btn-secondary" onClick={handleImport}>
          Import & Save
        </button>
      </div>
    </div>
  )
}
