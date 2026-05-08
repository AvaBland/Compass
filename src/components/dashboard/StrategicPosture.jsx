export default function StrategicPosture({ data }) {
  if (!data) return null

  const fields = [
    { label: 'Best-Fit ICP Hypothesis', value: data.icpHypothesis, cls: '' },
    { label: 'Strongest Narrative Angle', value: data.strongestNarrative, cls: '' },
    { label: 'Weakest Narrative Angle', value: data.weakestNarrative, cls: '' },
    { label: 'Market Timing Assessment', value: data.marketTiming, cls: '' },
  ]

  const hasContent = fields.some(f => f.value) || data.topQuestion

  if (!hasContent) {
    return (
      <div className="panel dashboard-full">
        <div className="panel-header">
          <span className="panel-label">Strategic Posture</span>
        </div>
        <div className="panel-body">
          <span className="text-muted text-small">No strategic posture data yet.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Strategic Posture</span>
      </div>
      <div className="panel-body">
        <div className="posture-grid">
          {fields.map(({ label, value }) =>
            value ? (
              <div key={label} className="posture-item">
                <div className="posture-item-label">{label}</div>
                <div className="posture-item-value">{value}</div>
              </div>
            ) : null
          )}
          {data.topQuestion && (
            <div className="posture-item posture-question">
              <div className="posture-item-label">Top Open Strategic Question</div>
              <div className="posture-item-value">{data.topQuestion}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
