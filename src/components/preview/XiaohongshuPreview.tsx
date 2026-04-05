import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { remarkHighlightMark } from 'remark-highlight-mark'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import '../../styles/xiaohongshu.css'
import type { XHSTemplate } from '../../types'

interface XiaohongshuPreviewProps {
  /** Markdown content to render (used when `html` is not provided) */
  content?: string
  /** Raw HTML string to render directly (bypasses markdown parsing) */
  html?: string
  template: XHSTemplate
  watermark?: string
  tags?: string[]
  showPageNumber?: boolean
  currentPage?: number
  totalPages?: number
}

const templateFonts: Record<XHSTemplate, { title: string; body: string }> = {
  cream: { title: 'bold 2em "PingFang SC", "Microsoft YaHei", sans-serif', body: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  minimal: { title: 'bold 2em -apple-system, "Helvetica Neue", sans-serif', body: '0.95em -apple-system, "Helvetica Neue", sans-serif' },
  gradient: { title: 'bold 2.2em "PingFang SC", "Microsoft YaHei", sans-serif', body: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
}

function BlockWrap({
  tag = 'div',
  className,
  children,
  ...rest
}: {
  tag?: string
  className: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  const Tag = tag as keyof JSX.IntrinsicElements
  return (
    <Tag className={className} {...rest}>
      {children}
    </Tag>
  )
}

function createRenderers(
  fontConfig: { title: string; body: string },
  counter: { current: number },
) {
  const nextIdx = () => counter.current++

  return {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-card xhs-h1" data-xhs-block={nextIdx()}>
        <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
      </BlockWrap>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-h2" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    h5: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    h6: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-card" data-xhs-block={nextIdx()}>
        <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>
          {children}
        </p>
      </BlockWrap>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-blockquote" tag="blockquote" data-xhs-block={nextIdx()}>
        {children}
      </BlockWrap>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}>{children}</BlockWrap>
    ),
    hr: () => (
      <BlockWrap className="xhs-hr" tag="hr" data-xhs-block={nextIdx()} />
    ),
    code: ({ className: codeCls, children }: { className?: string; children?: React.ReactNode }) => {
      const match = /language-(\w+)/.exec(codeCls || '')
      if (!match) {
        return <code className="xhs-inline-code">{children}</code>
      }
      return (
        <BlockWrap className="xhs-code-block" data-xhs-block={nextIdx()}>
          <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </BlockWrap>
      )
    },
    img: ({ src, alt }: { src?: string; alt?: string }) => (
      <BlockWrap className="xhs-image" tag="img" data-xhs-block={nextIdx()} src={src} alt={alt} loading="lazy" />
    ),
    table: ({ children }: { children?: React.ReactNode }) => (
      <BlockWrap className="xhs-table-wrapper" data-xhs-block={nextIdx()}>
        <table className="xhs-table">{children}</table>
      </BlockWrap>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a href={href} className="xhs-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  }
}

export function XiaohongshuPreview({
  content,
  html: htmlContent,
  template,
  watermark = '',
  tags = [],
  showPageNumber = false,
  currentPage = 1,
  totalPages = 1,
}: XiaohongshuPreviewProps) {
  const fontConfig = templateFonts[template]
  const counter = { current: 0 }
  const renderers = createRenderers(fontConfig, counter)

  const renderBody = () => {
    // When html is provided, render it directly via dangerouslySetInnerHTML.
    // This is used by the paginated export flow where each page gets only its
    // own block elements' HTML, avoiding markdown re-parsing and DOM mismatch.
    if (htmlContent) {
      return (
        <div
          className="xhs-html-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )
    }

    // Default path: parse markdown and render via react-markdown
    return (
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath, remarkHighlightMark]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames || []), 'div', 'mark', 'sub', 'sup'],
            attributes: {
              ...defaultSchema.attributes,
              div: [['align'], ['data-xhs-block'], ['style']],
            },
          }],
        ]}
        components={renderers}
      >
        {content ?? ''}
      </Markdown>
    )
  }

  return (
    <div className={`xhs-preview xhs-template-${template}`}>
      {renderBody()}

      {(tags.length > 0 || watermark || showPageNumber) && (
        <div className="xhs-footer" data-xhs-footer>
          {tags.length > 0 && (
            <div className={`xhs-footer-tags ${!showPageNumber ? 'xhs-footer-tags--last' : ''}`}>
              {tags.map((tag, i) => (
                <span key={i} className="xhs-footer-tag">#{tag}</span>
              ))}
            </div>
          )}
          {watermark && (
            <div className={`xhs-footer-watermark ${!showPageNumber ? 'xhs-footer-watermark--last' : ''}`}>{watermark}</div>
          )}
          {showPageNumber && (
            <div className="xhs-footer-page">{currentPage} / {totalPages}</div>
          )}
        </div>
      )}
    </div>
  )
}
