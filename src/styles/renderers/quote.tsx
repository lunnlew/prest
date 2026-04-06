/**
 * 引用突出渲染器
 * 整页像引用块
 */
import type { Renderer } from './types'

export const quoteRenderer: Renderer = {
  h1: (children, fontTitle) => (
    <div className="xhs-h1 xhs-h1-quote" data-xhs-block>
      <h1 style={{ fontFamily: fontTitle, marginBottom: 0 }}>{children}</h1>
    </div>
  ),
  h2: (children) => <div className="xhs-h2 xhs-h2-quote" data-xhs-block><span>{children}</span></div>,
  h3: (children) => <div className="xhs-h3" data-xhs-block><span>{children}</span></div>,
  h4: (children) => <div className="xhs-h4" data-xhs-block><span>{children}</span></div>,
  h5: (children) => <div className="xhs-h5" data-xhs-block><span>{children}</span></div>,
  h6: (children) => <div className="xhs-h6" data-xhs-block><span>{children}</span></div>,
  p: (children, fontBody) => (
    <blockquote className="xhs-blockquote xhs-blockquote-quote" data-xhs-block>
      <p style={{ fontFamily: fontBody, margin: 0 }}>{children}</p>
    </blockquote>
  ),
  blockquote: (children) => (
    <blockquote className="xhs-blockquote xhs-blockquote-quote" data-xhs-block>{children}</blockquote>
  ),
  ul: (children) => <div className="xhs-list xhs-list-quote" data-xhs-block><ul>{children}</ul></div>,
  ol: (children) => <div className="xhs-list-ordered xhs-list-ordered-quote" data-xhs-block><ol>{children}</ol></div>,
}
