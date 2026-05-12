export default function ActionBoard({ data }) {
  if (!data) return null

  const hasContent = data.working || data.notWorking || data.nextMoves?.length || data.hold
  if (!hasContent) {
    return (
      <div className="panel dashboard-full">
        <div className="panel-header">
          <span className="panel-label">Action Board</span>
        </div>
        <div className="panel-body">
          <span className="text-muted text-small">No action intelligence yet — add data to generate recommended moves.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="panel dashboard-full action-board-panel">
      <div className="panel-header">
        <span className="panel-label">Action Board</span>
        {data.lastUpdated && <span className="text-muted text-small">Updated {data.lastUpdated}</span>}
      </div>
      <div className="panel-body action-board-body">

        {/* What Is Working / What Is Not Working */}
        {(data.working || data.notWorking) && (
          <div className="action-status-row">
            {data.working && (
              <div className="action-status-block action-status-working">
                <div className="action-status-label">What Is Working</div>
                <BulletList text={data.working} />
              </div>
            )}
            {data.notWorking && (
              <div className="action-status-block action-status-not-working">
                <div className="action-status-label">What Is Not Working</div>
                <BulletList text={data.notWorking} />
              </div>
            )}
          </div>
        )}

        {/* Next Moves */}
        {data.nextMoves?.length > 0 && (
          <div>
            <div className="action-section-heading">Next Moves</div>
            <div className="action-moves-list">
              {data.nextMoves.map((move, i) => (
                <MoveCard key={i} move={move} number={i + 1} />
              ))}
            </div>
          </div>
        )}

        {/* Hold */}
        {data.hold && (
          <div>
            <div className="action-section-heading">Hold / Deprioritize</div>
            <div className="action-hold-block">
              <BulletList text={data.hold} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function MoveCard({ move, number }) {
  const isMeetingAsk = move.moveType?.toLowerCase().includes('meeting ask')
  const hasCollateral = move.collateral && !/^none$/i.test(move.collateral.trim())

  return (
    <div className="move-card">
      <div className="move-card-header">
        <div className="move-card-number">{number}</div>
        <div className="move-card-who">{move.who}</div>
        <div className="move-card-meta">
          {move.channel && (
            <span className="move-chip move-chip-channel">{move.channel}</span>
          )}
          {move.moveType && (
            <span className={`move-chip ${isMeetingAsk ? 'move-chip-meeting' : 'move-chip-value'}`}>
              {isMeetingAsk ? 'Meeting ask' : 'Value give'}
            </span>
          )}
        </div>
      </div>

      {move.theme && (
        <div className="move-card-row">
          <span className="move-field-label">Theme</span>
          <span className="move-field-value">{move.theme}</span>
        </div>
      )}
      {hasCollateral && (
        <div className="move-card-row">
          <span className="move-field-label">Collateral</span>
          <span className="move-field-value">{move.collateral}</span>
        </div>
      )}
      {move.whyNow && (
        <div className="move-card-row move-card-why">
          <span className="move-field-label">Why now</span>
          <span className="move-field-value">{move.whyNow}</span>
        </div>
      )}
    </div>
  )
}

function BulletList({ text }) {
  if (!text) return null
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  return (
    <ul className="action-bullet-list">
      {lines.map((line, i) => (
        <li key={i}>{line.replace(/^[•·\-]\s*/, '')}</li>
      ))}
    </ul>
  )
}
