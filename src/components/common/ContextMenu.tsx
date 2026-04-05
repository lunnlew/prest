import { useState, useCallback, useEffect, useRef } from 'react'
import { clsx } from 'clsx'

export interface ContextMenuItem {
  label: string
  action: () => void
  danger?: boolean
  hidden?: boolean
  dividerBefore?: boolean
}

interface ContextMenuState {
  x: number
  y: number
}

/** Hook: manage context menu state with correct close-on-outside-click logic */
export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState & { items: ContextMenuItem[] } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null!)

  const showContextMenu = useCallback((x: number, y: number, items: ContextMenuItem[]) => {
    setMenu({ x, y, items })
  }, [])

  // Capture-phase: this runs BEFORE any onClick handler.
  // If click is inside the menu, do NOTHING — let the item's onClick fire.
  // If click is outside, close the menu.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menu) return
      if (menuRef.current && menuRef.current.contains(e.target as Node)) {
        return // inside menu — don't close, let the button onClick handle it
      }
      setMenu(null) // outside — close
    }
    document.addEventListener('click', handler, true)
    return () => document.removeEventListener('click', handler, true)
  }, [menu])

  return { menu, menuRef, showContextMenu }
}

/** Shared context menu popover — must receive menuRef from useContextMenu() */
export function ContextMenuPopover({
  menu,
  menuRef,
  onClose,
}: {
  menu: ContextMenuState & { items: ContextMenuItem[] } | null
  menuRef: React.RefObject<HTMLDivElement>
  onClose: () => void
}) {
  if (!menu) return null

  const visibleItems = menu.items.filter((item) => !item.hidden)
  if (visibleItems.length === 0) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded shadow-lg py-1 min-w-[140px]"
      style={{ top: menu.y, left: menu.x }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {visibleItems.map((item, i) => (
        <div key={i}>
          {item.dividerBefore && (
            <hr className="border-[var(--border-color)] my-1" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              item.action()
              onClose()
            }}
            className={clsx(
              'w-full px-3 py-1.5 text-sm text-left hover:bg-[var(--bg-tertiary)]',
              item.danger
                ? 'text-red-500 hover:bg-red-500/20'
                : 'text-[var(--text-primary)]'
            )}
          >
            {item.label}
          </button>
        </div>
      ))}
    </div>
  )
}

/** Wraps children with an onContextMenu handler that shows a context menu */
export function ContextMenuProvider({
  items,
  children,
  className,
}: {
  items: ContextMenuItem[] | (() => ContextMenuItem[])
  children: React.ReactNode
  className?: string
}) {
  const { menu, menuRef, showContextMenu } = useContextMenu()

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const resolved = typeof items === 'function' ? items() : items
      if (!resolved || resolved.length === 0) return
      e.preventDefault()
      e.stopPropagation()
      showContextMenu(e.clientX, e.clientY, resolved)
    },
    [items, showContextMenu],
  )

  const closeContextMenu = useCallback(() => {
    showContextMenu(0, 0, [])
  }, [])

  return (
    <div className={clsx('relative', className)} onContextMenu={handleContextMenu}>
      {children}
      <ContextMenuPopover menu={menu} menuRef={menuRef} onClose={closeContextMenu} />
    </div>
  )
}
