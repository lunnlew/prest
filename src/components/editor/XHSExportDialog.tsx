import { useRef, useState, useCallback, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { XiaohongshuPreview } from '../preview/XiaohongshuPreview'
import { paginate, type PageInfo } from '../../services/XHSPaginator'
import type { XHSAspectRatio, XHSTemplate, XHSWatermarkPosition, XHSWatermarkScope, XHSWatermarkSize } from '../../types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { TEMPLATE_LABELS } from '../../config/xhsTemplates'

const WATERMARK_POSITION_OPTIONS: { value: XHSWatermarkPosition; label: string }[] = [
  { value: 'top-left', label: '左上' },
  { value: 'top-center', label: '顶部居中' },
  { value: 'top-right', label: '右上' },
  { value: 'bottom-left', label: '左下' },
  { value: 'bottom-center', label: '底部居中' },
  { value: 'bottom-right', label: '右下' },
  { value: 'diagonal', label: '斜铺' },
]

const WATERMARK_SCOPE_OPTIONS: { value: XHSWatermarkScope; label: string }[] = [
  { value: 'all', label: '每页' },
  { value: 'first', label: '仅首页' },
  { value: 'last', label: '仅末页' },
  { value: 'none', label: '不显示' },
]

const WATERMARK_SIZE_OPTIONS: { value: XHSWatermarkSize; label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]

const ASPECT_DIMENSIONS: Record<XHSAspectRatio, { w: number; h: number }> = {
  '3:5': { w: 1080, h: 1800 },
  '3:4': { w: 1242, h: 1660 },
  '1:1': { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
}

const ASPECT_LABELS: Record<XHSAspectRatio, string> = {
  '3:5': '竖版 3:5',
  '3:4': '竖版 3:4',
  '1:1': '方版 1:1',
  '16:9': '横版 16:9',
}

const MAX_WIDTHS: Record<XHSAspectRatio, number> = {
  '3:5': ASPECT_DIMENSIONS['3:5'].w,
  '3:4': ASPECT_DIMENSIONS['3:4'].w,
  '1:1': ASPECT_DIMENSIONS['1:1'].w,
  '16:9': ASPECT_DIMENSIONS['16:9'].w,
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-color)] transition-colors">{label}</span>
    </label>
  )
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
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [pages, setPages] = useState<PageInfo[]>([])
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png'>('png')
  const frameRefs = useRef<(HTMLDivElement | null)[]>([])

  const handleClose = useCallback(() => onClose(), [onClose])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleClose])

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
  const measureKey = `${xhs.aspectRatio}-${xhs.template}-${xhs.watermark}-${xhs.showPageNumber}-${xhs.exportWidth}-${content}`

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
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">
            {t.toolbar.xhsExport || '小红书出图'}
          </h2>

          <div className="flex items-center gap-4">
            {/* Size selector in header */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">尺寸:</span>
              <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                {Object.entries(ASPECT_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleAspectChange(key as XHSAspectRatio)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      xhs.aspectRatio === key
                        ? 'bg-[var(--accent-color)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Width */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">宽度:</span>
              <input
                type="range"
                min={320}
                max={MAX_WIDTHS[xhs.aspectRatio]}
                step={20}
                value={xhs.exportWidth}
                onChange={(e) => { setPages([]); setXHSExportSettings({ exportWidth: Number(e.target.value) }) }}
                className="w-24 accent-[var(--accent-color)] h-2"
              />
              <span className="text-xs font-medium text-[var(--text-primary)] min-w-[4rem]">{frameW}px</span>
            </div>

            {/* Page count */}
            <span className="text-sm text-[var(--text-muted)] min-w-[3rem] text-center">
              {pages.length > 0 ? `${pages.length} 页` : '— 页'}
            </span>

            {/* Format toggle */}
            <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-0.5">
              <button
                onClick={() => setExportFormat('png')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  exportFormat === 'png'
                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setExportFormat('pdf')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  exportFormat === 'pdf'
                    ? 'bg-[var(--accent-color)] text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                PDF
              </button>
            </div>

            {/* Export button */}
            <button onClick={handleExport} disabled={exporting || pages.length === 0}
              className="px-5 py-2 text-sm rounded-lg bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
              {exporting ? (
                <>
                  <span className="animate-spin text-base">⟳</span>
                  <span>{exportProgress || '导出中...'}</span>
                </>
              ) : (
                <>
                  <span>↓</span>
                  <span>导出</span>
                </>
              )}
            </button>

            <button onClick={handleClose} className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">✕</button>
          </div>
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
            watermark={xhs.watermark} watermarkPosition={xhs.watermarkPosition}
            watermarkOpacity={xhs.watermarkOpacity} watermarkSize={xhs.watermarkSize}
            showPageNumber={xhs.showPageNumber} />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: Settings */}
          <div className="w-80 border-r border-[var(--border-color)] overflow-y-auto p-5 space-y-5">
            {/* Section: Template */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">模板</h3>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(TEMPLATE_LABELS).map(([key, label]) => (
                  <button key={key} onClick={() => handleTemplateChange(key as XHSTemplate)}
                    className={`px-2 py-2 text-xs rounded-lg transition-all ${
                      xhs.template === key
                        ? 'bg-[var(--accent-color)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            {/* Section: Watermark Options */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">水印设置</h3>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">水印文字</label>
                  <input value={xhs.watermark}
                    onChange={(e) => setXHSExportSettings({ watermark: e.target.value })}
                    placeholder="留空则不显示"
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">位置</label>
                  <select
                    value={xhs.watermarkPosition}
                    onChange={(e) => setXHSExportSettings({ watermarkPosition: e.target.value as XHSWatermarkPosition })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  >
                    {WATERMARK_POSITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">显示</label>
                  <select
                    value={xhs.watermarkScope}
                    onChange={(e) => setXHSExportSettings({ watermarkScope: e.target.value as XHSWatermarkScope })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  >
                    {WATERMARK_SCOPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">透明度: {Math.round(xhs.watermarkOpacity * 100)}%</label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={xhs.watermarkOpacity * 100}
                    onChange={(e) => setXHSExportSettings({ watermarkOpacity: Number(e.target.value) / 100 })}
                    className="w-full accent-[var(--accent-color)] h-2"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">大小</label>
                  <div className="flex gap-1">
                    {WATERMARK_SIZE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setXHSExportSettings({ watermarkSize: opt.value })}
                        className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-all ${
                          xhs.watermarkSize === opt.value
                            ? 'bg-[var(--accent-color)] text-white'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Page Number */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">页码</h3>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                <Toggle
                  checked={xhs.showPageNumber}
                  onChange={(v) => setXHSExportSettings({ showPageNumber: v })}
                  label="显示页码"
                />
              </div>
            </div>
          </div>

          {/* Right: Paginated preview — each page renders ONLY its own content */}
          <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-6 flex flex-col items-center gap-4">
            {pages.length === 0 ? (
              <div className="text-[var(--text-muted)] text-sm mt-20">计算分页中...</div>
            ) : (
              pages.map((pageInfo, pageIdx) => {
                const pageNum = pageIdx + 1
                const isFirst = pageIdx === 0
                const isLast = pageIdx === pages.length - 1
                // 根据 watermarkScope 决定是否显示水印
                const showWatermark = xhs.watermarkScope === 'all' ||
                  (xhs.watermarkScope === 'first' && isFirst) ||
                  (xhs.watermarkScope === 'last' && isLast)
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
                      watermark={showWatermark ? xhs.watermark : ''}
                      watermarkPosition={xhs.watermarkPosition}
                      watermarkOpacity={xhs.watermarkOpacity}
                      watermarkSize={xhs.watermarkSize}
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
