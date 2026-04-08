import { useRef, memo, useState, useCallback, useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import remarkDirective from 'remark-directive'
import remarkDeflist from 'remark-deflist'
import { remarkHighlightMark } from 'remark-highlight-mark'
import remarkEmoji from 'remark-emoji'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useBoundStore } from '../../stores'
import { parseSkillDoc, hasFrontmatter, SkillMeta } from '../../utils/frontmatter'
import { SkillMetaPanel } from './SkillMetaPanel'
import './MarkdownPreview.css'

// Code block copy button component
function CodeBlockCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [code])

  return (
    <button
      onClick={handleCopy}
      className="code-block-copy-btn"
      title="Copy code"
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}

interface MarkdownPreviewProps {
  content: string
}

// Callout types and their icons/colors
const CALLOUT_TYPES: Record<string, { icon: string; className: string }> = {
  note: { icon: '📝', className: 'callout-note' },
  tip: { icon: '💡', className: 'callout-tip' },
  warning: { icon: '⚠️', className: 'callout-warning' },
  danger: { icon: '🚨', className: 'callout-danger' },
  info: { icon: 'ℹ️', className: 'callout-info' },
  success: { icon: '✅', className: 'callout-success' },
  question: { icon: '❓', className: 'callout-question' },
  default: { icon: '📌', className: 'callout-default' },
}

// Custom urlTransform to allow data: URLs for images
// urlTransform runs BEFORE sanitize, so this preserves data URLs before sanitize can remove them
const customUrlTransform = (url: string) => url

export const MarkdownPreview = memo(function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const { settings } = useBoundStore()

  // Parse frontmatter for skill documents
  const { meta, content: markdownContent } = useMemo(() => {
    if (hasFrontmatter(content)) {
      return parseSkillDoc(content)
    }
    return { meta: {} as SkillMeta, content }
  }, [content])

  // Determine if this looks like a skill document (has frontmatter with name/description)
  const isSkillDoc = useMemo(() => {
    return hasFrontmatter(content) && (meta.name || meta.description)
  }, [content, meta])

  return (
    <div
      ref={previewRef}
      className="markdown-preview-container"
    >
      {/* Render skill metadata panel if this is a skill document */}
      {isSkillDoc && <SkillMetaPanel meta={meta} />}

      <Markdown
        remarkPlugins={[
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkDeflist,
          remarkHighlightMark,
          remarkEmoji,
        ]}
        rehypePlugins={[
          rehypeRaw,
          rehypeKatex,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [
              ...(defaultSchema.tagNames || []),
              'div', 'mark', 'sub', 'sup', 'dl', 'dt', 'dd',
            ],
            attributes: {
              ...defaultSchema.attributes,
              div: [['align']],
              img: ['src', 'alt', ...(defaultSchema.attributes?.img || [])],
            },
            protocols: {
              ...defaultSchema.protocols,
              src: [...(defaultSchema.protocols?.src || []), 'data'],
            },
          }],
        ]}
        urlTransform={customUrlTransform}
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

            const codeString = String(children).replace(/\n$/, '')

            return (
              <div className="code-block-wrapper">
                <SyntaxHighlighter
                  style={settings.theme === 'light' ? oneLight : oneDark}
                  language={match[1]}
                  PreTag="div"
                  className="code-block"
                >
                  {codeString}
                </SyntaxHighlighter>
                <CodeBlockCopyButton code={codeString} />
              </div>
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
          img: ({ src, alt, ...props }: any) => {
            return <img src={src} alt={alt || 'image'} className="preview-image" loading="lazy" {...props} />
          },

          // Custom blockquote - handles callouts
          blockquote: ({ children }) => {
            // Check if this is a callout
            const childArray = Array.isArray(children) ? children : [children]
            const firstChild = childArray[0]
            const firstElement = (firstChild as React.ReactElement)?.props

            if (firstElement?.className?.startsWith('callout-')) {
              const calloutType = firstElement.className.replace('callout-', '').split(' ')[0]
              const callout = CALLOUT_TYPES[calloutType] || CALLOUT_TYPES.default
              return (
                <div className={`preview-callout ${callout.className}`}>
                  <div className="callout-header">
                    <span className="callout-icon">{callout.icon}</span>
                    <span className="callout-title">
                      {calloutType.charAt(0).toUpperCase() + calloutType.slice(1)}
                    </span>
                  </div>
                  <div className="callout-content">
                    {firstElement.props.children}
                    {childArray.slice(1)}
                  </div>
                </div>
              )
            }
            return <blockquote className="preview-blockquote">{children}</blockquote>
          },

          // Handle remark-directive containers (:::type)
          div: ({ className, children, ...props }) => {
            // Check if this is a callout from remark-directive
            if (className?.startsWith('callout-')) {
              const calloutType = className.replace('callout-', '').split(' ')[0]
              const callout = CALLOUT_TYPES[calloutType] || CALLOUT_TYPES.default
              return (
                <div className={`preview-callout ${callout.className}`} {...props}>
                  <div className="callout-header">
                    <span className="callout-icon">{callout.icon}</span>
                    <span className="callout-title">
                      {calloutType.charAt(0).toUpperCase() + calloutType.slice(1)}
                    </span>
                  </div>
                  <div className="callout-content">
                    {children}
                  </div>
                </div>
              )
            }
            return <div className={className} {...props}>{children}</div>
          },

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

          // Definition list
          dl: ({ children }) => <dl className="preview-dl">{children}</dl>,
          dt: ({ children }) => <dt className="preview-dt">{children}</dt>,
          dd: ({ children }) => <dd className="preview-dd">{children}</dd>,

          // Subscript and Superscript
          sub: ({ children }) => <sub className="preview-sub">{children}</sub>,
          sup: ({ children }) => <sup className="preview-sup">{children}</sup>,

          // Mark/Highlight
          mark: ({ children }) => <mark className="preview-mark">{children}</mark>,

          // Task list item
          li: ({ children, ...props }) => {
            // Check if this is a task list item
            const childArray = Array.isArray(children) ? children : [children]
            const firstChild = childArray[0]
            if (firstChild && typeof firstChild === 'object' && 'type' in firstChild) {
              const element = firstChild as React.ReactElement
              if (element?.props?.className?.includes('task-list-item')) {
                return <li className="preview-task-item" {...props}>{children}</li>
              }
            }
            return <li className="preview-li">{children}</li>
          },
        }}
      >
        {markdownContent}
      </Markdown>
    </div>
  )
})
