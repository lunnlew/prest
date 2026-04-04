/**
 * Pretext Text Measurement Library
 *
 * This is a simplified implementation based on the Pretext library concept.
 * The full library is available at: https://github.com/chenglou/pretext
 *
 * This implementation uses canvas for text measurement and provides
 * the core layout calculation functionality.
 */

export interface PreparedText {
  text: string
  font: string
  segments: TextSegment[]
}

export interface TextSegment {
  text: string
  width: number
  isBreakable: boolean
}

export interface LayoutLine {
  text: string
  width: number
  start: { segmentIndex: number; graphemeIndex: number }
  end: { segmentIndex: number; graphemeIndex: number }
}

export interface LayoutResult {
  height: number
  lineCount: number
  lines: LayoutLine[]
}

// Canvas for text measurement
let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

function getMeasureContext(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
  if (!measureCtx) {
    throw new Error('Failed to get canvas 2d context')
  }
  return measureCtx
}

/**
 * Measure text width using canvas
 */
function measureText(text: string, font: string): number {
  const ctx = getMeasureContext()
  ctx.font = font
  return ctx.measureText(text).width
}

/**
 * Split text into words and spaces
 */
function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter(Boolean)
}

/**
 * Prepare text for layout calculation
 * This is the one-time measurement pass
 */
export function prepare(text: string, font: string): PreparedText {
  const tokens = tokenize(text)
  const segments: TextSegment[] = tokens.map((token) => ({
    text: token,
    width: measureText(token, font),
    isBreakable: /^\s+$/.test(token),
  }))

  return { text, font, segments }
}

/**
 * Calculate layout for a given width
 * Pure arithmetic - very fast
 */
export function layout(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number } {
  const result = layoutWithLines(prepared, maxWidth, lineHeight)
  return {
    height: result.height,
    lineCount: result.lineCount,
  }
}

/**
 * Calculate layout with line information
 */
export function layoutWithLines(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): LayoutResult & { lines: LayoutLine[] } {
  const lines: LayoutLine[] = []
  let currentLineText = ''
  let currentLineWidth = 0
  let lineStartSegment = 0
  let lineStartGrapheme = 0

  for (let i = 0; i < prepared.segments.length; i++) {
    const segment = prepared.segments[i]

    if (currentLineWidth + segment.width > maxWidth && currentLineText.trim()) {
      // Start new line
      lines.push({
        text: currentLineText.trimEnd(),
        width: currentLineWidth,
        start: { segmentIndex: lineStartSegment, graphemeIndex: lineStartGrapheme },
        end: { segmentIndex: i, graphemeIndex: 0 },
      })
      currentLineText = ''
      currentLineWidth = 0
      lineStartSegment = i
      lineStartGrapheme = 0
    }

    currentLineText += segment.text
    currentLineWidth += segment.width
  }

  // Add remaining content as last line
  if (currentLineText.trim()) {
    lines.push({
      text: currentLineText.trimEnd(),
      width: currentLineWidth,
      start: { segmentIndex: lineStartSegment, graphemeIndex: lineStartGrapheme },
      end: { segmentIndex: prepared.segments.length, graphemeIndex: 0 },
    })
  }

  // If no lines, add one empty line
  if (lines.length === 0) {
    lines.push({
      text: '',
      width: 0,
      start: { segmentIndex: 0, graphemeIndex: 0 },
      end: { segmentIndex: 0, graphemeIndex: 0 },
    })
  }

  return {
    height: lines.length * lineHeight,
    lineCount: lines.length,
    lines,
  }
}

/**
 * Clear internal cache
 */
export function clearCache(): void {
  measureCanvas = null
  measureCtx = null
}