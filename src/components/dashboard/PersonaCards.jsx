import { confidenceColor } from '../../utils/parser'

export default function PersonaCards({ personas }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-label">Persona Intelligence</span>
        <span className="text-muted text-small">{personas.length} tracked</span>
      </div>
      <div className="panel-body">
        {personas.length === 0 ? (
          <span className="text-muted text-small">No personas tracked yet.</span>
        ) : (
          <div className="cards-scroll">
            {personas.map((p, i) => (
              <PersonaCard key={i} persona={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PersonaCard({ persona }) {
  const conf = confidenceColor(persona.confidence)

  return (
    <div className="entity-card">
      <div className="entity-card-title">{persona.title}</div>
      <div className="entity-card-meta">
        <span className={`badge badge-${conf}`}>{persona.confidence || 'Unknown'}</span>
        {persona.bestChannel && (
          <span className="text-muted text-small">{persona.bestChannel}</span>
        )}
      </div>

      {persona.engagementPattern && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Engagement Pattern</div>
          <div className="entity-card-field-value">{persona.engagementPattern}</div>
        </div>
      )}

      {persona.resonantAngles && (
        <div className="entity-card-field">
          <div className="entity-card-field-label" style={{ color: 'var(--confirmed)' }}>Resonant Angles</div>
          <div className="entity-card-field-value">{persona.resonantAngles}</div>
        </div>
      )}

      {persona.resistantAngles && (
        <div className="entity-card-field">
          <div className="entity-card-field-label" style={{ color: 'var(--retired)' }}>Resistant Angles</div>
          <div className="entity-card-field-value">{persona.resistantAngles}</div>
        </div>
      )}

      {persona.lastUpdated && (
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Updated: {persona.lastUpdated}
        </div>
      )}
    </div>
  )
}
