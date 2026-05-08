export default function NarrativePanel({ narrative }) {
  if (!narrative) return null

  const blocks = [
    { label: 'Resonant', cls: 'resonant', value: narrative.resonant },
    { label: 'Flat', cls: 'flat', value: narrative.flat },
    { label: 'Polarizing', cls: 'polarizing', value: narrative.polarizing },
    { label: 'Prospect Language Bank', cls: 'language', value: narrative.languageBank },
  ]

  const hasContent = blocks.some(b => b.value)

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Narrative Intelligence</span>
      </div>
      <div className="panel-body">
        {!hasContent ? (
          <span className="text-muted text-small">No narrative intelligence yet.</span>
        ) : (
          <div className="narrative-grid">
            {blocks.map(({ label, cls, value }) =>
              value ? (
                <div
                  key={label}
                  className={`narrative-block${label === 'Prospect Language Bank' ? ' narrative-block-full' : ''}`}
                >
                  <div className={`narrative-block-label ${cls}`}>{label}</div>
                  <div className="narrative-block-content">{value}</div>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  )
}
