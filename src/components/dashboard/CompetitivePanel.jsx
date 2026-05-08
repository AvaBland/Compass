export default function CompetitivePanel({ competitive }) {
  if (!competitive) return null

  const blocks = [
    { label: 'Observed Competitive Themes', cls: 'themes', value: competitive.themes },
    { label: 'Positioning Vulnerabilities', cls: 'vulnerabilities', value: competitive.vulnerabilities },
    { label: 'Positioning Strengths', cls: 'strengths', value: competitive.strengths },
  ]

  const hasContent = blocks.some(b => b.value)

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Competitive & Contextual</span>
      </div>
      <div className="panel-body">
        {!hasContent ? (
          <span className="text-muted text-small">No competitive intelligence yet.</span>
        ) : (
          <div className="competitive-grid">
            {blocks.map(({ label, cls, value }) =>
              value ? (
                <div key={label} className="comp-block">
                  <div className={`comp-block-label ${cls}`}>{label}</div>
                  <div className="comp-block-value">{value}</div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}
