export default function PerformanceOverview({ data }) {
  if (!data) return null

  const hasNewFields = data.bestSendTime || data.topSubjectLines || data.highestReplySegments ||
    data.highestConversionSegments || data.negativeTrends || data.recommendations
  const hasOldFields = data.icpHypothesis || data.strongestNarrative || data.weakestNarrative ||
    data.marketTiming || data.topQuestion
  const hasLearnings = data.learnings?.length > 0
  const hasSequence = data.emailSequence &&
    (data.emailSequence.replyDist?.length || data.emailSequence.conversionDist?.length ||
     data.emailSequence.avgEmailsToReply || data.emailSequence.avgEmailsToConversion)

  if (!hasNewFields && !hasOldFields && !hasLearnings && !hasSequence) {
    return (
      <div className="panel dashboard-full">
        <div className="panel-header"><span className="panel-label">Performance Overview</span></div>
        <div className="panel-body"><span className="text-muted text-small">No performance data yet.</span></div>
      </div>
    )
  }

  return (
    <div className="panel dashboard-full">
      <div className="panel-header"><span className="panel-label">Performance Overview</span></div>
      <div className="panel-body perf-body">

        {hasNewFields && (
          <>
            {(data.bestSendTime || data.topSubjectLines || data.highestReplySegments || data.highestConversionSegments) && (
              <div className="perf-stats-row">
                <StatTile label="Best Send Time" value={data.bestSendTime} />
                <StatTile label="Top Subject Lines" value={data.topSubjectLines} />
                <StatTile label="Highest Reply Segments" value={data.highestReplySegments} />
                <StatTile label="Highest Conversion Segments" value={data.highestConversionSegments} />
              </div>
            )}
            {(data.negativeTrends || data.recommendations) && (
              <div className="perf-insights-row">
                {data.negativeTrends && (
                  <div className="perf-insight-block perf-insight-negative">
                    <div className="perf-insight-label">Negative Trends</div>
                    <div className="perf-insight-value">{data.negativeTrends}</div>
                  </div>
                )}
                {data.recommendations && (
                  <div className="perf-insight-block perf-insight-recommendations">
                    <div className="perf-insight-label">Recommendations</div>
                    <div className="perf-insight-value">{data.recommendations}</div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {hasSequence && (
          <div>
            <div className="perf-section-label">Email Sequence — When Replies & Meetings Happen</div>
            {(data.emailSequence.avgEmailsToReply || data.emailSequence.avgEmailsToConversion || data.emailSequence.avgDaysBetweenTouches) && (
              <div className="seq-stats-row">
                <SeqStat label="Avg emails → first reply" value={data.emailSequence.avgEmailsToReply} />
                <SeqStat label="Avg emails → meeting" value={data.emailSequence.avgEmailsToConversion} />
                <SeqStat label="Avg days between touches" value={data.emailSequence.avgDaysBetweenTouches} />
              </div>
            )}
            {(data.emailSequence.replyDist?.length > 0 || data.emailSequence.conversionDist?.length > 0) && (
              <SequenceChart
                replyDist={data.emailSequence.replyDist}
                convDist={data.emailSequence.conversionDist}
              />
            )}
          </div>
        )}

        {hasLearnings && (
          <div>
            <div className="perf-section-label">Learnings</div>
            <div className="learnings-log">
              {data.learnings.map((l, i) => (
                <div key={i} className="learning-entry">
                  {l.date && <span className="learning-date">{l.date}</span>}
                  <span className="learning-text">{l.observation}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasOldFields && (
          <div className={`posture-grid${hasNewFields || hasSequence || hasLearnings ? ' posture-grid-mt' : ''}`}>
            {data.icpHypothesis && <PostureItem label="Best-Fit ICP Hypothesis" value={data.icpHypothesis} />}
            {data.strongestNarrative && <PostureItem label="Strongest Narrative Angle" value={data.strongestNarrative} />}
            {data.weakestNarrative && <PostureItem label="Weakest Narrative Angle" value={data.weakestNarrative} />}
            {data.marketTiming && <PostureItem label="Market Timing Assessment" value={data.marketTiming} />}
            {data.topQuestion && (
              <div className="posture-item posture-question">
                <div className="posture-item-label">Top Open Strategic Question</div>
                <div className="posture-item-value">{data.topQuestion}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatTile({ label, value }) {
  if (!value) return null
  return (
    <div className="perf-stat-tile">
      <div className="perf-stat-label">{label}</div>
      <div className="perf-stat-value">{value}</div>
    </div>
  )
}

function SeqStat({ label, value }) {
  if (!value) return null
  return (
    <div className="seq-stat">
      <div className="seq-stat-label">{label}</div>
      <div className="seq-stat-value">{value}</div>
    </div>
  )
}

function SequenceChart({ replyDist, convDist }) {
  const all = [...(replyDist || []), ...(convDist || [])]
  if (!all.length) return null

  const labelSet = new Set([...(replyDist || []).map(d => d.label), ...(convDist || []).map(d => d.label)])
  const labels = [...labelSet].sort((a, b) => {
    const na = a === 'E5+' ? 99 : parseInt(a.slice(1), 10)
    const nb = b === 'E5+' ? 99 : parseInt(b.slice(1), 10)
    return na - nb
  })

  const rMap = Object.fromEntries((replyDist || []).map(d => [d.label, d.value]))
  const cMap = Object.fromEntries((convDist || []).map(d => [d.label, d.value]))
  const max = Math.max(1, ...all.map(d => d.value))

  return (
    <div className="seq-chart-wrap">
      <div className="seq-chart">
        {labels.map(label => {
          const r = rMap[label] || 0
          const c = cMap[label] || 0
          return (
            <div key={label} className="seq-bar-group">
              <div className="seq-bars">
                {r > 0 && <div className="seq-bar seq-bar-reply" style={{ height: `${(r / max) * 60}px` }} title={`${r} replies`} />}
                {c > 0 && <div className="seq-bar seq-bar-conv" style={{ height: `${(c / max) * 60}px` }} title={`${c} conversions`} />}
              </div>
              <div className="seq-bar-label">{label}</div>
              <div className="seq-bar-vals">
                {r > 0 && <span className="seq-val-reply">{r}</span>}
                {c > 0 && <span className="seq-val-conv">{c}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="seq-legend">
        <span className="seq-legend-item"><span className="seq-legend-dot seq-legend-reply" />Replies</span>
        <span className="seq-legend-item"><span className="seq-legend-dot seq-legend-conv" />Meetings</span>
      </div>
    </div>
  )
}

function PostureItem({ label, value }) {
  return (
    <div className="posture-item">
      <div className="posture-item-label">{label}</div>
      <div className="posture-item-value">{value}</div>
    </div>
  )
}
