/**
 * 手账风渲染器
 * 彩色标题条 + 便签卡片
 */
import type { Renderer } from './types'

export const scrapbookRenderer: Renderer = {
  h1: (children, fontTitle) => (
    <div className="xhs-h1 xhs-h1-scrapbook" data-xhs-block>
      <h1 style={{ fontFamily: fontTitle, marginBottom: 0 }}>{children}</h1>
    </div>
  ),
  h2: (children) => <div className="xhs-h2 xhs-h2-scrapbook" data-xhs-block><span>{children}</span></div>,
  h3: (children) => <div className="xhs-h3 xhs-h3-scrapbook" data-xhs-block><span>{children}</span></div>,
  h4: (children) => <div className="xhs-h4" data-xhs-block><span>{children}</span></div>,
  h5: (children) => <div className="xhs-h5" data-xhs-block><span>{children}</span></div>,
  h6: (children) => <div className="xhs-h6" data-xhs-block><span>{children}</span></div>,
  p: (children, fontBody) => (
    <div className="xhs-card xhs-card-scrapbook" data-xhs-block>
      <p className="xhs-paragraph" style={{ fontFamily: fontBody }}>{children}</p>
    </div>
  ),
  blockquote: (children) => (
    <blockquote className="xhs-blockquote xhs-blockquote-scrapbook" data-xhs-block>{children}</blockquote>
  ),
  ul: (children) => <div className="xhs-list" data-xhs-block><ul>{children}</ul></div>,
  ol: (children) => <div className="xhs-list-ordered" data-xhs-block><ol>{children}</ol></div>,
}
