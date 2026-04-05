/**
 * XHS Pagination — DOM-based content extraction approach
 *
 * Height model:
 * - Sibling blocks: margin-bottom of block[i] collapses with margin-top of block[i+1].
 *   Gap = max(mb[i], mt[i+1]), measured directly from the DOM.
 * - First block on a page: its marginTop is NOT collapsed (no sibling above it).
 *   It occupies marginTop + rectHeight from the container's padding-top edge.
 * - Last block on a page: its marginBottom is NOT collapsed.
 *   It occupies rectHeight + marginBottom.
 * - Non-last pages: availH = frameH - 48 (just container padding)
 * - Last page: footer rendered at bottom → availLastH = frameH - 10 - footerH - 24
 */

import type { XHSAspectRatio } from '../types'

const ASPECT_DIMENSIONS: Record<XHSAspectRatio, { w: number; h: number }> = {
  '3:4': { w: 1242, h: 1660 },
  '3:5': { w: 1080, h: 1800 },
  '1:1': { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
}

export interface PageInfo {
  /** HTML string containing only the blocks for this page */
  html: string
}

export interface PaginationResult {
  pages: PageInfo[]
  totalPages: number
}

export function paginate(
  previewEl: HTMLElement,
  aspectRatio: XHSAspectRatio,
): PaginationResult {
  const dims = ASPECT_DIMENSIONS[aspectRatio]
  const blockEls = Array.from(previewEl.querySelectorAll('[data-xhs-block]')) as HTMLElement[]

  if (blockEls.length === 0) return { pages: [], totalPages: 0 }

  const frameH = (dims.h / dims.w) * 440
  const footerEl = previewEl.querySelector('[data-xhs-footer]') as HTMLElement | null
  const footerH = footerEl ? footerEl.getBoundingClientRect().height : 0

  // Non-last pages: only container padding (no footer)
  const availH = frameH - (footerH > 0 ? 48 : 24)
  // Last page: footer height measured from DOM automatically shrinks when
  // page number is hidden, freeing up content space
  const availLastH = footerH > 0 ? frameH - 10 - footerH - 24 : availH

  // Measure from the fully rendered DOM
  const rects: DOMRectReadOnly[] = []
  const marginTops: number[] = []
  const marginBottomes: number[] = []
  const collapsedGaps: number[] = []

  for (let i = 0; i < blockEls.length; i++) {
    const el = blockEls[i]
    rects.push(el.getBoundingClientRect())
    const cs = getComputedStyle(el)
    marginTops.push(parseFloat(cs.marginTop) || 0)
    marginBottomes.push(parseFloat(cs.marginBottom) || 0)

    if (i < blockEls.length - 1) {
      const nr = blockEls[i + 1].getBoundingClientRect()
      collapsedGaps.push(nr.top - (rects[i].top + rects[i].height))
    }
  }

  // Greedy bin-packing with availH for all pages.
  // The first block on the first page has its marginTop already accounted for
  // in the DOM layout (it starts at Y=mt[0] within the container).
  // But when any other block starts a NEW page, its marginTop is no longer
  // collapsed with a previous block — it becomes extra space.
  //
  // usedH = content height from first block's top to last block's mb bottom.
  const pageGroups: number[][] = []
  let curGroup: number[] = []
  let usedH = 0
  let isFirstPage = true

  for (let i = 0; i < blockEls.length; i++) {
    if (curGroup.length === 0) {
      curGroup = [i]
      if (isFirstPage) {
        // First page: block[0]'s mt already "exists" in the measure layout
        usedH = rects[i].height + marginBottomes[i]
      } else {
        // New page after break: block's mt is no longer collapsed
        usedH = marginTops[i] + rects[i].height + marginBottomes[i]
      }
      isFirstPage = false
    } else {
      const prevIdx = curGroup[curGroup.length - 1]
      const cost = -marginBottomes[prevIdx] + collapsedGaps[prevIdx]
        + rects[i].height + marginBottomes[i]

      if (usedH + cost > availH + 1) {
        pageGroups.push(curGroup)
        curGroup = [i]
        usedH = marginTops[i] + rects[i].height + marginBottomes[i]
      } else {
        curGroup.push(i)
        usedH += cost
      }
    }
  }
  if (curGroup.length > 0) pageGroups.push(curGroup)

  // Post-process: ensure last page fits in availLastH.
  // If last page overflows, move blocks from second-to-last page forward.
  if (availLastH < availH && pageGroups.length >= 2) {
    const lastIdx = pageGroups.length - 1
    let lastPageH = computePageHeight(pageGroups[lastIdx], collapsedGaps, rects, marginBottomes)

    while (lastPageH > availLastH + 1 && pageGroups.length >= 2) {
      const prevGroup = pageGroups[lastIdx - 1]
      if (prevGroup.length <= 1) break

      const movedIdx = prevGroup.pop()!
      pageGroups[lastIdx].unshift(movedIdx)
      lastPageH = computePageHeight(pageGroups[lastIdx], collapsedGaps, rects, marginBottomes)
    }

    for (let i = pageGroups.length - 1; i >= 0; i--) {
      if (pageGroups[i].length === 0) pageGroups.splice(i, 1)
    }
  }

  // Build page HTML strings
  const pages: PageInfo[] = pageGroups.map((group) => {
    const htmlParts: string[] = []
    for (const idx of group) {
      const el = blockEls[idx]
      if (el) htmlParts.push(el.outerHTML)
    }
    return { html: htmlParts.join('') }
  })

  return { pages, totalPages: pages.length }
}

function computePageHeight(
  group: number[],
  collapsedGaps: number[],
  rects: DOMRectReadOnly[],
  mbValues: number[],
): number {
  if (group.length === 0) return 0
  if (group.length === 1) {
    return rects[group[0]].height + mbValues[group[0]]
  }
  // Height = sum of (rectH[idx] + collapsedGap[idx]) for all except last,
  //         + rectH[last] + mb[last]
  let total = 0
  for (let i = 0; i < group.length - 1; i++) {
    total += rects[group[i]].height + collapsedGaps[group[i]]
  }
  const last = group[group.length - 1]
  total += rects[last].height + mbValues[last]
  return total
}
