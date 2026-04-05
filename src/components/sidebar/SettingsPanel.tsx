import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { availableLocales } from '../../locales'

export function SettingsPanel() {
  const {
    settings,
    updateEditorSettings,
    toggleTheme,
    setSyncScroll,
    setAutoSave,
  } = useBoundStore()
  const { t, locale, setLocale: changeLocale } = useTranslation()

  if (!t) return null

  return (
    <div className="py-4 overflow-y-auto h-full">
      <div className="px-4 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">
        {t.settings.title}
      </div>

      {/* Language */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.language}</span>
          <select
            value={locale}
            onChange={(e) => changeLocale(e.target.value as 'en' | 'zh-CN')}
            className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            {availableLocales.map((loc) => (
              <option key={loc.code} value={loc.code}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Theme */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.theme}</span>
          <button
            onClick={toggleTheme}
            className="px-3 py-1 text-sm bg-[var(--bg-tertiary)] rounded hover:bg-[var(--border-color)] transition-colors"
          >
            {settings.theme === 'dark' ? `🌙 ${t.settings.darkTheme}` : `☀️ ${t.settings.lightTheme}`}
          </button>
        </div>
      </div>

      {/* Font Size */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.fontSize}</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="24"
              value={settings.editor.fontSize}
              onChange={(e) => updateEditorSettings({ fontSize: Number(e.target.value) })}
              className="w-24"
            />
            <span className="text-sm text-[var(--text-muted)] w-8">{settings.editor.fontSize}px</span>
          </div>
        </div>
      </div>

      {/* Line Height */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.lineHeight}</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="16"
              max="32"
              value={settings.editor.lineHeight}
              onChange={(e) => updateEditorSettings({ lineHeight: Number(e.target.value) })}
              className="w-24"
            />
            <span className="text-sm text-[var(--text-muted)] w-8">{settings.editor.lineHeight}px</span>
          </div>
        </div>
      </div>

      {/* Word Wrap */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.wordWrap}</span>
          <button
            onClick={() => updateEditorSettings({ wordWrap: !settings.editor.wordWrap })}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              settings.editor.wordWrap
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {settings.editor.wordWrap ? t.settings.on : t.settings.off}
          </button>
        </div>
      </div>

      {/* Sync Scroll */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.syncScroll}</span>
          <button
            onClick={() => setSyncScroll(!settings.syncScroll)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              settings.syncScroll
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {settings.syncScroll ? t.settings.on : t.settings.off}
          </button>
        </div>
      </div>

      {/* Auto Save */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.autoSave}</span>
          <button
            onClick={() => setAutoSave(!settings.autoSave)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              settings.autoSave
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]'
            }`}
          >
            {settings.autoSave ? t.settings.on : t.settings.off}
          </button>
        </div>
      </div>
    </div>
  )
}
