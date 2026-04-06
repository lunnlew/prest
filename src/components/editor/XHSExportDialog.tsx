import { useRef, useState, useCallback, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { XiaohongshuPreview } from '../preview/XiaohongshuPreview'
import { paginate, type PageInfo } from '../../services/XHSPaginator'
import type { XHSAspectRatio, XHSTemplate, XHSWatermarkPosition, XHSWatermarkScope, XHSWatermarkSize } from '../../types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { TEMPLATE_LABELS } from '../../config/xhsTemplates'

const WATERMARK_POSITION_OPTIONS: { value: XHSWatermarkPosition; labelKey: string }[] = [
  { value: 'top-left', labelKey: 'watermarkTopLeft' },
  { value: 'top-center', labelKey: 'watermarkTopCenter' },
  { value: 'top-right', labelKey: 'watermarkTopRight' },
  { value: 'bottom-left', labelKey: 'watermarkBottomLeft' },
  { value: 'bottom-center', labelKey: 'watermarkBottomCenter' },
  { value: 'bottom-right', labelKey: 'watermarkBottomRight' },
  { value: 'diagonal', labelKey: 'watermarkDiagonal' },
]

const WATERMARK_SCOPE_OPTIONS: { value: XHSWatermarkScope; labelKey: string }[] = [
  { value: 'all', labelKey: 'watermarkAll' },
  { value: 'first', labelKey: 'watermarkFirst' },
  { value: 'last', labelKey: 'watermarkLast' },
  { value: 'none', labelKey: 'watermarkNone' },
]

const WATERMARK_SIZE_OPTIONS: { value: XHSWatermarkSize; labelKey: string }[] = [
  { value: 'small', labelKey: 'watermarkSmall' },
  { value: 'medium', labelKey: 'watermarkMedium' },
  { value: 'large', labelKey: 'watermarkLarge' },
]

const ASPECT_DIMENSIONS: Record<XHSAspectRatio, { w: number; h: number }> = {
  '3:5': { w: 1080, h: 1800 },
  '3:4': { w: 1242, h: 1660 },
  '1:1': { w: 1080, h: 1080 },
  '16:9': { w: 1920, h: 1080 },
}

const ASPECT_LABELS: Record<XHSAspectRatio, string> = {
  '3:5': 'aspectPortrait35',
  '3:4': 'aspectPortrait34',
  '1:1': 'aspectSquare',
  '16:9': 'aspectLandscape',
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
    if (!t) return
    if (pages.length === 0) return
    setExporting(true)
    setExportProgress(t.xhsExport.preparing)

    const xhsLocal = settings.xhsExport
    const frameWLocal = xhsLocal.exportWidth ?? 440
    const ratioH = ASPECT_DIMENSIONS[xhsLocal.aspectRatio].h / ASPECT_DIMENSIONS[xhsLocal.aspectRatio].w
    const frameHLocal = Math.round(frameWLocal * ratioH)

    try {
      const pageW = frameWLocal
      const pageH = frameHLocal
      const canvasList: HTMLCanvasElement[] = []

      for (let i = 0; i < pages.length; i++) {
        setExportProgress(t.xhsExport.processing.replace('{{current}}', String(i + 1)).replace('{{total}}', String(pages.length)))
        const pageEl = frameRefs.current[i]
        if (pageEl) {
          const canvas = await capturePageAsCanvas(pageEl, pageW, pageH)
          canvasList.push(canvas)
        }
      }

      if (canvasList.length === 0) {
        throw new Error(t.xhsExport.noPagesToExport)
      }

      if (exportFormat === 'png') {
        for (let i = 0; i < canvasList.length; i++) {
          setExportProgress(t.xhsExport.downloading.replace('{{current}}', String(i + 1)).replace('{{total}}', String(canvasList.length)))
          const link = document.createElement('a')
          link.download = `小红书-${String(i + 1).padStart(3, '0')}.png`
          link.href = canvasList[i].toDataURL('image/png', 1.0)
          link.click()
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } else {
        setExportProgress(t.xhsExport.generatingPdf)
        const pdf = new jsPDF({
          orientation: pageW > pageH ? 'landscape' : 'portrait',
          unit: 'px',
          format: [pageW, pageH]
        })

        for (let i = 0; i < canvasList.length; i++) {
          if (i > 0) {
            pdf.addPage([pageW, pageH], pageW > pageH ? 'landscape' : 'portrait')
          }
          setExportProgress(t.xhsExport.addingPage.replace('{{current}}', String(i + 1)).replace('{{total}}', String(canvasList.length)))
          const imgData = canvasList[i].toDataURL('image/jpeg', 0.95)
          pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH)
        }

        pdf.save('小红书导出.pdf')
      }

      setExportProgress(t.xhsExport.exportComplete)
      setTimeout(() => setExportProgress(''), 1500)
    } catch (e) {
      console.error('Export failed:', e)
      setExportProgress(t.xhsExport.exportFailed)
      setTimeout(() => setExportProgress(''), 2000)
    } finally {
      setExporting(false)
    }
  }, [pages, settings, exportFormat, capturePageAsCanvas, t])

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
            {t.xhsExport.title}
          </h2>

          <div className="flex items-center gap-4">
            {/* Size selector in header */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">{t.xhsExport.size}:</span>
              <div className="flex items-center bg-[var(--bg-tertiary)] rounded-lg p-0.5">
                {Object.entries(ASPECT_LABELS).map(([key, labelKey]) => (
                  <button
                    key={key}
                    onClick={() => handleAspectChange(key as XHSAspectRatio)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      xhs.aspectRatio === key
                        ? 'bg-[var(--accent-color)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t.xhsExport[labelKey as keyof typeof t.xhsExport]}
                  </button>
                ))}
              </div>
            </div>

            {/* Export Width */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">{t.xhsExport.width}:</span>
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
              {pages.length > 0 ? `${pages.length} ${t.xhsExport.pages}` : `— ${t.xhsExport.pages}`}
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
                  <span>{exportProgress || t.xhsExport.exporting}</span>
                </>
              ) : (
                <>
                  <span>↓</span>
                  <span>{t.xhsExport.export}</span>
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
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.xhsExport.template}</h3>
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
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.xhsExport.watermarkSettings}</h3>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3 space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">{t.xhsExport.watermarkText}</label>
                  <input value={xhs.watermark}
                    onChange={(e) => setXHSExportSettings({ watermark: e.target.value })}
                    placeholder={t.xhsExport.watermarkTextPlaceholder}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">{t.xhsExport.position}</label>
                  <select
                    value={xhs.watermarkPosition}
                    onChange={(e) => setXHSExportSettings({ watermarkPosition: e.target.value as XHSWatermarkPosition })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  >
                    {WATERMARK_POSITION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t.xhsExport[opt.labelKey as keyof typeof t.xhsExport]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">{t.xhsExport.show}</label>
                  <select
                    value={xhs.watermarkScope}
                    onChange={(e) => setXHSExportSettings({ watermarkScope: e.target.value as XHSWatermarkScope })}
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
                  >
                    {WATERMARK_SCOPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{t.xhsExport[opt.labelKey as keyof typeof t.xhsExport]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">{t.xhsExport.opacity}: {Math.round(xhs.watermarkOpacity * 100)}%</label>
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
                  <label className="text-xs text-[var(--text-muted)] block mb-1.5">{t.xhsExport.size}</label>
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
                        {t.xhsExport[opt.labelKey as keyof typeof t.xhsExport]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Page Number */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.xhsExport.pageNumber}</h3>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-3">
                <Toggle
                  checked={xhs.showPageNumber}
                  onChange={(v) => setXHSExportSettings({ showPageNumber: v })}
                  label={t.xhsExport.showPageNumber}
                />
              </div>
            </div>
          </div>

          {/* Right: Paginated preview — each page renders ONLY its own content */}
          <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)] p-6 flex flex-col items-center gap-4">
            {pages.length === 0 ? (
              <div className="text-[var(--text-muted)] text-sm mt-20">{t.xhsExport.calculating}</div>
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
