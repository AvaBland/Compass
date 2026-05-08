export default function ContentPanel({ content }) {
  if (!content) return null

  const blocks = [
    { label: 'Format Performance by Segment', value: content.formatPerformance },
    { label: 'Topic Resonance Map', value: content.topicResonance },
    { label: 'Content Gap Register', value: content.contentGaps },
    { label: 'Voice & Source Credibility', value: content.voiceCredibility },
    { label: 'Content Fatigue Log', value: content.contentFatigue },
    { label: 'Content Whitespace', value: content.whitespace },
  ]

  const visibleBlocks = blocks.filter(b => b.value)

  if (visibleBlocks.length === 0) {
    return (
      <div className="panel dashboard-full">
        <div className="panel-header">
          <span className="panel-label">Content Intelligence</span>
        </div>
        <div className="panel-body">
          <span className="text-muted text-small">No content intelligence yet.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Content Intelligence</span>
      </div>
      <div className="panel-body">
        <div className="content-subgrid">
          {visibleBlocks.map(({ label, value }) => (
            <div key={label} className="content-block">
              <div className="content-block-label">{label}</div>
              <div className="content-block-value">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
