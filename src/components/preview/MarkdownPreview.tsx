import { useRef, useEffect, useCallback } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { remarkHighlightMark } from 'remark-highlight-mark'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useBoundStore } from '../../stores'
import './MarkdownPreview.css'

interface MarkdownPreviewProps {
  content: string
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { settings } = useBoundStore()

  // Monitor preview dimensions with ResizeObserver
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    const rect = entries[0]?.contentRect
    if (rect) {
      useBoundStore.getState().setPreviewWidth(rect.width)
    }
  }, [])

  useEffect(() => {
    const el = previewRef.current
    if (!el) return

    const observer = new ResizeObserver(handleResize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleResize])

  return (
    <div
      ref={previewRef}
      className="markdown-preview-container"
    >
      <Markdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkHighlightMark,
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [
              ...(defaultSchema.tagNames || []),
              'div', 'mark', 'sub', 'sup',
            ],
            attributes: {
              ...defaultSchema.attributes,
              div: [['align']],
            },
          }],
        ]}
        components={{
          // Custom code block with syntax highlighting
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match

            if (isInline) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              )
            }

            return (
              <SyntaxHighlighter
                style={settings.theme === 'dark' ? oneDark : oneLight}
                language={match[1]}
                PreTag="div"
                className="code-block"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },

          // Custom heading with anchor
          h1: ({ children }) => (
            <h1 className="preview-heading preview-heading-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="preview-heading preview-heading-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="preview-heading preview-heading-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="preview-heading preview-heading-4">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="preview-heading preview-heading-5">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="preview-heading preview-heading-6">{children}</h6>
          ),

          // Custom link
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="preview-link"
            >
              {children}
            </a>
          ),

          // Custom image
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="preview-image" loading="lazy" />
          ),

          // Custom blockquote
          blockquote: ({ children }) => (
            <blockquote className="preview-blockquote">{children}</blockquote>
          ),

          // Custom table
          table: ({ children }) => (
            <div className="preview-table-wrapper">
              <table className="preview-table">{children}</table>
            </div>
          ),

          // Custom list
          ul: ({ children }) => <ul className="preview-list">{children}</ul>,
          ol: ({ children }) => <ol className="preview-list-ordered">{children}</ol>,

          // Custom paragraph
          p: ({ children }) => <p className="preview-paragraph">{children}</p>,

          // Horizontal rule
          hr: () => <hr className="preview-hr" />,
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}
