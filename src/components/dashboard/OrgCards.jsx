import { confidenceColor } from '../../utils/parser'

export default function OrgCards({ organizations }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Organization Intelligence</span>
        <span className="text-muted text-small">{organizations.length} segments</span>
      </div>
      <div className="panel-body">
        {organizations.length === 0 ? (
          <span className="text-muted text-small">No organization segments tracked yet.</span>
        ) : (
          <div className="cards-scroll">
            {organizations.map((o, i) => (
              <OrgCard key={i} org={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function icpFitColor(fit) {
  if (!fit) return 'muted'
  const lower = fit.toLowerCase()
  if (lower.includes('strong')) return 'confirmed'
  if (lower.includes('possible')) return 'emerging'
  if (lower.includes('weak')) return 'retired'
  return 'muted'
}

function OrgCard({ org }) {
  const conf = confidenceColor(org.confidence)
  const fitColor = icpFitColor(org.icpFit)

  return (
    <div className="entity-card">
      <div className="entity-card-title">{org.segment}</div>
      <div className="entity-card-meta">
        <span className={`badge badge-${conf}`}>{org.confidence || 'Unknown'}</span>
        {org.icpFit && (
          <span className={`badge badge-${fitColor}`}>ICP: {org.icpFit}</span>
        )}
      </div>

      {org.engagementPattern && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Engagement Pattern</div>
          <div className="entity-card-field-value">{org.engagementPattern}</div>
        </div>
      )}

      {org.conversionSignal && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Conversion Signal</div>
          <div className="entity-card-field-value">{org.conversionSignal}</div>
        </div>
      )}

      {org.characteristics && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Notable Characteristics</div>
          <div className="entity-card-field-value">{org.characteristics}</div>
        </div>
      )}

      {org.lastUpdated && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Updated: {org.lastUpdated}
        </div>
      )}
    </div>
  )
}
