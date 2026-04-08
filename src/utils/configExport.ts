import { useBoundStore } from '../stores'
import type { Settings } from '../types'
import type { AIConfig } from '../types'

const CONFIG_VERSION = 1

interface ExportedConfig {
  version: number
  exportedAt: string
  settings: Settings
  aiConfig?: AIConfig
}

/**
 * Export user settings to a JSON file
 */
export function exportConfig() {
  const state = useBoundStore.getState()
  const settings = state.settings
  const aiConfig = state.config

  const config: ExportedConfig = {
    version: CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    aiConfig,
  }

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `prest-config-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Import settings from a JSON file
 */
export function importConfig(file: File): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const config = JSON.parse(content) as ExportedConfig

        // Version check
        if (!config.version || !config.settings) {
          resolve({ success: false, message: 'Invalid config file format' })
          return
        }

        if (config.version > CONFIG_VERSION) {
          resolve({ success: false, message: 'Config file is from a newer version' })
          return
        }

        // Apply settings
        const state = useBoundStore.getState()

        // Theme
        if (config.settings.theme) {
          state.setTheme(config.settings.theme)
        }

        // Editor settings
        if (config.settings.editor) {
          state.updateEditorSettings(config.settings.editor)
        }

        // Sync scroll
        if (typeof config.settings.syncScroll === 'boolean') {
          state.setSyncScroll(config.settings.syncScroll)
        }

        // Auto save
        if (typeof config.settings.autoSave === 'boolean') {
          state.setAutoSave(config.settings.autoSave)
        }

        // Locale
        if (config.settings.locale) {
          state.setLocale(config.settings.locale)
        }

        // Toolbar groups
        if (config.settings.toolbar?.groups) {
          state.setToolbarGroups(config.settings.toolbar.groups)
        }

        // Toolbar items
        if (config.settings.toolbar?.items) {
          state.setToolbarItems(config.settings.toolbar.items)
        }

        // XHS Export settings
        if (config.settings.xhsExport) {
          state.setXHSExportSettings(config.settings.xhsExport)
        }

        // AI enabled
        if (typeof config.settings.aiEnabled === 'boolean') {
          state.setAiEnabled(config.settings.aiEnabled)
        }

        // AI config
        if (config.aiConfig) {
          state.setAIConfig(config.aiConfig)
        }

        resolve({ success: true, message: 'Settings imported successfully' })
      } catch (error) {
        console.error('Failed to import config:', error)
        resolve({ success: false, message: 'Failed to parse config file' })
      }
    }

    reader.onerror = () => {
      resolve({ success: false, message: 'Failed to read file' })
    }

    reader.readAsText(file)
  })
}

/**
 * Trigger file picker for importing config
 */
export function importConfigFromFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const result = await importConfig(file)
      if (result.success) {
        // Reload to apply all settings
        window.location.reload()
      } else {
        alert(result.message)
      }
    }
  }
  input.click()
}
