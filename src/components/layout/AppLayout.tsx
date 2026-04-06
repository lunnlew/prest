import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useBoundStore } from '../../stores'
import { SidebarTabs } from './SidebarTabs'
import { SidebarPanel } from './SidebarPanel'
import { EditorPanel } from './EditorPanel'
import { PreviewPanel } from './PreviewPanel'
import { ResizeHandle } from './ResizeHandle'

export function AppLayout() {
  const {
    panelLayout,
    sidebarVisible,
    previewVisible,
    editorOnLeft,
    editorPanelSize,
    previewPanelSize,
    setPanelLayout,
    setEditorPanelSize,
    setPreviewPanelSize,
  } = useBoundStore()

  const handleLayoutChange = (sizes: number[]) => {
    setPanelLayout(sizes)
  }

  // Handle editor-preview split size changes
  const handleEditorPreviewLayoutChange = (sizes: number[]) => {
    if (sizes.length >= 2) {
      if (editorOnLeft) {
        setEditorPanelSize(sizes[0])
        setPreviewPanelSize(sizes[1])
      } else {
        setPreviewPanelSize(sizes[0])
        setEditorPanelSize(sizes[1])
      }
    }
  }

  // Determine panel order based on editorOnLeft
  const leftPanel = editorOnLeft ? <EditorPanel /> : <PreviewPanel />
  const rightPanel = editorOnLeft ? <PreviewPanel /> : <EditorPanel />
  const leftPanelId = editorOnLeft ? 'editor' : 'preview'
  const rightPanelId = editorOnLeft ? 'preview' : 'editor'
  const leftPanelMinSize = editorOnLeft ? 25 : 20
  const rightPanelMinSize = editorOnLeft ? 20 : 25
  const leftPanelMaxSize = editorOnLeft ? undefined : 60
  const rightPanelMaxSize = editorOnLeft ? 60 : undefined
  const leftPanelSize = editorOnLeft ? editorPanelSize : previewPanelSize
  const rightPanelSize = editorOnLeft ? previewPanelSize : editorPanelSize

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] flex">
      {/* 侧边栏标签按钮列 - 始终显示 */}
      <SidebarTabs />

      <PanelGroup
        direction="horizontal"
        autoSaveId="main-layout"
        onLayout={handleLayoutChange}
        className="h-full"
      >
        {/* Left Sidebar Content - 可隐藏 */}
        {sidebarVisible && (
          <Panel
            id="sidebar"
            defaultSize={panelLayout[0]}
            minSize={15}
            maxSize={35}
            className="bg-[var(--bg-secondary)]"
          >
            <SidebarPanel />
          </Panel>
        )}

        {/* Resize Handle between Sidebar and Editor */}
        {sidebarVisible && (
          <PanelResizeHandle id="sidebar-resize" className="w-1 hover:w-2 transition-all group">
            <ResizeHandle direction="vertical" />
          </PanelResizeHandle>
        )}

        {/* Center Editor + Right Preview */}
        <Panel id="main" defaultSize={sidebarVisible ? panelLayout[1] : 100} minSize={30}>
          <PanelGroup
            key={`editor-preview-${editorOnLeft}`}
            direction="horizontal"
            autoSaveId={`editor-preview-layout-${editorOnLeft}`}
            className="h-full"
            onLayout={handleEditorPreviewLayoutChange}
          >
            {/* Left Panel (Editor or Preview) */}
            {previewVisible && (
              <Panel
                id={leftPanelId}
                defaultSize={leftPanelSize}
                minSize={leftPanelMinSize}
                maxSize={leftPanelMaxSize}
                className={leftPanelId === 'editor' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}
              >
                {leftPanel}
              </Panel>
            )}

            {/* Resize Handle between Editor and Preview */}
            {previewVisible && (
              <PanelResizeHandle id="preview-resize" className="w-1 hover:w-2 transition-all group">
                <ResizeHandle direction="vertical" />
              </PanelResizeHandle>
            )}

            {/* Right Panel (Preview or Editor) */}
            {previewVisible && (
              <Panel
                id={rightPanelId}
                defaultSize={rightPanelSize}
                minSize={rightPanelMinSize}
                maxSize={rightPanelMaxSize}
                className={rightPanelId === 'editor' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}
              >
                {rightPanel}
              </Panel>
            )}
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}
