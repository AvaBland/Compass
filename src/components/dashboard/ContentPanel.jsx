export default function ContentPanel({ content }) {
  if (!content) return null

  const blocks = [
    { label: 'Format Winners by Segment', value: content.formatPerformance },
    { label: 'Topic Resonance', value: content.topicResonance },
    { label: 'Content Gaps', value: content.contentGaps },
    { label: 'Voice & Source Credibility', value: content.voiceCredibility },
  ].filter(b => b.value)

  if (!blocks.length) return null

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Content Intelligence</span>
      </div>
      <div className="panel-body">
        <div className="content-subgrid">
          {blocks.map(({ label, value }) => (
            <div key={label} className="content-block">
              <div className="content-block-label">{label}</div>
              <ul className="content-list">
                {parseItems(value).map((item, i) => (
                  <li key={i} className="content-list-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function parseItems(text) {
  if (!text) return [text]
  const lines = text
    .split(/\n/)
    .map(l => l.replace(/^[\s•\-–—*\[\]]+/, '').trim())
    .filter(l => l.length > 5 && !l.match(/^\[.*\]$/))
    .slice(0, 6)
  return lines.length ? lines : [text.slice(0, 200)]
}
