import { useRef, useState, useCallback, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { XiaohongshuPreview } from '../preview/XiaohongshuPreview'
import { paginate, type PageInfo } from '../../services/XHSPaginator'
import type { XHSAspectRatio, XHSTemplate } from '../../types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const ASPECT_DIMENSIONS: Record<XHSAspectRatio, { w: number; h: number }> = {
  '3:4': { w: 1242, h: 1660 },
  '3:5': { w: 1080, h: 1800 },
  '1:1': { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
}

const TEMPLATE_LABELS: Record<XHSTemplate, string> = {
  cream: '奶油',
  minimal: '简约',
  gradient: '渐变',
  pink: '粉色',
  mint: '薄荷',
  lavender: '薰衣草',
  peach: '蜜桃',
}

const ASPECT_LABELS: Record<XHSAspectRatio, string> = {
  '3:4': '竖版 3:4',
  '3:5': '竖版 3:5',
  '1:1': '方版 1:1',
  '16:9': '横版 16:9',
}

const MAX_WIDTHS: Record<XHSAspectRatio, number> = {
  '3:4': ASPECT_DIMENSIONS['3:4'].w,
  '3:5': ASPECT_DIMENSIONS['3:5'].w,
  '1:1': ASPECT_DIMENSIONS['1:1'].w,
  '16:9': ASPECT_DIMENSIONS['16:9'].w,
}

interface XHSExportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function XHSExportDialog({ isOpen, onClose }: XHSExportDialogProps) {
  const { content, settings, setXHSExportSettings } = useBoundStore()
  const { t, loading } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [tags, setTags] = useState(settings.xhsExport.tags.join(' '))
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [pages, setPages] = useState<PageInfo[]>([])
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('pdf')
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleClose = useCallback(() => onClose(), [onClose])

  const capturePageAsCanvas = useCallback(async (pageEl: HTMLDivElement, pageW: number, pageH: number): Promise<HTMLCanvasElement> => {
    const canvas = await html2canvas(pageEl, {
      width: pageW,
      height: pageH,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc: Document) => {
        const defaultView = clonedDoc.defaultView
        if (!defaultView) return

        // 重置所有 padding 和 margin
        const allElements = clonedDoc.body.querySelectorAll('h1, h2, h3, h4, h5, h6, xhs-inline-code')
        allElements.forEach(el => {
          const htmlEl = el as HTMLElement
          htmlEl.style.padding = '0'
          htmlEl.style.margin = '0'
        })

        // 根据 lineHeight 计算偏移：lineHeight * 0.45
        // lineHeight 直接反映 line-box 的高度，大字体有更大的 line-height，
        // 因此自然地给予更大的偏移量（与 fontSize 不同，fontSize 与 descent 不成正比）
        const textSelectors = 'h1, h2, h3, h4, h5, h6, p, span, li, .xhs-paragraph, .xhs-blockquote'
        const textElements = clonedDoc.body.querySelectorAll(textSelectors)
        textElements.forEach(el => {
          const htmlEl = el as HTMLElement
          const computedStyle = defaultView.getComputedStyle(htmlEl)
          const lineHeight = parseFloat(computedStyle.lineHeight) || 20
          const offset = lineHeight * 0.45
          htmlEl.style.transform = `translateY(-${offset}px)`
        })
      }
    })
    return canvas
  }, [])

  const handleExport = useCallback(async () => {
    if (pages.length === 0) return
    setExporting(true)
    setExportProgress('准备导出...')

    const xhsLocal = settings.xhsExport
    const frameWLocal = xhsLocal.exportWidth ?? 440
    const ratioH = ASPECT_DIMENSIONS[xhsLocal.aspectRatio].h / ASPECT_DIMENSIONS[xhsLocal.aspectRatio].w
    const frameHLocal = Math.round(frameWLocal * ratioH)

    try {
      const pageW = frameWLocal
      const pageH = frameHLocal
      const canvasList: HTMLCanvasElement[] = []

      for (let i = 0; i < pages.length; i++) {
        setExportProgress(`正在处理第 ${i + 1}/${pages.length} 页...`)
        const pageEl = frameRefs.current[i]
        if (pageEl) {
          const canvas = await capturePageAsCanvas(pageEl, pageW, pageH)
          canvasList.push(canvas)
        }
      }

      if (canvasList.length === 0) {
        throw new Error('没有可导出的页面')
      }

      if (exportFormat === 'png') {
        for (let i = 0; i < canvasList.length; i++) {
          setExportProgress(`正在下载第 ${i + 1}/${canvasList.length} 页...`)
          const link = document.createElement('a')
          link.download = `小红书-${String(i + 1).padStart(3, '0')}.png`
          link.href = canvasList[i].toDataURL('image/png', 1.0)
          link.click()
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } else {
        setExportProgress(`正在生成 PDF...`)
        const pdf = new jsPDF({
          orientation: pageW > pageH ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pageW, pageH]
        })

        for (let i = 0; i < canvasList.length; i++) {
          if (i > 0) {
            pdf.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait')
          }
          setExportProgress(`正在添加第 ${i + 1}/${canvasList.length} 页...`)
          const imgData = canvasList[i].toDataURL('image/jpeg', 0.95)
          pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH)
        }

        pdf.save('小红书导出.pdf')
      }

      setExportProgress('导出完成!')
      setTimeout(() => setExportProgress(''), 1500)
    } catch (e) {
      console.error('Export failed:', e)
      setExportProgress('导出失败')
      setTimeout(() => setExportProgress(''), 2000)
    } finally {
      setExporting(false)
    }
  }, [pages, settings, exportFormat, capturePageAsCanvas])

  const xhs = settings.xhsExport
  const frameW = xhs.exportWidth ?? 440
  const measureKey = `${xhs.aspectRatio}-${xhs.template}-${xhs.watermark}-${xhs.showPageNumber}-${xhs.exportWidth}-${content}-${tags}`

  useEffect(() => {
    if (!isOpen) return

    const measure = () => {
      const el = measureRef.current
      const preview = el?.querySelector('.xhs-preview') as HTMLElement | null
      if (!preview) return

      const result = paginate(preview, xhs.aspectRatio, frameW)
      setPages(result.pages)
    }

    const timer1 = setTimeout(measure, 150)
    const timer2 = setTimeout(measure, 500)
    return () => { clearTimeout(timer1); clearTimeout(timer2) }
  }, [isOpen, measureKey])

  const handleAspectChange = useCallback(
    (ratio: XHSAspectRatio) => {
      setXHSExportSettings({ aspectRatio: ratio, exportWidth: Math.min(xhs.exportWidth, MAX_WIDTHS[ratio as XHSAspectRatio]) })
      setPages([])
    }, [setXHSExportSettings]
  )

  const handleTemplateChange = useCallback(
    (tpl: XHSTemplate) => {
      setXHSExportSettings({ template: tpl })
      setPages([])
    }, [setXHSExportSettings]
  )

  const handleTagsChange = useCallback(
    (val: string) => {
      setTags(val)
      setXHSExportSettings({ tags: val.split(/\s+/).filter(Boolean) })
      setPages([])
    }, [setXHSExportSettings]
  )

  if (loading || !t) return null
  if (!isOpen) return null

  const ratioH = ASPECT_DIMENSIONS[xhs.aspectRatio].h / ASPECT_DIMENSIONS[xhs.aspectRatio].w
  const frameH = Math.round(frameW * ratioH)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div
        ref={dialogRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl w-[95vw] max-w-[1400px] h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {t.toolbar.xhsExport || '小红书出图'}
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">✕</button>
        </div>

        {/* Hidden measure: full content at display width */}
        <div
          ref={measureRef}
          style={{
            position: 'absolute',
            left: '-9999px',
            visibility: 'hidden',
            width: `${frameW}px`,
          }}
        >
          <XiaohongshuPreview key={measureKey} content={content} template={xhs.template}
            watermark={xhs.watermark} tags={xhs.tags} showPageNumber={xhs.showPageNumber} />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Settings */}
          <div className="w-64 border-r border-[var(--border-color)] overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">尺寸</label>
              <div className="space-y-1">
                {Object.entries(ASPECT_DIMENSIONS).map(([key, { w, h }]) => (
                  <button key={key} onClick={() => handleAspectChange(key as XHSAspectRatio)}
                    className={`w-full px-3 py-2 text-sm rounded transition-colors flex items-center justify-between ${
                      xhs.aspectRatio === key
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                    }`}>
                    <span>{ASPECT_LABELS[key as XHSAspectRatio]}</span>
                    <span className="text-xs opacity-75">{w}×{h}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">模板</label>
              <div className="space-y-1">
                {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => handleTemplateChange(key as XHSTemplate)}
                    className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                      xhs.template === key
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">导出宽度</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={320}
                  max={MAX_WIDTHS[xhs.aspectRatio]}
                  step={20}
                  value={xhs.exportWidth}
                  onChange={(e) => { setPages([]); setXHSExportSettings({ exportWidth: Number(e.target.value) }) }}
                  className="flex-1 accent-[var(--accent-color)]"
                />
                <span className="text-sm text-[var(--text-primary)] min-w-[4rem] text-right">{frameW}px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">水印</label>
              <input value={xhs.watermark}
                onChange={(e) => setXHSExportSettings({ watermark: e.target.value })}
                placeholder="留空不显示"
                className="w-full px-3 py-2 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]" />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">话题标签</label>
              <textarea value={tags} onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="用空格分隔" rows={2}
                className="w-full px-3 py-2 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] resize-none" />
            </div>

            <div>
              <button onClick={() => setXHSExportSettings({ showPageNumber: !xhs.showPageNumber })}
                className={`px-3 py-2 text-sm rounded transition-colors ${
                  xhs.showPageNumber
                    ? 'bg-[var(--accent-color)] text-white'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                }`}>显示页码</button>
            </div>

            {pages.length > 0 && (
              <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded p-3">
                共 {pages.length} 页
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] uppercase block mb-2">导出格式</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                    exportFormat === 'pdf'
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                  }`}
                >
                  PDF
                </button>
                <button
                  onClick={() => setExportFormat('png')}
                  className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                    exportFormat === 'png'
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                  }`}
                >
                  PNG
                </button>
              </div>
            </div>

            <button onClick={handleExport} disabled={exporting}
              className="w-full px-4 py-2 text-sm rounded bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white font-medium disabled:opacity-50 transition-colors">
              {exporting ? (exportProgress || '导出中...') : `导出 ${exportFormat.toUpperCase()}`}
            </button>
          </div>

          {/* Right: Paginated preview — each page renders ONLY its own content */}
          <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-6 flex flex-col items-center gap-4">
            {pages.length === 0 ? (
              <div className="text-[var(--text-muted)] text-sm mt-20">计算分页中...</div>
            ) : (
              pages.map((pageInfo, pageIdx) => {
                const pageNum = pageIdx + 1
                const isLast = pageIdx === pages.length - 1
                return (
                  <div
                    key={pageIdx}
                    ref={(el) => { frameRefs.current[pageIdx] = el }}
                    className="xhs-page-frame flex-shrink-0"
                    style={{ width: frameW, height: frameH }}
                  >
                    <XiaohongshuPreview
                      html={pageInfo.html}
                      template={xhs.template}
                      watermark={isLast ? xhs.watermark : ''}
                      tags={isLast ? xhs.tags : []}
                      showPageNumber={xhs.showPageNumber}
                      currentPage={pages.length > 1 ? pageNum : 1}
                      totalPages={pages.length}
                    />
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
