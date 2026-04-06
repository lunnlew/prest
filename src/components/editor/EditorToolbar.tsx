import { useState, useRef, useEffect } from 'react'
import { useBoundStore, type AppStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import type { FormatType } from '../../stores'
import type { ToolbarGroupId, ToolbarButtonId } from '../../types'
import { ToolbarConfigDialog } from './ToolbarConfigDialog'
import { XHSExportDialog } from './XHSExportDialog'
import { CodeBlockDialog } from './CodeBlockDialog'
import { EmojiPicker } from './EmojiPicker'
import { ColorPicker } from './ColorPicker'
import { defaultToolbarGroups, defaultToolbarItems } from '../../stores/settingsSlice'
import { buttonConfigs } from './buttons'
import { importFile } from '../../utils/importFile'
import { exportHtml, exportPdf } from '../../utils/export'
import { copyWechat, copyWeibo } from '../../utils/clipboard'

interface ToolbarButtonProps {
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-sm rounded transition-colors hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
      title={title}
    >
      {children}
    </button>
  )
}

interface DropdownMenuProps {
  label: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
}

function DropdownMenu({ label, icon, isOpen, onToggle, onClose, children }: DropdownMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      // Check if click is on a dropdown item (has data-dropdown-item attribute)
      const isDropdownItem = target.closest?.('[data-dropdown-item]')
      if (isDropdownItem) {
        return // Don't close if clicking on dropdown item
      }
      // Check if click is outside the button
      const isOutsideButton = !buttonRef.current?.contains(target)
      if (isOutsideButton) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: buttonRect.bottom + 4,
        left: buttonRect.left,
      })
    } else if (!isOpen) {
      setMenuPosition(null)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={`px-2 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
          isOpen
            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
            : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
        }`}
        title={label}
      >
        {icon}
        <span className="text-xs">▾</span>
      </button>
      {isOpen && menuPosition && (
        <div
          className="fixed py-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-lg z-[100] min-w-[140px]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {children}
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  onClick: () => void
  icon: React.ReactNode
  displayName: string
  shortcut?: string
}

function DropdownItem({ onClick, icon, displayName, shortcut }: DropdownItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClick()
  }
  return (
    <button
      onClick={handleClick}
      data-dropdown-item="true"
      className="w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-tertiary)] flex items-center justify-between gap-2 text-[var(--text-primary)]"
    >
      <span className="flex items-center gap-2">
        <span className="w-5 flex justify-center">{icon}</span>
        <span>{displayName}</span>
      </span>
      {shortcut && (
        <span className="text-xs text-[var(--text-muted)]">{shortcut}</span>
      )}
    </button>
  )
}

// Custom action handlers for buttons without format property
const buttonActionHandlers: Record<string, (store: AppStore) => void> = {
  downloadMd: (store) => store.downloadMd(),
  codeBlock: () => {
    window.dispatchEvent(new CustomEvent('open-codeblock-dialog'))
  },
  emoji: () => {
    window.dispatchEvent(new CustomEvent('open-emoji-picker'))
  },
  importFile: () => {
    importFile()
  },
  exportHtml: () => {
    exportHtml()
  },
  exportPdf: () => {
    exportPdf()
  },
  copyWechat: () => {
    copyWechat()
  },
  copyWeibo: () => {
    copyWeibo()
  },
  focusMode: () => {
    const store = useBoundStore.getState()
    store.toggleFocusMode()
  },
  typewriterMode: () => {
    const store = useBoundStore.getState()
    store.toggleTypewriterMode()
  },
  fullscreen: () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  },
}

export function EditorToolbar() {
  const {
    togglePreview,
    previewVisible,
    toggleEditorPosition,
    editorOnLeft,
    undo,
    redo,
    settings,
  } = useBoundStore()
  const { t } = useTranslation()

  const [openDropdown, setOpenDropdown] = useState<ToolbarGroupId | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [showXHSDialog, setShowXHSDialog] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPickerType, setColorPickerType] = useState<'color' | 'background'>('color')

  if (!t) return null

  // Get group label
  const getGroupLabel = (groupId: ToolbarGroupId, groupLabel?: string): string => {
    return t.toolbar[groupId as keyof typeof t.toolbar] || groupLabel || groupId
  }

  const handleFormat = (type: FormatType) => {
    const store = useBoundStore.getState()
    if (typeof store.formatMarkdown === 'function') {
      store.formatMarkdown(type)
    }
    setOpenDropdown(null)
  }

  const handleFormatWithButtonId = (buttonId: string) => {
    const config = buttonConfigs[buttonId as ToolbarButtonId]
    if (config && config.format) {
      handleFormat(config.format)
    }
  }

  const handleDropdownToggle = (groupId: ToolbarGroupId) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId)
  }

  const handleDropdownClose = () => {
    setOpenDropdown(null)
  }

  const handleCustomAction = (buttonId: string) => {
    const store = useBoundStore.getState()
    buttonActionHandlers[buttonId]?.(store)
  }

  // Fallback to defaults if toolbar settings not available
  const toolbarGroups = settings?.toolbar?.groups ?? defaultToolbarGroups
  const toolbarItems = settings?.toolbar?.items ?? defaultToolbarItems

  // Get all buttons that belong to visible groups (to avoid duplication)
  const visibleGroupButtons = new Set(
    toolbarGroups.filter(g => g.visible).flatMap(g => g.buttons)
  )

  // Render toolbar based on unified items array
  const renderToolbarItems = () => {
    return toolbarItems.map((item) => {
      if (item.type === 'button') {
        // Skip if this button belongs to a visible group (avoid duplication)
        if (visibleGroupButtons.has(item.id)) return null

        // Render button directly
        const config = buttonConfigs[item.id]
        if (!config) return null

        // Button with format action
        if (config.format) {
          return (
            <ToolbarButton
              key={`button-${item.id}`}
              onClick={() => handleFormat(config.format!)}
              title={config.getTitle(t)}
            >
              {config.icon}
            </ToolbarButton>
          )
        }

        // Button with custom action
        if (buttonActionHandlers[item.id]) {
          return (
            <ToolbarButton
              key={`button-${item.id}`}
              onClick={() => handleCustomAction(item.id)}
              title={config.getTitle(t)}
            >
              {config.icon}
            </ToolbarButton>
          )
        }

        return null
      } else if (item.type === 'group') {
        // Find the group config
        const group = toolbarGroups.find((g) => g.id === item.id)
        if (!group || !group.visible) return null

        // Visible group: render as dropdown menu
        return (
          <DropdownMenu
            key={`group-${group.id}`}
            label={getGroupLabel(group.id, group.label)}
            icon={<span className="text-sm">{getGroupLabel(group.id, group.label).charAt(0)}</span>}
            isOpen={openDropdown === group.id}
            onToggle={() => handleDropdownToggle(group.id)}
            onClose={handleDropdownClose}
          >
            {group.buttons.map((buttonId) => {
              const config = buttonConfigs[buttonId]
              if (!config) return null

              // Special handling for color pickers
              if (buttonId === 'fontColor') {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => {
                      setColorPickerType('color')
                      setShowColorPicker(true)
                      setOpenDropdown(null)
                    }}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }
              if (buttonId === 'fontBackground') {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => {
                      setColorPickerType('background')
                      setShowColorPicker(true)
                      setOpenDropdown(null)
                    }}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }

              // Special handling for view mode buttons (these use custom actions, not format)
              if (buttonId === 'focusMode' || buttonId === 'typewriterMode' || buttonId === 'fullscreen') {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => {
                      handleCustomAction(buttonId)
                      setOpenDropdown(null)
                    }}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }

              // Special handling for copy buttons (these use custom actions, not format)
              if (buttonId === 'copyWechat' || buttonId === 'copyWeibo') {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => {
                      handleCustomAction(buttonId)
                      setOpenDropdown(null)
                    }}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }

              // Custom action handlers take priority (e.g., codeBlock needs dialog)
              if (buttonActionHandlers[buttonId]) {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => handleCustomAction(buttonId)}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }

              // Format buttons
              if (config.format) {
                return (
                  <DropdownItem
                    key={buttonId}
                    onClick={() => handleFormatWithButtonId(buttonId)}
                    icon={config.icon}
                    displayName={config.getDisplayName(t)}
                  />
                )
              }

              return null
            })}
          </DropdownMenu>
        )
      }
      return null
    })
  }

  return (
    <div className="h-auto min-h-10 px-2 flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-secondary)] gap-1 py-1">
      <div className="flex items-center justify-between shrink-0">
        {/* Left side: Undo/Redo or Swap+Undo/Redo */}
        <div className="flex items-center gap-1 shrink-0">
          {!editorOnLeft && (
            <ToolbarButton
              onClick={toggleEditorPosition}
              title={t.editor.swapToRight}
            >
              <span className="text-[var(--text-secondary)]">⇄</span>
            </ToolbarButton>
          )}
          <ToolbarButton
            onClick={undo}
            title={t.editor.undo}
          >
            <span className="text-base">↶</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={redo}
            title={t.editor.redo}
          >
            <span className="text-base">↷</span>
          </ToolbarButton>
        </div>

        {/* Right side: XHS, Config, Preview, Swap (if editor on left) */}
        <div className="flex items-center gap-1 shrink-0">
          <ToolbarButton
            onClick={() => setShowXHSDialog(true)}
            title="小红书出图"
          >
            <span>📕</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            title={t.toolbar.customize}
          >
            <span className={showConfigPanel ? 'text-[var(--accent-color)]' : ''}>⚙</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={togglePreview}
            title={t.editor.togglePreview}
          >
            <span className={previewVisible ? 'text-[var(--accent-color)]' : ''}>👁</span>
          </ToolbarButton>
          {editorOnLeft && (
            <ToolbarButton
              onClick={toggleEditorPosition}
              title={t.editor.swapToLeft}
            >
              <span className="text-[var(--text-secondary)]">⇄</span>
            </ToolbarButton>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {renderToolbarItems()}
      </div>

      <ToolbarConfigDialog
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
      />

      <XHSExportDialog
        isOpen={showXHSDialog}
        onClose={() => setShowXHSDialog(false)}
      />

      <CodeBlockDialog />

      <EmojiPicker />

      <ColorPicker
        type={colorPickerType}
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
      />
    </div>
  )
}
