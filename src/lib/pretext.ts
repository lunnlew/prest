/**
 * Simplified text measurement utilities for XHS pagination.
 * Uses canvas for text width measurement.
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

export interface LayoutResult {
  height: number
  lineCount: number
}

let measureCanvas: HTMLCanvasElement | null = null
let measureCtx: CanvasRenderingContext2D | null = null

function getCtx(): CanvasRenderingContext2D {
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas')
    measureCtx = measureCanvas.getContext('2d')
  }
  if (!measureCtx) {
    throw new Error('Failed to get canvas 2d context')
  }
  return measureCtx
}

function measureText(text: string, font: string): number {
  const ctx = getCtx()
  ctx.font = font
  return ctx.measureText(text).width
}

/**
 * Prepare text for layout — tokenize and measure widths.
 */
export function prepare(text: string, font: string): PreparedText {
  const tokens = text.split(/(\s+)/).filter(Boolean)
  const segments = tokens.map((token) => ({
    text: token,
    width: measureText(token, font),
    isBreakable: /^\s+$/.test(token),
  }))
  return { text, font, segments }
}

/**
 * Calculate line-wrapped layout for a given max width.
 */
export function layoutWithLines(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): LayoutResult {
  let lineCount = 0
  let currentLineWidth = 0

  for (const segment of prepared.segments) {
    if (currentLineWidth + segment.width > maxWidth) {
      lineCount++
      currentLineWidth = segment.width
    } else {
      currentLineWidth += segment.width
    }
  }

  if (currentLineWidth > 0) {
    lineCount++
  }

  return {
    height: lineCount * lineHeight,
    lineCount,
  }
}
