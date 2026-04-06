import { useEffect, useRef } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import type { ImperativePanelHandle } from 'react-resizable-panels'
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
    focusMode,
    setPanelLayout,
    setEditorPanelSize,
    setPreviewPanelSize,
  } = useBoundStore()

  // Refs for imperative panel control
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const leftPanelRef = useRef<ImperativePanelHandle>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  // Handle Escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const store = useBoundStore.getState()
        if (store.focusMode) {
          store.toggleFocusMode()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus mode: only show editor, hide everything else
  const showEditorOnly = focusMode

  // Collapse/expand sidebar based on visibility
  useEffect(() => {
    if (!sidebarVisible || showEditorOnly) {
      sidebarRef.current?.collapse()
    } else {
      sidebarRef.current?.expand()
    }
  }, [sidebarVisible, showEditorOnly])

  // Collapse/expand preview panels based on visibility
  useEffect(() => {
    if (!previewVisible || showEditorOnly) {
      leftPanelRef.current?.collapse()
      rightPanelRef.current?.collapse()
    } else {
      leftPanelRef.current?.expand()
      rightPanelRef.current?.expand()
    }
  }, [previewVisible, showEditorOnly])

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

  const handleLayoutChange = (sizes: number[]) => {
    // Only save layout when sidebar is visible (2 sizes: sidebar + main)
    // When sidebar is hidden, sizes would be [100] which would corrupt panelLayout
    if (sizes.length >= 2) {
      setPanelLayout(sizes)
    }
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

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] flex">
      {/* 专注模式退出按钮 */}
      {showEditorOnly && (
        <button
          onClick={() => useBoundStore.getState().toggleFocusMode()}
          className="fixed top-2 right-2 z-50 px-3 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm rounded hover:bg-[var(--bg-hover)]"
        >
          Exit Focus
        </button>
      )}

      {/* 侧边栏标签按钮列 - 始终显示，除非专注模式 */}
      {!showEditorOnly && <SidebarTabs />}

      <PanelGroup
        direction="horizontal"
        autoSaveId="main-layout"
        onLayout={handleLayoutChange}
        className="h-full"
      >
        {/* Left Sidebar - collapsible */}
        <Panel
          id="sidebar"
          ref={sidebarRef}
          defaultSize={panelLayout[0]}
          minSize={15}
          maxSize={35}
          collapsible
          className="bg-[var(--bg-secondary)]"
        >
          <SidebarPanel />
        </Panel>

        {/* Resize Handle between Sidebar and Editor */}
        <PanelResizeHandle id="sidebar-resize" className="w-1 hover:w-2 transition-all group">
          <ResizeHandle direction="vertical" />
        </PanelResizeHandle>

        {/* Center Editor + Right Preview */}
        <Panel
          id="main"
          defaultSize={panelLayout[1]}
          minSize={showEditorOnly ? 100 : 30}
        >
          <PanelGroup
            key={`editor-preview-${editorOnLeft}`}
            direction="horizontal"
            autoSaveId={`editor-preview-layout-${editorOnLeft}`}
            className="h-full"
            onLayout={handleEditorPreviewLayoutChange}
          >
            {/* Left Panel (Editor or Preview) */}
            <Panel
              id={leftPanelId}
              ref={leftPanelRef}
              defaultSize={leftPanelSize}
              minSize={leftPanelMinSize}
              maxSize={leftPanelMaxSize}
              collapsible
              className={leftPanelId === 'editor' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}
            >
              {leftPanel}
            </Panel>

            {/* Resize Handle between Editor and Preview */}
            <PanelResizeHandle id="preview-resize" className="w-1 hover:w-2 transition-all group">
              <ResizeHandle direction="vertical" />
            </PanelResizeHandle>

            {/* Right Panel (Preview or Editor) */}
            <Panel
              id={rightPanelId}
              ref={rightPanelRef}
              defaultSize={rightPanelSize}
              minSize={rightPanelMinSize}
              maxSize={rightPanelMaxSize}
              collapsible
              className={rightPanelId === 'editor' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}
            >
              {rightPanel}
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}
