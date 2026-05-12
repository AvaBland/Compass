import React from 'react'
import { confidenceColor } from '../../utils/parser'

const TIER_ORDER = ['C-Suite', 'VP / SVP', 'Director', 'Manager', 'Clinical / Frontline', 'Other']
const TIER_SHORT = {
  'C-Suite': 'C-Suite', 'VP / SVP': 'VP/SVP', 'Director': 'Director',
  'Manager': 'Manager', 'Clinical / Frontline': 'Clinical', 'Other': 'Other',
}

export default function OrgCoverageMap({ personas = [], organizations = [] }) {
  const mapped = personas.map(p => ({
    ...p,
    tier: normalizeTier(p.seniorityLevel) || inferTier(p.title),
    lane: p.serviceLine && p.serviceLine.toLowerCase() !== 'general'
      ? p.serviceLine
      : inferServiceLine(p.title),
  }))

  const activeTiers = TIER_ORDER.filter(t => mapped.some(p => p.tier === t))
  const lanes = [...new Set(mapped.map(p => p.lane))].sort((a, b) => {
    if (a === 'General') return 1
    if (b === 'General') return -1
    return a.localeCompare(b)
  })

  const hasMapData = activeTiers.length > 0 && lanes.length > 0

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Organization Coverage</span>
        <span className="text-muted text-small">
          {personas.length} persona{personas.length !== 1 ? 's' : ''} · {lanes.length} service line{lanes.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="panel-body">
        {hasMapData ? (
          <div className="org-map-scroll">
            <div
              className="org-map"
              style={{ gridTemplateColumns: `110px repeat(${lanes.length}, minmax(150px, 1fr))` }}
            >
              {/* Corner + lane headers */}
              <div className="org-map-corner" />
              {lanes.map(lane => (
                <div key={lane} className="org-map-lane-header">{lane}</div>
              ))}

              {/* Tier rows */}
              {activeTiers.map(tier => (
                <React.Fragment key={tier}>
                  <div className="org-map-tier-label">{TIER_SHORT[tier] || tier}</div>
                  {lanes.map(lane => {
                    const cell = mapped.filter(p => p.tier === tier && p.lane === lane)
                    return (
                      <div key={lane} className={`org-map-cell${cell.length ? '' : ' org-map-cell-empty'}`}>
                        {cell.map((p, i) => <OrgPersonaChip key={i} persona={p} />)}
                      </div>
                    )
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted text-small">
            No coverage data yet. Once personas are tracked, they will appear here organized by seniority and service line.
          </p>
        )}

        {organizations.length > 0 && (
          <div className="org-segments-section">
            <div className="panel-label" style={{ marginBottom: '12px' }}>Organization Segments</div>
            <div className="cards-scroll">
              {organizations.map((o, i) => <OrgSegmentCard key={i} org={o} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function OrgPersonaChip({ persona }) {
  const conf = confidenceColor(persona.confidence)
  const dateColor = outreachDateColor(persona.lastOutreachDate || persona.lastUpdated)
  const title = persona.title.length > 36 ? persona.title.slice(0, 33) + '…' : persona.title
  return (
    <div className="org-persona-chip">
      <span className={`outreach-dot outreach-dot-${dateColor}`} style={{ flexShrink: 0 }} />
      <span className="org-chip-title">{title}</span>
      <span className={`badge badge-${conf}`} style={{ fontSize: '9px', padding: '1px 4px', flexShrink: 0 }}>
        {(persona.confidence || 'Hyp').slice(0, 3)}
      </span>
    </div>
  )
}

function OrgSegmentCard({ org }) {
  const fitColor = { strong: 'confirmed', possible: 'emerging', weak: 'retired' }
  const fit = org.icpFit?.toLowerCase().split(' ')[0]
  return (
    <div className="entity-card">
      <div className="entity-card-title">{org.segment}</div>
      <div className="entity-card-meta">
        <span className={`badge badge-${fitColor[fit] || 'muted'}`}>ICP: {org.icpFit || 'Unknown'}</span>
        <span className={`badge badge-${confidenceColor(org.confidence)}`}>{org.confidence || 'Hypothesis'}</span>
      </div>
      {org.engagementPattern && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Engagement Pattern</div>
          <div className="entity-card-field-value">{org.engagementPattern}</div>
        </div>
      )}
      {org.crossPersonaThemes && (
        <div className="entity-card-field">
          <div className="entity-card-field-label" style={{ color: 'var(--accent-hover)' }}>Cross-Persona Themes</div>
          <div className="entity-card-field-value">{org.crossPersonaThemes}</div>
        </div>
      )}
      {org.personasReached && (
        <div className="entity-card-field">
          <div className="entity-card-field-label">Personas Reached</div>
          <div className="entity-card-field-value">{org.personasReached}</div>
        </div>
      )}
    </div>
  )
}

function outreachDateColor(dateStr) {
  if (!dateStr) return 'muted'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return 'muted'
  const days = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)
  if (days < 14) return 'confirmed'
  if (days < 28) return 'emerging'
  return 'retired'
}

function normalizeTier(level) {
  if (!level) return null
  const l = level.toLowerCase()
  if (l.includes('c-suite') || l === 'c suite') return 'C-Suite'
  if (l.includes('vp') || l.includes('svp') || l.includes('evp') || l.includes('vice president')) return 'VP / SVP'
  if (l.includes('director')) return 'Director'
  if (l.includes('manager')) return 'Manager'
  if (l.includes('clinical') || l.includes('frontline')) return 'Clinical / Frontline'
  return null
}

function inferTier(title) {
  if (!title) return 'Other'
  const t = title.toLowerCase()
  if (/(chief[\s]|\bceo\b|\bcmo\b|\bcno\b|\bcoo\b|\bcfo\b|\bcio\b|\bcdo\b|\bpresident\b)/.test(t)) return 'C-Suite'
  if (/\b(vp\b|vice\s+president|svp\b|evp\b)/.test(t)) return 'VP / SVP'
  if (/\bdirector\b/.test(t)) return 'Director'
  if (/\b(manager|supervisor)\b/.test(t)) return 'Manager'
  if (/\b(nurse|rn\b|np\b|md\b|pa\b|physician|oncologist|coordinator|specialist|clinician)\b/.test(t)) return 'Clinical / Frontline'
  return 'Other'
}

function inferServiceLine(title) {
  if (!title) return 'General'
  const t = title.toLowerCase()
  if (/(oncol|cancer|tumor|hematol)/.test(t)) return 'Oncology'
  if (/\bnurs/.test(t)) return 'Nursing'
  if (/(oper|operations|supply\s+chain|throughput|capacity)/.test(t)) return 'Operations'
  if (/(financ|revenue\s+cycle|billing|reimburse)/.test(t)) return 'Finance'
  if (/(information\s+tech|digital\b|analytics|informatics|it\s+director|it\s+vp)/.test(t)) return 'IT'
  if (/(quality|patient\s+safety|compliance|regulatory)/.test(t)) return 'Quality'
  if (/(strategy|growth|business\s+dev)/.test(t)) return 'Strategy'
  if (/(clinical|patient\s+care|care\s+management|care\s+delivery)/.test(t)) return 'Clinical'
  return 'General'
}
