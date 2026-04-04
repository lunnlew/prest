import { prepare, layoutWithLines, type PreparedText } from '../lib/pretext'
import { TextBlock, LayoutResult } from '../types'

export interface PretextConfig {
  defaultFont: string
  defaultLineHeight: number
  headingFonts: Record<number, string>
  codeFont: string
}

const defaultConfig: PretextConfig = {
  defaultFont: '16px Inter, -apple-system, sans-serif',
  defaultLineHeight: 24,
  headingFonts: {
    1: 'bold 32px Inter, -apple-system, sans-serif',
    2: 'bold 24px Inter, -apple-system, sans-serif',
    3: 'bold 20px Inter, -apple-system, sans-serif',
    4: 'bold 18px Inter, -apple-system, sans-serif',
    5: 'bold 16px Inter, -apple-system, sans-serif',
    6: 'bold 14px Inter, -apple-system, sans-serif',
  },
  codeFont: '14px JetBrains Mono, Consolas, monospace',
}

export class PretextService {
  private cache: Map<string, PreparedText> = new Map()
  private config: PretextConfig

  constructor(config: Partial<PretextConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Get font for a text block based on its type
   */
  getFontForBlock(block: TextBlock): string {
    switch (block.type) {
      case 'heading':
        return this.config.headingFonts[block.level || 1] || this.config.headingFonts[1]
      case 'code':
        return this.config.codeFont
      default:
        return this.config.defaultFont
    }
  }

  /**
   * Get line height for a text block based on its type
   */
  getLineHeightForBlock(block: TextBlock): number {
    switch (block.type) {
      case 'heading':
        return this.config.defaultLineHeight * (1.5 - (block.level || 1) * 0.1)
      case 'code':
        return this.config.defaultLineHeight
      default:
        return this.config.defaultLineHeight
    }
  }

  /**
   * Prepare a text block - one-time measurement pass
   */
  prepareBlock(block: TextBlock): PreparedText {
    const cacheKey = `${block.id}-${block.content.length}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const font = this.getFontForBlock(block)
    const prepared = prepare(block.content, font)
    this.cache.set(cacheKey, prepared)
    return prepared
  }

  /**
   * Calculate layout - pure arithmetic, very fast
   */
  calculateLayout(
    prepared: PreparedText,
    containerWidth: number,
    lineHeight?: number
  ): LayoutResult {
    const lh = lineHeight || this.config.defaultLineHeight
    const result = layoutWithLines(prepared, containerWidth, lh)

    return {
      height: result.height,
      lineCount: result.lineCount,
      lines: result.lines.map((line) => ({
        text: line.text,
        width: line.width,
        height: lh,
      })),
    }
  }

  /**
   * Calculate total height for multiple blocks
   */
  calculateTotalHeight(
    blocks: TextBlock[],
    containerWidth: number
  ): { totalHeight: number; blockHeights: Map<string, number> } {
    const blockHeights = new Map<string, number>()
    let totalHeight = 0

    for (const block of blocks) {
      const prepared = this.prepareBlock(block)
      const lineHeight = this.getLineHeightForBlock(block)
      const result = this.calculateLayout(prepared, containerWidth, lineHeight)
      blockHeights.set(block.id, result.height)
      totalHeight += result.height
    }

    return { totalHeight, blockHeights }
  }

  /**
   * Calculate scroll mapping between editor lines and preview blocks
   * Returns a map of editor line numbers to preview scroll positions
   */
  calculateScrollMapping(
    editorLineCount: number,
    blocks: TextBlock[],
    containerWidth: number
  ): Map<number, number> {
    const mapping = new Map<number, number>()
    const { blockHeights } = this.calculateTotalHeight(blocks, containerWidth)

    // Simple proportional mapping
    // In a real implementation, this would be more sophisticated
    const linesPerBlock = editorLineCount / blocks.length

    let previewOffset = 0
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]
      const blockHeight = blockHeights.get(block.id) || 0
      const startLine = Math.floor(i * linesPerBlock)
      const endLine = Math.floor((i + 1) * linesPerBlock)

      for (let line = startLine; line < endLine; line++) {
        const progress = (line - startLine) / (endLine - startLine)
        mapping.set(line, previewOffset + blockHeight * progress)
      }

      previewOffset += blockHeight
    }

    return mapping
  }

  /**
   * Clear cache (call when fonts change)
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PretextConfig>): void {
    this.config = { ...this.config, ...config }
    this.clearCache()
  }
}

// Singleton instance
export const pretextService = new PretextService()