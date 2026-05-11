export default function PerformanceOverview({ data }) {
  if (!data) return null

  const hasNewFields = data.bestSendTime || data.topSubjectLines || data.highestReplySegments ||
    data.highestConversionSegments || data.negativeTrends || data.recommendations
  const hasOldFields = data.icpHypothesis || data.strongestNarrative || data.weakestNarrative ||
    data.marketTiming || data.topQuestion

  if (!hasNewFields && !hasOldFields) {
    return (
      <div className="panel dashboard-full">
        <div className="panel-header">
          <span className="panel-label">Performance Overview</span>
        </div>
        <div className="panel-body">
          <span className="text-muted text-small">No performance data yet.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Performance Overview</span>
      </div>
      <div className="panel-body">
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

        {hasOldFields && (
          <div className={`posture-grid${hasNewFields ? ' posture-grid-mt' : ''}`}>
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

function PostureItem({ label, value }) {
  return (
    <div className="posture-item">
      <div className="posture-item-label">{label}</div>
      <div className="posture-item-value">{value}</div>
    </div>
  )
}
