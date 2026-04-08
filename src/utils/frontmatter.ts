import yaml from 'js-yaml'

export interface SkillMeta {
  name?: string
  description?: string
  'disable-model-invocation'?: boolean
  'user-invocable'?: boolean
  'allowed-tools'?: string | string[]
  model?: string
  effort?: 'low' | 'medium' | 'high' | 'max'
  context?: string
  agent?: string
  hooks?: Record<string, unknown>
  paths?: string | string[]
  shell?: 'bash' | 'powershell'
  'argument-hint'?: string
  version?: string
  author?: string
  tags?: string | string[]
  requires?: string | string[]
  [key: string]: unknown
}

export interface ParsedSkillDoc {
  meta: SkillMeta
  content: string
}

/**
 * Parse skill document with YAML frontmatter (browser-compatible)
 */
export function parseSkillDoc(content: string): ParsedSkillDoc {
  const trimmed = content.trim()

  // Check if content has frontmatter
  if (!trimmed.startsWith('---')) {
    return { meta: {}, content }
  }

  // Find closing ---
  const endIndex = trimmed.indexOf('---', 3)
  if (endIndex === -1) {
    // No closing ---, treat as regular content
    return { meta: {}, content }
  }

  // Extract YAML and body
  const yamlStr = trimmed.slice(3, endIndex).trim()
  const body = trimmed.slice(endIndex + 3).trim()

  try {
    const meta = yaml.load(yamlStr) as SkillMeta
    return {
      meta: meta || {},
      content: body,
    }
  } catch {
    return { meta: {}, content }
  }
}

/**
 * Check if content has frontmatter
 */
export function hasFrontmatter(content: string): boolean {
  return content.trim().startsWith('---')
}
