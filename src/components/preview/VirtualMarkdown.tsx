import { useRef, memo, useMemo, useCallback, useEffect, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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
import { splitMarkdownToBlocks, estimateBlockHeight } from '../../utils/markdownBlocks'
import type { MarkdownBlock as IMarkdownBlock } from '../../utils/markdownBlocks'
import { useBoundStore } from '../../stores'
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

// Callout types
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

// Custom urlTransform to allow data: URLs
const customUrlTransform = (url: string) => url

// Common rehype plugins config
const rehypePlugins = [
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
] as any

// Component to render a single markdown block
const MarkdownBlockRenderer = memo(function MarkdownBlockRenderer({
  block,
  theme,
}: {
  block: IMarkdownBlock
  theme: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  // Measure element height after mount (for virtualizer)
  useEffect(() => {
    if (ref.current) {
      const observer = new ResizeObserver(() => {
        // Height measurement handled by virtualizer via ref
      })
      observer.observe(ref.current)
      return () => observer.disconnect()
    }
  }, [])

  const commonProps = {
    remarkPlugins: [
      remarkGfm,
      remarkMath,
      remarkDirective,
      remarkDeflist,
      remarkHighlightMark,
      remarkEmoji,
    ],
    rehypePlugins,
    urlTransform: customUrlTransform,
    components: {
      code({ className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '')
        const isInline = !match

        if (isInline) {
          return <code className="inline-code" {...props}>{children}</code>
        }

        const codeString = String(children).replace(/\n$/, '')
        return (
          <div className="code-block-wrapper">
            <SyntaxHighlighter
              style={theme === 'light' ? oneLight : oneDark}
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
      h1: ({ children }: any) => <h1 className="preview-heading preview-heading-1">{children}</h1>,
      h2: ({ children }: any) => <h2 className="preview-heading preview-heading-2">{children}</h2>,
      h3: ({ children }: any) => <h3 className="preview-heading preview-heading-3">{children}</h3>,
      h4: ({ children }: any) => <h4 className="preview-heading preview-heading-4">{children}</h4>,
      h5: ({ children }: any) => <h5 className="preview-heading preview-heading-5">{children}</h5>,
      h6: ({ children }: any) => <h6 className="preview-heading preview-heading-6">{children}</h6>,
      a: ({ href, children }: any) => (
        <a href={href} target="_blank" rel="noopener noreferrer" className="preview-link">{children}</a>
      ),
      img: ({ src, alt, ...props }: any) => (
        <img src={src} alt={alt || 'image'} className="preview-image" loading="lazy" {...props} />
      ),
      blockquote: ({ children }: any) => {
        const childArray = Array.isArray(children) ? children : [children]
        const firstChild = childArray[0]
        const firstElement = (firstChild as any)?.props
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
      div: ({ className, children, ...props }: any) => {
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
              <div className="callout-content">{children}</div>
            </div>
          )
        }
        return <div className={className} {...props}>{children}</div>
      },
      table: ({ children }: any) => (
        <div className="preview-table-wrapper">
          <table className="preview-table">{children}</table>
        </div>
      ),
      ul: ({ children }: any) => <ul className="preview-list">{children}</ul>,
      ol: ({ children }: any) => <ol className="preview-list-ordered">{children}</ol>,
      p: ({ children }: any) => <p className="preview-paragraph">{children}</p>,
      hr: () => <hr className="preview-hr" />,
      dl: ({ children }: any) => <dl className="preview-dl">{children}</dl>,
      dt: ({ children }: any) => <dt className="preview-dt">{children}</dt>,
      dd: ({ children }: any) => <dd className="preview-dd">{children}</dd>,
      sub: ({ children }: any) => <sub className="preview-sub">{children}</sub>,
      sup: ({ children }: any) => <sup className="preview-sup">{children}</sup>,
      mark: ({ children }: any) => <mark className="preview-mark">{children}</mark>,
      li: ({ children, ...props }: any) => {
        const childArray = Array.isArray(children) ? children : [children]
        const firstChild = childArray[0]
        if ((firstChild as any)?.props?.className?.includes('task-list-item')) {
          return <li className="preview-task-item" {...props}>{children}</li>
        }
        return <li className="preview-li">{children}</li>
      },
    },
  }

  return (
    <div ref={ref} data-block-id={block.id} className="markdown-block">
      {block.type === 'callout' ? (
        <div className={`preview-callout callout-${block.raw.split('\n')[0].replace(':::', '').trim() || 'default'}`}>
          <Markdown {...commonProps}>{block.raw}</Markdown>
        </div>
      ) : (
        <Markdown {...commonProps}>{block.raw}</Markdown>
      )}
    </div>
  )
})

interface VirtualMarkdownProps {
  content: string
  overscan?: number
  // Called when user scrolls, passes scroll ratio (0-1)
  onScrollRatioChange?: (ratio: number) => void
  // External scroll ratio (0-1) to sync from editor
  scrollRatio?: number
}

export const VirtualMarkdown = memo(function VirtualMarkdown({
  content,
  overscan = 5,
  onScrollRatioChange,
  scrollRatio,
}: VirtualMarkdownProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const { settings } = useBoundStore()
  const isScrollingRef = useRef(false)
  const lastScrollRatioRef = useRef(0)

  // Parse content into blocks
  const blocks = useMemo(() => splitMarkdownToBlocks(content), [content])

  // Initialize virtualizer
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const virtualizer = useVirtualizer({
    count: blocks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => estimateBlockHeight(blocks[index]),
    overscan,
    measureElement: (element) => element.getBoundingClientRect().height,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const theme = settings.theme
  // Add a small buffer at the bottom to ensure last content is visible
  const BOTTOM_BUFFER = 48
  const totalSize = virtualizer.getTotalSize() + BOTTOM_BUFFER

  // Force remeasurement when blocks change to ensure accurate totalSize
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      virtualizer.measure()
    }, 100)
    return () => clearTimeout(timeoutId)
  }, [blocks, virtualizer])

  // Sync scroll position from external source (editor)
  useEffect(() => {
    if (scrollRatio === undefined || isScrollingRef.current) return

    const container = parentRef.current
    if (!container) return

    // Directly calculate and set scrollTop based on ratio
    // This is more reliable than scrollToIndex for accurate positioning
    const totalSize = virtualizer.getTotalSize() + BOTTOM_BUFFER
    const maxScroll = Math.max(1, totalSize - container.clientHeight)
    const targetOffset = scrollRatio * maxScroll
    container.scrollTop = targetOffset
  }, [scrollRatio, virtualizer])

  // Handle scroll - report ratio to parent
  const handleScroll = useCallback(() => {
    if (!parentRef.current || !onScrollRatioChange) return

    const container = parentRef.current
    // Use virtualizer's totalSize directly for accurate ratio calculation
    const actualTotalSize = virtualizer.getTotalSize() + BOTTOM_BUFFER
    const maxScroll = actualTotalSize - container.clientHeight
    if (maxScroll <= 0) return

    // Calculate ratio based on scroll position relative to total content
    const ratio = Math.min(1, Math.max(0, container.scrollTop / maxScroll))

    // Only report if ratio changed significantly
    if (Math.abs(lastScrollRatioRef.current - ratio) > 0.001) {
      lastScrollRatioRef.current = ratio
      isScrollingRef.current = true
      onScrollRatioChange(ratio)
      setTimeout(() => {
        isScrollingRef.current = false
      }, 50)
    }
  }, [onScrollRatioChange, virtualizer])

  return (
    <div
      ref={parentRef}
      className="markdown-preview-container"
      onScroll={handleScroll}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualItems.map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <MarkdownBlockRenderer
              block={blocks[virtualItem.index]}
              theme={theme}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
