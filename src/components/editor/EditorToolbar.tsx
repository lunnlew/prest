import { useState, useRef, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import type { FormatType } from '../../stores'
import type { ToolbarGroupId } from '../../types'
import { ToolbarConfigDialog } from './ToolbarConfigDialog'
import { defaultToolbarGroups, defaultToolbarItems } from '../../stores/settingsSlice'
import { buttonConfigs } from './buttons'

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
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
    <div className="relative" ref={menuRef}>
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
  return (
    <button
      onClick={onClick}
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

// Group ID to label mapping for fallback
const groupLabels: Record<ToolbarGroupId, string> = {
  headings: '标题',
  textFormatting: '文本',
  codeLinks: '代码/链接',
  lists: '列表',
  blocks: '区块',
  alignment: '对齐',
  tools: '工具',
}

export function EditorToolbar() {
  const {
    toggleSidebar,
    togglePreview,
    previewVisible,
    formatMarkdown,
    undo,
    redo,
    settings,
  } = useBoundStore()
  const { t, loading } = useTranslation()

  const [openDropdown, setOpenDropdown] = useState<ToolbarGroupId | null>(null)
  const [showConfigPanel, setShowConfigPanel] = useState(false)

  const isLoading = loading || !t

  // Get group label
  const getGroupLabel = (groupId: ToolbarGroupId, groupLabel?: string): string => {
    if (isLoading) {
      return groupLabels[groupId] || groupId
    }
    return t.toolbar[groupId as keyof typeof t.toolbar] || groupLabel || groupId
  }

  const handleFormat = (type: FormatType) => {
    formatMarkdown(type)
    setOpenDropdown(null)
  }

  const handleDropdownToggle = (groupId: ToolbarGroupId) => {
    setOpenDropdown(openDropdown === groupId ? null : groupId)
  }

  const handleDropdownClose = () => {
    setOpenDropdown(null)
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
        if (!config || !config.format) return null
        return (
          <ToolbarButton
            key={`button-${item.id}`}
            onClick={() => handleFormat(config.format!)}
            title={isLoading ? item.id : config.getTitle(t)}
          >
            {config.icon}
          </ToolbarButton>
        )
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
              if (!config || !config.format) return null
              return (
                <DropdownItem
                  key={buttonId}
                  onClick={() => handleFormat(config.format!)}
                  icon={config.icon}
                  displayName={isLoading ? buttonId : config.getDisplayName(t)}
                />
              )
            })}
          </DropdownMenu>
        )
      }
      return null
    })
  }

  return (
    <div className="h-auto min-h-10 px-2 flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-secondary)] gap-1 py-1">
      {/* Row 1: Fixed left + right */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 shrink-0">
          <ToolbarButton
            onClick={toggleSidebar}
            title={isLoading ? 'Toggle Sidebar' : t.editor.toggleSidebar}
          >
            <span className="text-base">☰</span>
          </ToolbarButton>
          <div className="w-px h-4 bg-[var(--border-color)] mx-1" />
          <ToolbarButton
            onClick={undo}
            title={isLoading ? 'Undo' : t.editor.undo}
          >
            <span className="text-base">↶</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={redo}
            title={isLoading ? 'Redo' : t.editor.redo}
          >
            <span className="text-base">↷</span>
          </ToolbarButton>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ToolbarButton
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            title={isLoading ? '配置工具栏' : t.toolbar.customize}
          >
            <span className={showConfigPanel ? 'text-[var(--accent-color)]' : ''}>⚙</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={togglePreview}
            title={isLoading ? 'Toggle Preview' : t.editor.togglePreview}
          >
            <span className={previewVisible ? 'text-[var(--accent-color)]' : ''}>👁</span>
          </ToolbarButton>
        </div>
      </div>

      {/* Row 2: Formatting buttons with wrap */}
      <div className="flex items-center gap-1 flex-wrap">
        {renderToolbarItems()}
      </div>

      {/* Config Dialog */}
      <ToolbarConfigDialog
        isOpen={showConfigPanel}
        onClose={() => setShowConfigPanel(false)}
      />
    </div>
  )
}