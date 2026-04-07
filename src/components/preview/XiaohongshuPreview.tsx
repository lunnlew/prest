import { useEffect, useRef, useMemo, memo, useState, useCallback } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { XHSTemplate, XHSWatermarkPosition, XHSWatermarkSize } from '../../types'
import { XHS_TEMPLATE_META, loadTemplateFullCSS } from '../../config/xhsTemplates'
import { TEMPLATE_RENDERERS, type RendererType } from '../../styles/rendererFactory'

/** 预加载所有模板 CSS（供 vite 打包） */
const _loaded = import.meta.glob('../../styles/templates/*.css')
void Object.values(_loaded).map((m) => m())

// Code block copy button component for XHS
function XHSCodeBlockCopyButton({ code }: { code: string }) {
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
      className="xhs-code-block-copy-btn"
      title="复制代码"
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}

interface XiaohongshuPreviewProps {
  content?: string
  html?: string
  template: XHSTemplate
  watermark?: string
  watermarkPosition?: XHSWatermarkPosition
  watermarkOpacity?: number
  watermarkSize?: XHSWatermarkSize
  showPageNumber?: boolean
  currentPage?: number
  totalPages?: number
}

interface FontConfig { title: string; body: string }

function BlockWrap({ tag = 'div', className, children, ...rest }: {
  tag?: string; className: string; children?: React.ReactNode; [key: string]: unknown
}) {
  const Tag = tag as keyof JSX.IntrinsicElements
  return <Tag className={className} {...rest}>{children}</Tag>
}

function createBaseRenderers(counter: { current: number }) {
  const nextIdx = () => counter.current++
  return {
    code: ({ className: codeCls, children }: { className?: string; children?: React.ReactNode }) => {
      const match = /language-(\w+)/.exec(codeCls || '')
      const language = match ? match[1] : 'text'
      const code = String(children).replace(/\n$/, '')
      // 判断是否看起来像内联代码（单行且不太长）
      const isInline = !match && !code.includes('\n') && code.length < 80
      if (isInline) return <code className="xhs-inline-code"><span>{children}</span></code>
      return (
        <BlockWrap className="xhs-code-block" data-xhs-block={nextIdx()}>
          <SyntaxHighlighter style={oneDark} language={language} PreTag="div">
            {code}
          </SyntaxHighlighter>
          <XHSCodeBlockCopyButton code={code} />
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
      <a href={href} className="xhs-link" target="_blank" rel="noopener noreferrer">{children}</a>
    ),
    hr: () => <BlockWrap className="xhs-hr" tag="hr" data-xhs-block={nextIdx()} />,
  }
}

/** 12种不同结构的渲染器 */
function createRenderersByType(type: RendererType, fontConfig: FontConfig, counter: { current: number }) {
  const base = createBaseRenderers(counter)
  const nextIdx = () => counter.current++

  // ========== 1. card: 经典卡片式 ==========
  if (type === 'card') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-h1" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h2" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 2. bare: 无卡片简洁 ==========
  if (type === 'bare') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-bare" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h2" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-paragraph" data-xhs-block={nextIdx()}>
          <p style={{ fontFamily: fontConfig.body, margin: 0 }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 3. magazine: 杂志风 ==========
  if (type === 'magazine') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-magazine" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-magazine" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-paragraph xhs-paragraph-magazine" data-xhs-block={nextIdx()}>
          <p style={{ fontFamily: fontConfig.body, margin: 0 }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-magazine" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 4. side: 公众号侧边标题 ==========
  if (type === 'side') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-side" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-side" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 5. classic: 传统中国风 ==========
  if (type === 'classic') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-classic" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-classic" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h3 xhs-h3-classic" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-classic" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-classic" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 6. scrapbook: 手账风 ==========
  if (type === 'scrapbook') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-scrapbook" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-scrapbook" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h3 xhs-h3-scrapbook" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-scrapbook" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-scrapbook" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 7. fullpage: 全屏沉浸 ==========
  if (type === 'fullpage') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-fullpage" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-fullpage" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-fullpage" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-fullpage" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 8. editorial: 编辑排版 ==========
  if (type === 'editorial') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-editorial" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-editorial" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-paragraph xhs-paragraph-editorial" data-xhs-block={nextIdx()}>
          <p style={{ fontFamily: fontConfig.body, margin: 0 }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-editorial" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 9. quote: 引用突出 ==========
  if (type === 'quote') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-quote" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-quote" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-quote" tag="blockquote" data-xhs-block={nextIdx()}>
          <p style={{ fontFamily: fontConfig.body, margin: 0 }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-quote" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list xhs-list-quote" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered xhs-list-ordered-quote" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 10. timeline: 时间线 ==========
  if (type === 'timeline') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-timeline" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-timeline" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-timeline" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-timeline" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list xhs-list-timeline" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered xhs-list-ordered-timeline" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 11. split: 左右分栏 ==========
  if (type === 'split') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-split" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-split" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-split" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-split" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // ========== 12. banner: 横版Banner ==========
  if (type === 'banner') {
    return {
      ...base,
      h1: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h1 xhs-h1-banner" data-xhs-block={nextIdx()}>
          <h1 style={{ fontFamily: fontConfig.title, marginBottom: 0 }}>{children}</h1>
        </BlockWrap>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-h2 xhs-h2-banner" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h3" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h4: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h4" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h5: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h5" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      h6: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-h6" data-xhs-block={nextIdx()}><span>{children}</span></BlockWrap>,
      p: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-card xhs-card-banner" data-xhs-block={nextIdx()}>
          <p className="xhs-paragraph" style={{ fontFamily: fontConfig.body }}>{children}</p>
        </BlockWrap>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <BlockWrap className="xhs-blockquote xhs-blockquote-banner" tag="blockquote" data-xhs-block={nextIdx()}>{children}</BlockWrap>
      ),
      ul: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list" data-xhs-block={nextIdx()}><ul>{children}</ul></BlockWrap>,
      ol: ({ children }: { children?: React.ReactNode }) => <BlockWrap className="xhs-list-ordered" data-xhs-block={nextIdx()}><ol>{children}</ol></BlockWrap>,
    }
  }

  // 默认: card
  return createRenderersByType('card', fontConfig, counter)
}

export const XiaohongshuPreview = memo(function XiaohongshuPreview({
  content, html: htmlContent, template,
  watermark = '', watermarkPosition = 'bottom-right', watermarkOpacity = 0.5, watermarkSize = 'medium',
  showPageNumber = false, currentPage = 1, totalPages = 1,
}: XiaohongshuPreviewProps) {
  const prevTemplate = useRef<XHSTemplate>(template)

  useEffect(() => {
    if (prevTemplate.current !== template) {
      prevTemplate.current = template
    }
    loadTemplateFullCSS(template)
  }, [template])

  const meta = XHS_TEMPLATE_META[template]
  const fontConfig: FontConfig = meta
    ? { title: meta.fontTitle, body: meta.fontBody }
    : { title: 'bold 2em "PingFang SC", "Microsoft YaHei", sans-serif', body: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' }

  const rendererType = TEMPLATE_RENDERERS[template] ?? 'card'
  const counter = useMemo(() => ({ current: 0 }), [content])
  const renderers = useMemo(() => createRenderersByType(rendererType, fontConfig, counter), [rendererType, fontConfig, counter])

  const renderBody = () => {
    if (htmlContent) return <div className="xhs-html-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    return (
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeRaw, rehypeKatex,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames || []), 'div', 'mark', 'sub', 'sup'],
            attributes: { ...defaultSchema.attributes, div: [['align'], ['data-xhs-block'], ['style']] },
          }],
        ]}
        components={renderers}
      >
        {content ?? ''}
      </Markdown>
    )
  }

  // 水印大小映射
  const watermarkSizeClass = {
    small: 'xhs-watermark--small',
    medium: 'xhs-watermark--medium',
    large: 'xhs-watermark--large',
  }[watermarkSize] || 'xhs-watermark--medium'

  // 水印位置样式
  const getWatermarkPositionClass = () => {
    switch (watermarkPosition) {
      case 'top-left': return 'xhs-watermark--top-left'
      case 'top-center': return 'xhs-watermark--top-center'
      case 'top-right': return 'xhs-watermark--top-right'
      case 'bottom-left': return 'xhs-watermark--bottom-left'
      case 'bottom-center': return 'xhs-watermark--bottom-center'
      case 'bottom-right': return 'xhs-watermark--bottom-right'
      case 'diagonal': return 'xhs-watermark--diagonal'
      default: return 'xhs-watermark--bottom-right'
    }
  }

  // 斜铺水印需要特殊渲染
  const isDiagonal = watermarkPosition === 'diagonal'

  return (
    <div className={`xhs-preview xhs-template-${template}`}>
      {renderBody()}

      {/* 斜铺水印 */}
      {isDiagonal && watermark && (
        <div
          className={`xhs-watermark-diagonal ${watermarkSizeClass}`}
          style={{ opacity: watermarkOpacity }}
        >
          {watermark}
        </div>
      )}

      {/* 固定位置水印 */}
      {!isDiagonal && watermark && (
        <div
          className={`xhs-watermark-fixed ${getWatermarkPositionClass()} ${watermarkSizeClass}`}
          style={{ opacity: watermarkOpacity }}
        >
          {watermark}
        </div>
      )}

      {/* 页码 */}
      {showPageNumber && (
        <div className="xhs-footer-page">{currentPage} / {totalPages}</div>
      )}
    </div>
  )
})
