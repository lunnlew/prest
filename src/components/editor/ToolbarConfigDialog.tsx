import { useRef, useEffect, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import type { ToolbarButtonId, ToolbarGroupId, ToolbarGroupConfig, ToolbarItem } from '../../types'
import { buttonConfigs, allButtonIds } from './buttons'

// Generate unique ID for custom groups
let customGroupCounter = 0
const generateGroupId = (): ToolbarGroupId => {
  customGroupCounter++
  return `custom_${Date.now()}_${customGroupCounter}` as ToolbarGroupId
}

// Sortable Item Component
interface SortableItemProps {
  id: string
  children: React.ReactNode
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false, // 禁用布局动画，防止闪烁
  })

  const style: React.CSSProperties = {
    transform: isDragging && transform ? CSS.Translate.toString(transform) : undefined,
    transition: isDragging ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

interface ToolbarConfigDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ToolbarConfigDialog({ isOpen, onClose }: ToolbarConfigDialogProps) {
  const { settings, setToolbarGroups, setToolbarItems } = useBoundStore()
  const { t, loading } = useTranslation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [showNewGroupInput, setShowNewGroupInput] = useState(false)

  const isLoading = loading || !t

  // Get current settings directly from store (real-time)
  const currentGroups = settings?.toolbar?.groups ?? []
  const currentItems = settings?.toolbar?.items ?? []

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle escape key to close
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Get group label
  const getGroupLabel = (groupId: ToolbarGroupId): string => {
    if (isLoading) return groupId
    // First try translation (for built-in groups)
    const translated = t.toolbar[groupId as keyof typeof t.toolbar]
    // Fall back to custom group label
    if (translated) return translated
    const group = currentGroups.find(g => g.id === groupId)
    if (group?.label) return group.label
    return groupId
  }

  // Get button display name
  const getButtonDisplayName = (buttonId: ToolbarButtonId): string => {
    const config = buttonConfigs[buttonId]
    if (!config || isLoading) return buttonId
    return config.getDisplayName(t)
  }

  // Toggle group expanded (real-time)
  const toggleGroupExpanded = (groupId: ToolbarGroupId) => {
    const newGroups = currentGroups.map(g =>
      g.id === groupId ? { ...g, expanded: !g.expanded } : g
    )
    setToolbarGroups(newGroups)
  }

  // Toggle group visibility (real-time)
  const toggleGroupVisibility = (groupId: ToolbarGroupId) => {
    const newGroups = currentGroups.map(g =>
      g.id === groupId ? { ...g, visible: !g.visible } : g
    )
    setToolbarGroups(newGroups)
  }

  // Delete group
  const deleteGroup = (groupId: ToolbarGroupId) => {
    // Remove group from groups list
    setToolbarGroups(currentGroups.filter(g => g.id !== groupId))
    // Remove group from items list
    setToolbarItems(currentItems.filter(item => !(item.type === 'group' && item.id === groupId)))
  }

  // Add new group
  const addNewGroup = () => {
    if (!newGroupName.trim()) return
    const newGroup: ToolbarGroupConfig = {
      id: generateGroupId(),
      label: newGroupName.trim(),
      expanded: true,
      visible: true,
      buttons: [],
    }
    setToolbarGroups([...currentGroups, newGroup])
    // Add group to items at the end
    setToolbarItems([...currentItems, { type: 'group', id: newGroup.id }])
    setNewGroupName('')
    setShowNewGroupInput(false)
  }

  // Toggle button in group (real-time) - button can only be in one group
  const toggleButtonInGroup = (groupId: ToolbarGroupId, buttonId: ToolbarButtonId) => {
    const newGroups = currentGroups.map(g => {
      if (g.id === groupId) {
        // Toggle in this group
        const buttons = g.buttons.includes(buttonId)
          ? g.buttons.filter(id => id !== buttonId)
          : [...g.buttons, buttonId]
        return { ...g, buttons }
      } else {
        // Remove from other groups if it exists there
        const buttons = g.buttons.filter(id => id !== buttonId)
        return { ...g, buttons }
      }
    })
    setToolbarGroups(newGroups)
  }

  // Handle group drag end
  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = currentGroups.findIndex(g => g.id === active.id)
      const newIndex = currentGroups.findIndex(g => g.id === over.id)
      const newGroups = arrayMove(currentGroups, oldIndex, newIndex)
      setToolbarGroups(newGroups)

      // Also update items array to reflect group order change
      const groupIds = newGroups.map(g => g.id)
      const newItems = [...currentItems]
      // Find all group items and reorder them according to new group order
      const groupItems = newItems.filter(item => item.type === 'group')

      // Reorder group items based on new group order
      const reorderedGroupItems = groupIds
        .map(id => groupItems.find(item => item.id === id))
        .filter((item): item is { type: 'group'; id: ToolbarGroupId } => item !== undefined)

      // Merge: keep non-group items in place, update group items order
      // Find the position of first group item in original items
      let firstGroupIndex = newItems.findIndex(item => item.type === 'group')
      if (firstGroupIndex === -1) firstGroupIndex = newItems.length

      // Build new items array
      const result: ToolbarItem[] = []
      let groupIndex = 0
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].type !== 'group') {
          result.push(newItems[i])
        } else {
          if (groupIndex < reorderedGroupItems.length) {
            result.push(reorderedGroupItems[groupIndex])
            groupIndex++
          }
        }
      }
      // Add remaining group items if any
      while (groupIndex < reorderedGroupItems.length) {
        result.push(reorderedGroupItems[groupIndex])
        groupIndex++
      }

      setToolbarItems(result)
    }
  }

  // Handle group buttons drag end
  const handleGroupButtonsDragEnd = (groupId: ToolbarGroupId) => (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const group = currentGroups.find(g => g.id === groupId)
      if (!group) return
      const oldIndex = group.buttons.indexOf(active.id as ToolbarButtonId)
      const newIndex = group.buttons.indexOf(over.id as ToolbarButtonId)
      const newButtons = arrayMove(group.buttons, oldIndex, newIndex)
      const newGroups = currentGroups.map(g =>
        g.id === groupId ? { ...g, buttons: newButtons } : g
      )
      setToolbarGroups(newGroups)
    }
  }

  // Get display item ID for sortable - stable ID without index
  const getDisplayItemId = (item: { type: 'button' | 'group'; id: ToolbarButtonId | ToolbarGroupId }): string => {
    return `${item.type}-${item.id}`
  }

  // Handle unified toolbar items drag end
  const handleItemsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = displayItems.findIndex((item) => getDisplayItemId(item) === active.id)
      const newIndex = displayItems.findIndex((item) => getDisplayItemId(item) === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const oldDisplayItem = displayItems[oldIndex]
        const newDisplayItem = displayItems[newIndex]

        // Find the corresponding indices in currentItems
        const oldItemIndex = currentItems.findIndex(item =>
          item.type === oldDisplayItem.type && item.id === oldDisplayItem.id
        )
        const newItemIndex = currentItems.findIndex(item =>
          item.type === newDisplayItem.type && item.id === newDisplayItem.id
        )

        if (oldItemIndex !== -1 && newItemIndex !== -1) {
          const newItems = arrayMove(currentItems, oldItemIndex, newItemIndex)
          setToolbarItems(newItems)
        }
      }
    }
  }

  // Add button to toolbar items
  const addButtonItem = (buttonId: ToolbarButtonId) => {
    // Check if already in items
    const exists = currentItems.some(item => item.type === 'button' && item.id === buttonId)
    if (!exists) {
      setToolbarItems([...currentItems, { type: 'button', id: buttonId }])
    }
  }

  // Remove button from toolbar items
  const removeButtonItem = (buttonId: ToolbarButtonId) => {
    setToolbarItems(currentItems.filter(item => !(item.type === 'button' && item.id === buttonId)))
  }

  // Reset to defaults
  const handleReset = () => {
    const defaultGroups: ToolbarGroupConfig[] = [
      { id: 'headings', label: 'Headings', expanded: true, visible: true, buttons: ['heading1', 'heading2', 'heading3'] },
      { id: 'textFormatting', label: 'Text', expanded: true, visible: true, buttons: ['bold', 'italic', 'strikethrough', 'highlight'] },
      { id: 'codeLinks', label: 'Code & Links', expanded: false, visible: true, buttons: ['code', 'link', 'image'] },
      { id: 'lists', label: 'Lists', expanded: false, visible: true, buttons: ['bulletList', 'orderedList', 'taskList'] },
      { id: 'blocks', label: 'Blocks', expanded: false, visible: true, buttons: ['quote', 'table', 'hr'] },
      { id: 'alignment', label: 'Alignment', expanded: false, visible: true, buttons: ['alignLeft', 'alignCenter', 'alignRight'] },
    ]
    const defaultItems: ToolbarItem[] = [
      { type: 'button', id: 'bold' },
      { type: 'button', id: 'italic' },
      { type: 'button', id: 'bulletList' },
      { type: 'button', id: 'orderedList' },
      { type: 'button', id: 'link' },
      { type: 'group', id: 'headings' },
      { type: 'group', id: 'textFormatting' },
      { type: 'group', id: 'codeLinks' },
      { type: 'group', id: 'lists' },
      { type: 'group', id: 'blocks' },
      { type: 'group', id: 'alignment' },
    ]
    setToolbarGroups(defaultGroups)
    setToolbarItems(defaultItems)
  }

  if (!isOpen || !t) return null

  // Get all buttons that are in items (for showing active state in toggle area)
  const buttonsInItems = new Set(
    currentItems
      .filter(item => item.type === 'button')
      .map(item => item.id)
  )

  // Get buttons that belong to visible groups
  const visibleGroupButtons = new Set(
    currentGroups.filter(g => g.visible).flatMap(g => g.buttons)
  )

  // Build display items: consistent with toolbar rendering
  const displayItems: Array<{ type: 'button' | 'group'; id: ToolbarButtonId | ToolbarGroupId }> = []
  currentItems.forEach(item => {
    if (item.type === 'button') {
      // Skip if this button belongs to a visible group (it will be in the group's dropdown)
      if (visibleGroupButtons.has(item.id)) return
      displayItems.push(item)
    } else if (item.type === 'group') {
      const group = currentGroups.find(g => g.id === item.id)
      if (group && group.visible) {
        // Visible group: show as group
        displayItems.push(item)
      }
      // Hidden groups are not shown, their buttons are shown if in items
    }
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div
        ref={dialogRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl w-[1200px] min-h-[65vh] max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {t.toolbar.customize}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content - Responsive grid layout */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column - Toolbar Items (unified buttons + groups) */}
            <div>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-color)]">
                {t.settings.toolbarOrder}
              </h3>

              {/* All buttons selection */}
              <div className="mb-4">
                <div className="text-xs text-[var(--text-muted)] mb-2">
                  {t.toolbar.clickToToggle}
                </div>
                <div className="flex flex-wrap gap-1">
                  {allButtonIds.map(buttonId => {
                    const config = buttonConfigs[buttonId]
                    if (!config) return null
                    const isActive = buttonsInItems.has(buttonId)

                    return (
                      <button
                        key={buttonId}
                        onClick={() => isActive ? removeButtonItem(buttonId) : addButtonItem(buttonId)}
                        className={`px-2 py-1.5 text-xs rounded transition-colors flex items-center gap-1 ${isActive
                          ? 'bg-[var(--accent-color)] text-white'
                          : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)]'
                          }`}
                        title={getButtonDisplayName(buttonId)}
                      >
                        {config.icon}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Unified toolbar items order with drag and drop */}
              {displayItems.length > 0 && (
                <div>
                  <div className="text-xs text-[var(--text-muted)] mb-2">
                    {t.toolbar.orderReorder}
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleItemsDragEnd}
                  >
                    <SortableContext
                      items={displayItems.map((item) => getDisplayItemId(item))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {displayItems.map((item, index) => {
                          const itemId = getDisplayItemId(item)
                          return (
                            <SortableItem key={itemId} id={itemId}>
                              <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-tertiary)] rounded hover:bg-[var(--border-color)] transition-colors cursor-grab active:cursor-grabbing">
                                <div className="flex items-center gap-3">
                                  <span className="text-[var(--text-muted)] cursor-grab">⋮⋮</span>
                                  <span className="w-5 h-5 flex items-center justify-center text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded">
                                    {index + 1}
                                  </span>
                                  {item.type === 'button' ? (
                                    <>
                                      <span className="w-6 flex justify-center">{buttonConfigs[item.id as ToolbarButtonId]?.icon}</span>
                                      <span className="text-sm text-[var(--text-primary)]">
                                        {getButtonDisplayName(item.id as ToolbarButtonId)}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm">📋</span>
                                      <span className="text-sm text-[var(--text-primary)]">
                                        {getGroupLabel(item.id as ToolbarGroupId)}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (item.type === 'button') {
                                      removeButtonItem(item.id as ToolbarButtonId)
                                    } else {
                                      deleteGroup(item.id as ToolbarGroupId)
                                    }
                                  }}
                                  className="px-2 py-1 text-xs rounded hover:bg-[var(--bg-secondary)] text-red-500 transition-colors"
                                >
                                  ✕
                                </button>
                              </div>
                            </SortableItem>
                          )
                        })}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>

            {/* Right column - Groups configuration */}
            <div>
              {/* New group input */}
              {showNewGroupInput && (
                <div className="mb-3 p-3 border border-[var(--border-color)] rounded-lg bg-[var(--bg-tertiary)]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder={t.toolbar.groupName}
                      className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addNewGroup()
                        if (e.key === 'Escape') {
                          setShowNewGroupInput(false)
                          setNewGroupName('')
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={addNewGroup}
                      disabled={!newGroupName.trim()}
                      className="px-3 py-1.5 text-sm rounded bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t.common.save}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewGroupInput(false)
                        setNewGroupName('')
                      }}
                      className="px-3 py-1.5 text-sm rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-muted)] transition-colors"
                    >
                      {t.common.cancel}
                    </button>
                  </div>
                </div>
              )}

              {/* Groups header with add button */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">
                  {t.settings.toolbarGroups}
                </h3>
                <button
                  onClick={() => setShowNewGroupInput(!showNewGroupInput)}
                  className="px-2 py-1 text-xs rounded bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white transition-colors"
                >
                  + {t.toolbar.addGroup}
                </button>
              </div>

              {/* Groups list with drag and drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleGroupDragEnd}
              >
                <SortableContext
                  items={currentGroups.map(g => g.id)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-1 gap-3">
                    {currentGroups.map((group) => (
                      <SortableItem key={group.id} id={group.id}>
                        <div
                          className={`border border-[var(--border-color)] rounded-lg p-3 cursor-grab active:cursor-grabbing ${group.visible ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--bg-secondary)] opacity-50'
                            }`}
                        >
                          {/* Group header */}
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onDoubleClick={(e) => {
                                e.stopPropagation()
                                toggleGroupExpanded(group.id)
                              }}
                            >
                              <span className="text-[var(--text-muted)]">
                                {group.expanded ? '▼' : '▶'}
                              </span>
                              <span className="text-sm font-medium text-[var(--text-primary)] cursor-grab">
                                ⋮⋮ {getGroupLabel(group.id)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleGroupVisibility(group.id)
                                }}
                                className={`px-3 py-1 text-xs rounded transition-colors ${group.visible
                                  ? 'bg-[var(--accent-color)] text-white'
                                  : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:bg-[var(--border-color)]'
                                  }`}
                              >
                                {group.visible ? t.settings.visible : t.toolbar.hide}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteGroup(group.id)
                                }}
                                className="p-1 rounded hover:bg-red-500/20 text-red-500 transition-colors"
                                title={t.toolbar.deleteGroup}
                              >
                                🗑
                              </button>
                            </div>
                          </div>

                          {/* Buttons in group with drag and drop */}
                          {group.expanded && (
                            <div className="mt-2 pt-2 border-t border-[var(--border-color)]" onClick={(e) => e.stopPropagation()}>
                              {group.buttons.length > 0 && (
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={handleGroupButtonsDragEnd(group.id)}
                                >
                                  <SortableContext
                                    items={group.buttons}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    <div className="mb-2 space-y-1">
                                      {group.buttons.map((buttonId, btnIndex) => {
                                        const config = buttonConfigs[buttonId]
                                        if (!config) return null
                                        return (
                                          <SortableItem key={buttonId} id={buttonId}>
                                            <div className="flex items-center justify-between px-2 py-1.5 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] transition-colors cursor-grab active:cursor-grabbing">
                                              <div className="flex items-center gap-2">
                                                <span className="text-[var(--text-muted)] cursor-grab">⋮⋮</span>
                                                <span className="w-4 text-xs text-[var(--text-muted)]">{btnIndex + 1}</span>
                                                <span className="w-5 flex justify-center">{config.icon}</span>
                                                <span className="text-xs text-[var(--text-primary)]">{getButtonDisplayName(buttonId)}</span>
                                              </div>
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  toggleButtonInGroup(group.id, buttonId)
                                                }}
                                                className="px-1.5 py-0.5 text-xs rounded hover:bg-[var(--bg-tertiary)] text-red-500"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          </SortableItem>
                                        )
                                      })}
                                    </div>
                                  </SortableContext>
                                </DndContext>
                              )}

                              {/* Add buttons - only show buttons not in any group */}
                              {(() => {
                                const allUsedButtons = new Set(currentGroups.flatMap(g => g.buttons))
                                const availableButtons = allButtonIds.filter(id => !allUsedButtons.has(id))
                                return availableButtons.length > 0 ? (
                                  <div>
                                    <div className="text-xs text-[var(--text-muted)] mb-1">
                                      {t.toolbar.addButton}:
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {availableButtons.map(buttonId => {
                                        const config = buttonConfigs[buttonId]
                                        if (!config) return null
                                        return (
                                          <button
                                            key={buttonId}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              toggleButtonInGroup(group.id, buttonId)
                                            }}
                                            className="px-1.5 py-0.5 text-xs rounded transition-colors bg-transparent hover:bg-[var(--border-color)] text-[var(--text-muted)] border border-dashed border-[var(--border-color)]"
                                            title={getButtonDisplayName(buttonId)}
                                          >
                                            + {config.icon}
                                          </button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                ) : null
                              })()}
                            </div>
                          )}
                        </div>
                      </SortableItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {currentGroups.length === 0 && (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                  {t.toolbar.noGroups}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-[var(--border-color)] bg-[var(--bg-tertiary)]">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-muted)] transition-colors"
          >
            {t.toolbar.resetDefault}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white transition-colors"
          >
            {t.toolbar.close}
          </button>
        </div>
      </div>
    </div>
  )
}