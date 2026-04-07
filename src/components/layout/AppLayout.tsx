import { useEffect, useRef, useCallback } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import type { ImperativePanelHandle } from 'react-resizable-panels'
import { useBoundStore } from '../../stores'
import { SidebarTabs } from './SidebarTabs'
import { SidebarPanel } from './SidebarPanel'
import { EditorPanel } from './EditorPanel'
import { PreviewPanel } from './PreviewPanel'
import { ResizeHandle } from './ResizeHandle'

// Individual selectors to avoid re-renders from object destructuring
const usePanelLayout = () => useBoundStore(state => state.panelLayout)
const useSidebarVisible = () => useBoundStore(state => state.sidebarVisible)
const usePreviewVisible = () => useBoundStore(state => state.previewVisible)
const useEditorOnLeft = () => useBoundStore(state => state.editorOnLeft)
const useEditorPanelSize = () => useBoundStore(state => state.editorPanelSize)
const usePreviewPanelSize = () => useBoundStore(state => state.previewPanelSize)
const useFocusMode = () => useBoundStore(state => state.focusMode)
const useSetPanelLayout = () => useBoundStore(state => state.setPanelLayout)
const useSetEditorPanelSize = () => useBoundStore(state => state.setEditorPanelSize)
const useSetPreviewPanelSize = () => useBoundStore(state => state.setPreviewPanelSize)

export function AppLayout() {
  const panelLayout = usePanelLayout()
  const sidebarVisible = useSidebarVisible()
  const previewVisible = usePreviewVisible()
  const editorOnLeft = useEditorOnLeft()
  const editorPanelSize = useEditorPanelSize()
  const previewPanelSize = usePreviewPanelSize()
  const focusMode = useFocusMode()
  const setPanelLayout = useSetPanelLayout()
  const setEditorPanelSize = useSetEditorPanelSize()
  const setPreviewPanelSize = useSetPreviewPanelSize()

  // Refs for imperative panel control
  const sidebarRef = useRef<ImperativePanelHandle>(null)
  const leftPanelRef = useRef<ImperativePanelHandle>(null)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  // Drag state tracking - only update store when drag ends, not during
  // This prevents React re-renders during drag for smooth performance
  const dragCountRef = useRef(0)

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
      // Save current sizes before collapsing
      const leftSize = leftPanelRef.current?.getSize()
      const rightSize = rightPanelRef.current?.getSize()
      if (leftSize && rightSize) {
        if (editorOnLeft) {
          setEditorPanelSize(leftSize)
          setPreviewPanelSize(rightSize)
        } else {
          setPreviewPanelSize(leftSize)
          setEditorPanelSize(rightSize)
        }
      }
      leftPanelRef.current?.collapse()
      rightPanelRef.current?.collapse()
    } else {
      // When expanding, use resize to restore the saved size instead of defaultSize
      // This ensures we restore the size that was active before collapse
      if (editorOnLeft) {
        leftPanelRef.current?.resize(editorPanelSize)
        rightPanelRef.current?.resize(previewPanelSize)
      } else {
        leftPanelRef.current?.resize(previewPanelSize)
        rightPanelRef.current?.resize(editorPanelSize)
      }
      leftPanelRef.current?.expand()
      rightPanelRef.current?.expand()
    }
  }, [previewVisible, showEditorOnly, editorOnLeft, editorPanelSize, previewPanelSize])

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

  // Track drag start/end for outer PanelGroup (sidebar)
  const handleSidebarDragStart = useCallback(() => {
    dragCountRef.current += 1
    document.dispatchEvent(new CustomEvent('panelresizestart'))
  }, [])

  const handleSidebarDragEnd = useCallback(() => {
    dragCountRef.current = Math.max(0, dragCountRef.current - 1)
    document.dispatchEvent(new CustomEvent('panelresizeend'))
    if (dragCountRef.current === 0) {
      // Commit final sizes to store only when drag ends
      const sidebarSize = sidebarRef.current?.getSize()
      const mainSize = leftPanelRef.current?.getSize()
      if (sidebarSize !== undefined && mainSize !== undefined && sidebarVisible && sidebarSize > 5) {
        setPanelLayout([sidebarSize, mainSize])
      }
    }
  }, [sidebarVisible, setPanelLayout])

  // Track drag start/end for inner PanelGroup (editor-preview)
  const handleEditorPreviewDragStart = useCallback(() => {
    dragCountRef.current += 1
    document.dispatchEvent(new CustomEvent('panelresizestart'))
  }, [])

  const handleEditorPreviewDragEnd = useCallback(() => {
    dragCountRef.current = Math.max(0, dragCountRef.current - 1)
    document.dispatchEvent(new CustomEvent('panelresizeend'))
    if (dragCountRef.current === 0) {
      // Trigger Monaco editor layout after drag ends
      const editorInstance = useBoundStore.getState().editorInstance
      if (editorInstance) {
        editorInstance.layout()
      }

      // Commit final sizes to store
      const leftSize = leftPanelRef.current?.getSize()
      const rightSize = rightPanelRef.current?.getSize()
      if (leftSize !== undefined && rightSize !== undefined && previewVisible && leftSize > 5 && rightSize > 5) {
        if (editorOnLeft) {
          setEditorPanelSize(leftSize)
          setPreviewPanelSize(rightSize)
        } else {
          setPreviewPanelSize(leftSize)
          setEditorPanelSize(rightSize)
        }
      }
    }
  }, [previewVisible, editorOnLeft, setEditorPanelSize, setPreviewPanelSize])

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] flex select-none">
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
          onDragStart={handleSidebarDragStart}
          onDragEnd={handleSidebarDragEnd}
          className="bg-[var(--bg-secondary)]"
        >
          <SidebarPanel />
        </Panel>

        {/* Resize Handle between Sidebar and Editor */}
        <PanelResizeHandle id="sidebar-resize" className="w-1 hover:w-2 group">
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
            className="h-full"
          >
            {/* Left Panel (Editor or Preview) */}
            <Panel
              id={leftPanelId}
              ref={leftPanelRef}
              defaultSize={leftPanelSize}
              minSize={leftPanelMinSize}
              maxSize={leftPanelMaxSize}
              collapsible
              onDragStart={handleEditorPreviewDragStart}
              onDragEnd={handleEditorPreviewDragEnd}
              className={leftPanelId === 'editor' ? 'bg-[var(--bg-primary)]' : 'bg-[var(--bg-secondary)]'}
            >
              {leftPanel}
            </Panel>

            {/* Resize Handle between Editor and Preview */}
            <PanelResizeHandle id="preview-resize" className="w-1 hover:w-2 group">
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
