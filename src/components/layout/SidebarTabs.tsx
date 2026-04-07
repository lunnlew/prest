import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { clsx } from 'clsx'

export function SidebarTabs() {
  const { activeSidebarTab, setActiveSidebarTab, toggleSidebar, sidebarVisible } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  const tabs = [
    { id: 'files' as const, icon: '📁', label: t.sidebar.files },
    { id: 'search' as const, icon: '🔍', label: t.sidebar.search },
    { id: 'outline' as const, icon: '📋', label: t.sidebar.outline },
    { id: 'settings' as const, icon: '⚙️', label: t.sidebar.settings },
  ]

  return (
    <div className="w-12 flex flex-col items-center py-2 bg-[var(--bg-tertiary)] border-r border-[var(--border-color)]">
      <button
        onClick={toggleSidebar}
        title={sidebarVisible ? t.editor.collapseSidebar : t.editor.expandSidebar}
        className="w-10 h-10 flex items-center justify-center rounded-md mb-1 transition-colors hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M9 3v18" />
        </svg>
      </button>
      <div className="w-6 h-px bg-[var(--border-color)] my-1" />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            if (activeSidebarTab === tab.id) {
              // Clicking active tab toggles sidebar visibility
              toggleSidebar()
            } else {
              // Clicking different tab - show sidebar and switch tab
              setActiveSidebarTab(tab.id)
              if (!sidebarVisible) toggleSidebar()
            }
          }}
          className={clsx(
            'w-10 h-10 flex items-center justify-center rounded-md mb-1 transition-colors',
            activeSidebarTab === tab.id
              ? 'bg-[var(--accent-color)] text-white'
              : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
          )}
          title={tab.label}
        >
          <span className="text-lg">{tab.icon}</span>
        </button>
      ))}
    </div>
  )
}
