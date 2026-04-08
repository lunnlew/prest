import { memo } from 'react'
import { SkillMeta } from '../../utils/frontmatter'
import './SkillMetaPanel.css'

interface SkillMetaPanelProps {
  meta: SkillMeta
}

// Map skill fields to readable labels and icons
const FIELD_CONFIG: Record<string, { label: string; icon: string; type: 'text' | 'boolean' | 'array' | 'badge' }> = {
  name: { label: 'Name', icon: '📛', type: 'text' },
  description: { label: 'Description', icon: '📖', type: 'text' },
  version: { label: 'Version', icon: '🏷️', type: 'text' },
  author: { label: 'Author', icon: '👤', type: 'text' },
  tags: { label: 'Tags', icon: '🏷️', type: 'array' },
  requires: { label: 'Requires', icon: '📦', type: 'array' },
  'disable-model-invocation': { label: 'Manual Only', icon: '✋', type: 'boolean' },
  'user-invocable': { label: 'User Invocable', icon: '👆', type: 'boolean' },
  'allowed-tools': { label: 'Allowed Tools', icon: '🔧', type: 'array' },
  model: { label: 'Model', icon: '🤖', type: 'text' },
  effort: { label: 'Effort', icon: '⚡', type: 'badge' },
  context: { label: 'Context', icon: '🎭', type: 'text' },
  agent: { label: 'Agent', icon: '🎭', type: 'text' },
  paths: { label: 'Paths', icon: '📁', type: 'array' },
  shell: { label: 'Shell', icon: '💻', type: 'text' },
  'argument-hint': { label: 'Argument Hint', icon: '💡', type: 'text' },
}

const EFFORT_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  max: '#ef4444',
}

function formatValue(value: unknown, type: string): React.ReactNode {
  if (type === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  if (type === 'array' && Array.isArray(value)) {
    return value.map((item, i) => (
      <span key={i} className="skill-meta-tag">
        {item}
      </span>
    ))
  }
  if (type === 'badge' && typeof value === 'string') {
    const color = EFFORT_COLORS[value] || '#888'
    return (
      <span className="skill-meta-badge" style={{ backgroundColor: color }}>
        {value}
      </span>
    )
  }
  return String(value)
}

export const SkillMetaPanel = memo(function SkillMetaPanel({ meta }: SkillMetaPanelProps) {
  // Filter out fields with no value
  const validFields = Object.entries(meta).filter(([, value]) => {
    if (value === undefined || value === null || value === '') return false
    if (typeof value === 'boolean') return true
    if (Array.isArray(value)) return value.length > 0
    return true
  })

  if (validFields.length === 0) {
    return null
  }

  return (
    <div className="skill-meta-panel">
      <div className="skill-meta-header">
        <span className="skill-meta-icon">📋</span>
        <span className="skill-meta-title">Skill Metadata</span>
      </div>
      <div className="skill-meta-grid">
        {validFields.map(([key, value]) => {
          const config = FIELD_CONFIG[key] || { label: key, icon: '📌', type: 'text' as const }
          return (
            <div key={key} className="skill-meta-field">
              <span className="skill-meta-field-icon">{config.icon}</span>
              <span className="skill-meta-field-label">{config.label}:</span>
              <span className="skill-meta-field-value">
                {formatValue(value, config.type)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
