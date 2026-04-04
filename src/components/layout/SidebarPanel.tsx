import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { FileExplorer } from '../sidebar/FileExplorer'
import { OutlineView } from '../sidebar/OutlineView'
import { SearchPanel } from '../sidebar/SearchPanel'
import { SettingsPanel } from '../sidebar/SettingsPanel'
import { clsx } from 'clsx'

export function SidebarPanel() {
  const { activeSidebarTab, setActiveSidebarTab } = useBoundStore()
  const { t, loading } = useTranslation()

  const isLoading = loading || !t

  const tabs = [
    { id: 'files' as const, icon: '📁', label: isLoading ? 'Files' : t.sidebar.files },
    { id: 'search' as const, icon: '🔍', label: isLoading ? 'Search' : t.sidebar.search },
    { id: 'outline' as const, icon: '📋', label: isLoading ? 'Outline' : t.sidebar.outline },
    { id: 'settings' as const, icon: '⚙️', label: isLoading ? 'Settings' : t.sidebar.settings },
  ]

  return (
    <div className="flex h-full">
      {/* Activity Bar */}
      <div className="w-12 flex flex-col items-center py-2 bg-[var(--bg-tertiary)] border-r border-[var(--border-color)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSidebarTab(tab.id)}
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

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-9 px-4 flex items-center border-b border-[var(--border-color)]">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {tabs.find((tab) => tab.id === activeSidebarTab)?.label}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeSidebarTab === 'files' && <FileExplorer />}
          {activeSidebarTab === 'search' && <SearchPanel />}
          {activeSidebarTab === 'outline' && <OutlineView />}
          {activeSidebarTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </div>
  )
}