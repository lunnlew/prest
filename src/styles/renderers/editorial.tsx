/**
 * 编辑排版渲染器
 * 大标题 + 内容分栏
 */
import type { Renderer } from './types'

export const editorialRenderer: Renderer = {
  h1: (children, fontTitle) => (
    <div className="xhs-h1 xhs-h1-editorial" data-xhs-block>
      <h1 style={{ fontFamily: fontTitle, marginBottom: 0 }}>{children}</h1>
    </div>
  ),
  h2: (children) => <div className="xhs-h2 xhs-h2-editorial" data-xhs-block><span>{children}</span></div>,
  h3: (children) => <div className="xhs-h3" data-xhs-block><span>{children}</span></div>,
  h4: (children) => <div className="xhs-h4" data-xhs-block><span>{children}</span></div>,
  h5: (children) => <div className="xhs-h5" data-xhs-block><span>{children}</span></div>,
  h6: (children) => <div className="xhs-h6" data-xhs-block><span>{children}</span></div>,
  p: (children, fontBody) => (
    <div className="xhs-paragraph xhs-paragraph-editorial" data-xhs-block>
      <p style={{ fontFamily: fontBody, margin: 0 }}>{children}</p>
    </div>
  ),
  blockquote: (children) => (
    <blockquote className="xhs-blockquote xhs-blockquote-editorial" data-xhs-block>{children}</blockquote>
  ),
  ul: (children) => <div className="xhs-list" data-xhs-block><ul>{children}</ul></div>,
  ol: (children) => <div className="xhs-list-ordered" data-xhs-block><ol>{children}</ol></div>,
}
