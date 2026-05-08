import { patternStatusColor } from '../../utils/parser'

export default function PatternLog({ patterns }) {
  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Pattern Log</span>
        <span className="text-muted text-small">{patterns.length} entries</span>
      </div>
      <div className="panel-body">
        {patterns.length === 0 ? (
          <span className="text-muted text-small">No patterns logged yet.</span>
        ) : (
          <div className="pattern-log">
            {[...patterns].reverse().map((entry, i) => {
              const color = patternStatusColor(entry.status)
              return (
                <div key={i} className={`pattern-entry ${color}`}>
                  <span className="pattern-entry-date">{entry.date}</span>
                  <div style={{ flex: 1 }}>
                    <span className={`badge badge-${color}`} style={{ marginBottom: '4px', display: 'inline-flex' }}>
                      {entry.status}
                    </span>
                    <div className="pattern-entry-finding">{entry.finding}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
