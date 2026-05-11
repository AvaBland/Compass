import { confidenceColor } from '../../utils/parser'

export default function OrgCards({ organizations }) {
  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Organization Intelligence</span>
        <span className="text-muted text-small">{organizations.length} segments</span>
      </div>
      <div className="panel-body">
        {organizations.length === 0 ? (
          <span className="text-muted text-small">No organization segments tracked yet.</span>
        ) : (
          <div className="cards-scroll">
            {organizations.map((o, i) => <OrgCard key={i} org={o} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function icpColor(fit) {
  if (!fit) return 'muted'
  const l = fit.toLowerCase()
  if (l.includes('strong')) return 'confirmed'
  if (l.includes('possible')) return 'emerging'
  if (l.includes('weak')) return 'retired'
  return 'muted'
}

function conversionColor(signal) {
  if (!signal) return 'var(--text-muted)'
  const l = signal.toLowerCase()
  if (l.includes('high')) return 'var(--confirmed)'
  if (l.includes('medium')) return 'var(--emerging)'
  if (l.includes('low')) return 'var(--retired)'
  return 'var(--text-muted)'
}

function OrgCard({ org }) {
  const conf = confidenceColor(org.confidence)
  const fitColor = icpColor(org.icpFit)

  return (
    <div className="entity-card">
      <div className="entity-card-title">{org.segment}</div>
      <div className="entity-card-meta">
        <span className={`badge badge-${fitColor}`}>ICP: {org.icpFit || 'Unknown'}</span>
        <span className={`badge badge-${conf}`}>{org.confidence || 'Hypothesis'}</span>
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
          <div className="entity-card-field-value" style={{ color: conversionColor(org.conversionSignal) }}>
            {org.conversionSignal}
          </div>
        </div>
      )}

      {org.characteristics && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Characteristics</div>
          <div className="entity-card-field-value">{org.characteristics}</div>
        </div>
      )}

      {org.personasReached && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Personas Reached</div>
          <div className="entity-card-field-value">{org.personasReached}</div>
        </div>
      )}

      {org.crossPersonaThemes && (
        <div className="entity-card-field">
          <div className="entity-card-field-label" style={{ color: 'var(--accent-hover)' }}>Cross-Persona Themes</div>
          <div className="entity-card-field-value">{org.crossPersonaThemes}</div>
        </div>
      )}
    </div>
  )
}
