export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'codeBlock'
  | 'list'
  | 'blockquote'
  | 'table'
  | 'html'
  | 'hr'
  | 'callout'

export interface MarkdownBlock {
  id: string
  type: BlockType
  raw: string
  level?: number
  language?: string
}

// Simple block splitter - splits markdown into top-level blocks
export function splitMarkdownToBlocks(markdown: string): MarkdownBlock[] {
  if (!markdown.trim()) return []

  // Handle frontmatter - check if content starts with ---
  // If so, skip the frontmatter section (everything between the opening and closing ---)
  let processedMarkdown = markdown
  if (markdown.trim().startsWith('---')) {
    const endFrontmatter = markdown.indexOf('---', 3)
    if (endFrontmatter !== -1) {
      processedMarkdown = markdown.slice(endFrontmatter + 1).trim()
    }
  }

  const blocks: MarkdownBlock[] = []
  const lines = processedMarkdown.split('\n')
  let currentBlock: string[] = []
  let currentType: BlockType = 'paragraph'
  let currentLevel = 1
  let currentLang = ''
  let blockStartLine = 0
  let inCodeBlock = false

  // Helper to finalize current block
  const finalizeBlock = () => {
    if (currentBlock.length === 0) return

    const raw = currentBlock.join('\n').trim()
    if (!raw) return

    // Detect callout (starts with :::)
    if (raw.startsWith(':::')) {
      blocks.push({
        id: `callout-${blockStartLine}`,
        type: 'callout',
        raw,
      })
    } else {
      blocks.push({
        id: `${currentType}-${blockStartLine}`,
        type: currentType,
        raw,
        level: currentType === 'heading' ? currentLevel : undefined,
        language: currentType === 'codeBlock' ? currentLang : undefined,
      })
    }

    currentBlock = []
    currentType = 'paragraph'
    currentLevel = 1
    currentLang = ''
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Handle code blocks
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        finalizeBlock()
        inCodeBlock = true
        currentLang = trimmedLine.slice(3).trim() || 'text'
        currentBlock = [line]
      } else {
        // End of code block
        currentBlock.push(line)
        finalizeBlock()
        inCodeBlock = false
      }
      continue
    }

    if (inCodeBlock) {
      currentBlock.push(line)
      continue
    }

    // Check for heading
    const headingMatch = trimmedLine.match(/^(#{1,6})\s/)
    if (headingMatch && !currentBlock.length) {
      finalizeBlock()
      currentType = 'heading'
      currentLevel = headingMatch[1].length
      currentBlock.push(line)
      continue
    }

    // Check for horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine) && !currentBlock.length) {
      finalizeBlock()
      blocks.push({
        id: `hr-${i}`,
        type: 'hr',
        raw: trimmedLine,
      })
      continue
    }

    // Check for blockquote
    if (trimmedLine.startsWith('>') && !currentBlock.length) {
      finalizeBlock()
      currentType = 'blockquote'
      currentBlock.push(line)
      continue
    }

    // Check for list
    if ((trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || /^\d+\.\s/.test(trimmedLine)) && !currentBlock.length) {
      finalizeBlock()
      currentType = 'list'
      currentBlock.push(line)
      continue
    }

    // Empty line - end current block
    if (trimmedLine === '') {
      if (currentBlock.length > 0) {
        finalizeBlock()
      }
      continue
    }

    // Add to current block
    if (currentBlock.length === 0) {
      blockStartLine = i
    }
    currentBlock.push(line)
  }

  // Finalize any remaining block
  if (currentBlock.length > 0) {
    finalizeBlock()
  }

  return blocks
}

// Estimate block height based on type and content
export function estimateBlockHeight(block: MarkdownBlock): number {
  const LINE_HEIGHT = 28 // pixels per line (increased for better accuracy)

  switch (block.type) {
    case 'heading':
      return 40 + (6 - (block.level || 1)) * 8

    case 'codeBlock': {
      const lines = block.raw.split('\n').length
      return Math.min(Math.max(lines * LINE_HEIGHT, 60), 600)
    }

    case 'list': {
      const itemCount = (block.raw.match(/^[\s]*[-*+]\s|^[\s]*\d+\.\s/gm) || []).length
      return Math.max(itemCount * LINE_HEIGHT * 2, 40)
    }

    case 'table': {
      const rowCount = (block.raw.match(/^\|.*\|$/gm) || []).length
      return rowCount * LINE_HEIGHT * 2
    }

    case 'blockquote':
    case 'callout': {
      const bqLines = block.raw.split('\n').length
      return Math.max(bqLines * LINE_HEIGHT, 60)
    }

    case 'hr':
      return 40

    case 'html':
      return 40

    default: {
      const chars = block.raw.length
      const estimatedLines = Math.ceil(chars / 80)
      return Math.max(estimatedLines * LINE_HEIGHT, 30)
    }
  }
}
