import { useState } from 'react'
import { confidenceColor } from '../../utils/parser'

export default function PersonaCards({ personas = [] }) {
  const [expanded, setExpanded] = useState({})
  const toggle = i => setExpanded(e => ({ ...e, [i]: !e[i] }))

  return (
    <div className="panel dashboard-full">
      <div className="panel-header">
        <span className="panel-label">Persona Intelligence</span>
        <span className="text-muted text-small">{personas.length} tracked</span>
      </div>
      <div className="panel-body">
        {personas.length === 0 ? (
          <span className="text-muted text-small">No personas tracked yet.</span>
        ) : (
          <div className="persona-list">
            {personas.map((p, i) => (
              <PersonaCard key={i} persona={p} isExpanded={!!expanded[i]} onToggle={() => toggle(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PersonaCard({ persona, isExpanded, onToggle }) {
  const conf = confidenceColor(persona.confidence)
  const dateStr = persona.lastOutreachDate || persona.lastUpdated
  const dateColor = outreachDateColor(dateStr)
  const bizDays = businessDaysSince(dateStr)
  const touch = parseTouchHistory(persona.touchHistory)

  const cohortCount = persona.expertCohorts
    ? persona.expertCohorts.trim().split('\n').filter(l => l.trim()).length
    : 0

  const resonantSnippet = persona.resonantAngles
    ? persona.resonantAngles.split('\n')[0].replace(/^\s*[-•·]\s*/, '').slice(0, 100)
    : null
  const subjectSnippet = persona.resonantSubjectLines
    ? persona.resonantSubjectLines.split('\n')[0].replace(/^\s*\d+\.\s*/, '').replace(/^\s*[-•·]\s*/, '').slice(0, 100)
    : null

  return (
    <div className={`persona-card${isExpanded ? ' persona-card-open' : ''}`}>
      <div className="persona-card-header">
        <div className="persona-card-title-row">
          <div className="persona-card-title">{persona.title}</div>
          <div className="persona-card-badges">
            {persona.seniorityLevel && <span className="badge badge-muted">{shortenTier(persona.seniorityLevel)}</span>}
            {persona.serviceLine && persona.serviceLine.toLowerCase() !== 'general' && (
              <span className="badge badge-muted">{persona.serviceLine}</span>
            )}
            <span className={`badge badge-${conf}`}>{persona.confidence || 'Unknown'}</span>
            {persona.bestChannel && <span className="text-muted text-small">{persona.bestChannel}</span>}
          </div>
        </div>
        <div className="persona-card-stats">
          <span className="outreach-date-badge">
            <span className={`outreach-dot outreach-dot-${dateColor}`} />
            {dateStr || 'No outreach date'}
            {bizDays !== null && <span className="biz-days-suffix"> · {bizDays}bd ago</span>}
          </span>
          {touch ? (
            <>
              <span className="persona-stat-chip">email ×{touch.email ?? '—'}</span>
              <span className="persona-stat-chip">LI ×{touch.linkedin ?? '—'}</span>
              <span className="persona-stat-chip">calls ×{touch.calls ?? '—'}</span>
            </>
          ) : (
            <span className="persona-stat-chip text-muted">{persona.totalEmailsSent ? `${persona.totalEmailsSent} sent` : 'no touch data'}</span>
          )}
          {persona.openReplyRate && <span className="persona-stat-chip">{persona.openReplyRate}</span>}
          {cohortCount > 0 && (
            <span className="persona-stat-chip persona-cohort-chip">
              {cohortCount} cohort{cohortCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {!isExpanded && (
        <div className="persona-card-preview">
          {resonantSnippet && (
            <div className="persona-preview-row">
              <span className="persona-preview-label">Resonant</span>
              <span className="persona-preview-value">{resonantSnippet}</span>
            </div>
          )}
          {subjectSnippet && (
            <div className="persona-preview-row">
              <span className="persona-preview-label">Top subject</span>
              <span className="persona-preview-value">{subjectSnippet}</span>
            </div>
          )}
          {!resonantSnippet && !subjectSnippet && persona.engagementPattern && (
            <div className="persona-preview-row">
              <span className="persona-preview-label">Pattern</span>
              <span className="persona-preview-value">{persona.engagementPattern.slice(0, 120)}</span>
            </div>
          )}
          <div className="persona-card-footer">
            <button className="btn btn-ghost btn-sm" onClick={onToggle}>View details →</button>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="persona-card-expanded">
          <div className="persona-expanded-grid">
            {persona.engagementPattern && (
              <ExpandedField label="Engagement Pattern" value={persona.engagementPattern} />
            )}
            {(persona.resonantSubjectLines || persona.flatSubjectLines) && (
              <div className={persona.resonantSubjectLines && persona.flatSubjectLines ? 'persona-subjects-row' : ''}>
                {persona.resonantSubjectLines && (
                  <ExpandedField label="Subject Lines — Resonant" value={persona.resonantSubjectLines} color="var(--confirmed)" />
                )}
                {persona.flatSubjectLines && (
                  <ExpandedField label="Subject Lines — Flat" value={persona.flatSubjectLines} color="var(--retired)" />
                )}
              </div>
            )}
            {persona.frameworkAnalysis && (
              <ExpandedField label="Email Framework Analysis" value={persona.frameworkAnalysis} />
            )}
            {persona.valueProps && (
              <ExpandedField label="Value Propositions" value={persona.valueProps} />
            )}
            {(persona.resonantAngles || persona.resistantAngles) && (
              <div className={persona.resonantAngles && persona.resistantAngles ? 'persona-angles-row' : ''}>
                {persona.resonantAngles && (
                  <ExpandedField label="Resonant Angles" value={persona.resonantAngles} color="var(--confirmed)" />
                )}
                {persona.resistantAngles && (
                  <ExpandedField label="Resistant Angles" value={persona.resistantAngles} color="var(--retired)" />
                )}
              </div>
            )}
            {persona.expertCohorts && persona.expertCohorts.trim() && (
              <div>
                <div className="persona-field-label">Expert Cohorts</div>
                <div className="cohort-block">{persona.expertCohorts}</div>
              </div>
            )}
          </div>
          <div className="persona-card-footer">
            <button className="btn btn-ghost btn-sm" onClick={onToggle}>← Collapse</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpandedField({ label, value, color }) {
  if (!value) return null
  return (
    <div>
      <div className="persona-field-label" style={color ? { color } : {}}>{label}</div>
      <div className="persona-field-value">{value}</div>
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

function businessDaysSince(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  const today = new Date()
  if (d >= today) return 0
  let days = 0
  const cur = new Date(d)
  while (cur < today) {
    cur.setDate(cur.getDate() + 1)
    const day = cur.getDay()
    if (day !== 0 && day !== 6) days++
  }
  return days
}

function parseTouchHistory(text) {
  if (!text) return null
  // Match "Email: 12" or "Email: 12 sends" etc.
  const email = text.match(/Email:\s*(\d+)/i)?.[1]
  const linkedin = text.match(/LinkedIn:\s*(\d+)/i)?.[1]
  const calls = text.match(/Calls?:\s*(\d+)/i)?.[1]
  if (!email && !linkedin && !calls) return null
  return {
    email: email != null ? parseInt(email, 10) : null,
    linkedin: linkedin != null ? parseInt(linkedin, 10) : null,
    calls: calls != null ? parseInt(calls, 10) : null,
  }
}

function shortenTier(level) {
  if (!level) return level
  const l = level.toLowerCase()
  if (l.includes('c-suite') || l === 'c-suite') return 'C-Suite'
  if (l.includes('vp') || l.includes('svp') || l.includes('vice president')) return 'VP/SVP'
  if (l.includes('director')) return 'Dir.'
  if (l.includes('manager')) return 'Mgr.'
  if (l.includes('clinical') || l.includes('frontline')) return 'Clinical'
  return level
}
