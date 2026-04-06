/**
 * 卡片式渲染器
 * 经典小红书风格：标题居中卡片 + 内容卡片
 */
import type { Renderer } from './types'

export const cardRenderer: Renderer = {
  h1: (children, fontTitle) => (
    <div className="xhs-card xhs-h1" data-xhs-block>
      <h1 style={{ fontFamily: fontTitle, marginBottom: 0 }}>{children}</h1>
    </div>
  ),
  h2: (children) => <div className="xhs-h2" data-xhs-block><span>{children}</span></div>,
  h3: (children) => <div className="xhs-h3" data-xhs-block><span>{children}</span></div>,
  h4: (children) => <div className="xhs-h4" data-xhs-block><span>{children}</span></div>,
  h5: (children) => <div className="xhs-h5" data-xhs-block><span>{children}</span></div>,
  h6: (children) => <div className="xhs-h6" data-xhs-block><span>{children}</span></div>,
  p: (children, fontBody) => (
    <div className="xhs-card" data-xhs-block>
      <p className="xhs-paragraph" style={{ fontFamily: fontBody }}>{children}</p>
    </div>
  ),
  blockquote: (children) => (
    <blockquote className="xhs-blockquote" data-xhs-block>{children}</blockquote>
  ),
  ul: (children) => <div className="xhs-list" data-xhs-block><ul>{children}</ul></div>,
  ol: (children) => <div className="xhs-list-ordered" data-xhs-block><ol>{children}</ol></div>,
}
