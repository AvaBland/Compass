export default function NarrativePanel({ narrative }) {
  if (!narrative) return null

  const hasContent = narrative.resonant || narrative.flat || narrative.polarizing || narrative.languageBank
  if (!hasContent) return null

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Narrative Intelligence</span>
      </div>
      <div className="panel-body">
        <div className="narrative-grid">
          {narrative.resonant && (
            <NarrativeBlock
              label="What's Resonating"
              items={parseItems(narrative.resonant)}
              color="var(--confirmed)"
              bg="var(--confirmed-dim)"
            />
          )}
          {narrative.flat && (
            <NarrativeBlock
              label="What's Falling Flat"
              items={parseItems(narrative.flat)}
              color="var(--retired)"
              bg="var(--retired-dim)"
            />
          )}
          {narrative.polarizing && (
            <NarrativeBlock
              label="Polarizing (Test Further)"
              items={parseItems(narrative.polarizing)}
              color="var(--emerging)"
              bg="var(--emerging-dim)"
            />
          )}
          {narrative.languageBank && (
            <LanguageBank items={parseLanguageItems(narrative.languageBank)} />
          )}
        </div>
      </div>
    </div>
  )
}

function NarrativeBlock({ label, items, color, bg }) {
  if (!items.length) return null
  return (
    <div className="narrative-block">
      <div className="narrative-block-label" style={{ color }}>{label}</div>
      <ul className="narrative-list">
        {items.map((item, i) => (
          <li key={i} className="narrative-list-item">
            <span className="narrative-dot" style={{ background: color }} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LanguageBank({ items }) {
  if (!items.length) return null
  return (
    <div className="narrative-block narrative-block-full">
      <div className="narrative-block-label" style={{ color: 'var(--accent-hover)' }}>Prospect Language Bank</div>
      <div className="language-chips">
        {items.map((phrase, i) => (
          <span key={i} className="language-chip">{phrase}</span>
        ))}
      </div>
    </div>
  )
}

function parseItems(text) {
  if (!text) return []
  return text
    .split(/\n/)
    .map(line => line.replace(/^[\s•\-–—*\[\]]+/, '').replace(/\s*—\s*\[.*?\]\s*—.*$/, '').trim())
    .filter(line => line.length > 8 && !line.match(/^\[.*\]$/))
    .slice(0, 6)
}

function parseLanguageItems(text) {
  if (!text) return []
  return text
    .split(/\n/)
    .map(line => {
      const cleaned = line.replace(/^[\s•\-–—*\[\]]+/, '').trim()
      const quoted = cleaned.match(/["'](.+?)["']/)
      return quoted ? quoted[1] : cleaned
    })
    .filter(line => line.length > 4 && !line.match(/^\[.*\]$/))
    .slice(0, 10)
}
