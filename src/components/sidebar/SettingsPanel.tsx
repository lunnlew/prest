import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'
import { availableLocales } from '../../locales'
import { themes } from '../../types'

export function SettingsPanel() {
  const {
    settings,
    updateEditorSettings,
    setTheme,
    setSyncScroll,
    setAutoSave,
    config,
    setAIConfig,
    setAiEnabled,
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
        <div className="text-sm text-[var(--text-primary)] mb-3">{t.settings.theme}</div>
        <div className="grid grid-cols-5 gap-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`flex flex-col items-center p-2 rounded transition-all ${
                settings.theme === theme.id
                  ? 'ring-2 ring-[var(--accent-color)] bg-[var(--bg-tertiary)]'
                  : 'hover:bg-[var(--bg-tertiary)]'
              }`}
              title={t.settings[`theme${theme.id.charAt(0).toUpperCase() + theme.id.slice(1)}` as keyof typeof t.settings] || theme.id}
            >
              <div className="flex gap-0.5 mb-1">
                {theme.previewColors.map((color, i) => (
                  <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                ))}
              </div>
              <span className="text-xs">{theme.icon}</span>
            </button>
          ))}
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

      {/* AI Settings */}
      <div className="px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--text-primary)]">{t.settings.aiSettings}</span>
          <button
            onClick={() => setAiEnabled(!settings.aiEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              settings.aiEnabled
                ? 'bg-[var(--accent-color)]'
                : 'bg-[var(--bg-tertiary)]'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                settings.aiEnabled ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        {settings.aiEnabled && (
          <>
            {/* API Endpoint */}
            <div className="mb-3">
              <label className="text-xs text-[var(--text-muted)] block mb-1">{t.settings.apiEndpoint}</label>
              <input
                type="text"
                value={config.apiEndpoint}
                onChange={(e) => setAIConfig({ apiEndpoint: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full px-2 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>

            {/* API Key */}
            <div className="mb-3">
              <label className="text-xs text-[var(--text-muted)] block mb-1">{t.settings.apiKey}</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setAIConfig({ apiKey: e.target.value })}
                placeholder={t.settings.apiKeyPlaceholder || 'sk-...'}
                className="w-full px-2 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>

            {/* Model */}
            <div className="mb-3">
              <label className="text-xs text-[var(--text-muted)] block mb-1">{t.settings.model}</label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => setAIConfig({ model: e.target.value })}
                placeholder="gpt-3.5-turbo"
                className="w-full px-2 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>

            {/* Temperature */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[var(--text-muted)]">{t.settings.temperature}</label>
                <span className="text-xs text-[var(--text-muted)]">{config.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => setAIConfig({ temperature: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            {/* Max Tokens */}
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">{t.settings.maxTokens}</label>
              <input
                type="number"
                min="100"
                max="8000"
                value={config.maxTokens}
                onChange={(e) => setAIConfig({ maxTokens: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)]"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
