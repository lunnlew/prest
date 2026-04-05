import { TextBlock } from '../types'

/**
 * Parse markdown content into text blocks
 */
export function parseMarkdownToBlocks(content: string): TextBlock[] {
  const lines = content.split('\n')
  const blocks: TextBlock[] = []
  let blockIndex = 0
  let inCodeBlock = false
  let codeBlockContent = ''
  let codeBlockLanguage = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block handling
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          id: `block-${blockIndex++}`,
          content: codeBlockContent,
          type: 'code',
          language: codeBlockLanguage,
        })
        codeBlockContent = ''
        codeBlockLanguage = ''
        inCodeBlock = false
      } else {
        // Start code block
        inCodeBlock = true
        codeBlockLanguage = line.slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line
      continue
    }

    // Skip empty lines but preserve paragraph separation
    if (line.trim() === '') {
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.*)/)
    if (headingMatch) {
      blocks.push({
        id: `block-${blockIndex++}`,
        content: headingMatch[2],
        type: 'heading',
        level: headingMatch[1].length,
      })
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      blocks.push({
        id: `block-${blockIndex++}`,
        content: '',
        type: 'hr',
      })
      continue
    }

    // Blockquote
    if (line.startsWith('>')) {
      blocks.push({
        id: `block-${blockIndex++}`,
        content: line.slice(1).trim(),
        type: 'blockquote',
      })
      continue
    }

    // List item
    if (/^[-*+]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      blocks.push({
        id: `block-${blockIndex++}`,
        content: line,
        type: 'list',
      })
      continue
    }

    // Default: paragraph
    // Merge consecutive lines into paragraphs
    let paragraphContent = line
    while (i + 1 < lines.length) {
      const nextLine = lines[i + 1]
      if (
        nextLine.trim() === '' ||
        nextLine.startsWith('#') ||
        nextLine.startsWith('```') ||
        nextLine.startsWith('>') ||
        /^[-*+]\s+/.test(nextLine) ||
        /^\d+\.\s+/.test(nextLine)
      ) {
        break
      }
      i++
      paragraphContent += ' ' + nextLine
    }

    blocks.push({
      id: `block-${blockIndex++}`,
      content: paragraphContent,
      type: 'paragraph',
    })
  }

  return blocks
}

/**
 * Extract headings from markdown for outline view
 */
export function extractHeadings(
  content: string
): { level: number; text: string; line: number }[] {
  const lines = content.split('\n')
  const headings: { level: number; text: string; line: number }[] = []

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.*)/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        line: index + 1,
      })
    }
  })

  return headings
}