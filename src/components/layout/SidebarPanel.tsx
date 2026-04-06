import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { FileExplorer } from '../sidebar/FileExplorer'
import { OutlineView } from '../sidebar/OutlineView'
import { SearchPanel } from '../sidebar/SearchPanel'
import { SettingsPanel } from '../sidebar/SettingsPanel'

export function SidebarPanel() {
  const { activeSidebarTab } = useBoundStore()
  const { t } = useTranslation()

  if (!t) return null

  const tabs = [
    { id: 'files' as const, label: t.sidebar.files },
    { id: 'search' as const, label: t.sidebar.search },
    { id: 'outline' as const, label: t.sidebar.outline },
    { id: 'settings' as const, label: t.sidebar.settings },
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="h-9 px-4 flex items-center border-b border-[var(--border-color)]">
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {tabs.find((tab) => tab.id === activeSidebarTab)?.label}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {activeSidebarTab === 'files' && <FileExplorer />}
        {activeSidebarTab === 'search' && <SearchPanel />}
        {activeSidebarTab === 'outline' && <OutlineView />}
        {activeSidebarTab === 'settings' && <SettingsPanel />}
      </div>
    </div>
  )
}
