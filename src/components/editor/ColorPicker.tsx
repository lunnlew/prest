import { useState, useRef, useEffect } from 'react'
import { useBoundStore } from '../../stores'
import { useTranslation } from '../../hooks/useTranslation'

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080',
  '#8B0000', '#006400', '#00008B', '#4B0082', '#2F4F4F', '#696969',
  '#808080', '#A9A9A9', '#D3D3D3', '#F5F5F5', '#DC143C', '#FFD700',
]

interface ColorPickerProps {
  type: 'color' | 'background'
  isOpen: boolean
  onClose: () => void
}

export function ColorPicker({ type, isOpen, onClose }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [customColor, setCustomColor] = useState('#000000')
  const dialogRef = useRef<HTMLDivElement>(null)
  const { insertText } = useBoundStore()
  const { t } = useTranslation()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleSelectPreset = (color: string) => {
    setSelectedColor(color)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    setSelectedColor(color)
  }

  const handleApply = () => {
    if (type === 'color') {
      // Insert colored text using HTML span
      insertText(`<span style="color: ${selectedColor}">text</span>`)
    } else {
      // Insert background colored text using HTML span
      insertText(`<span style="background: ${selectedColor}">text</span>`)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        ref={dialogRef}
        className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg shadow-xl w-72 p-4"
      >
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
          {type === 'color' ? (t?.editor.fontColor || 'Font Color') : (t?.editor.fontBackground || 'Background Color')}
        </h3>

        {/* Preset colors grid */}
        <div className="grid grid-cols-6 gap-2 mb-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleSelectPreset(color)}
              className={`w-8 h-8 rounded border-2 ${
                selectedColor === color ? 'border-[var(--accent-color)]' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom color input */}
        <div className="flex items-center gap-2 mb-3">
          <input
            type="color"
            value={customColor}
            onChange={handleCustomChange}
            className="w-10 h-8 cursor-pointer rounded border border-[var(--border-color)]"
          />
          <input
            type="text"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-2 py-1 text-sm bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded text-[var(--text-primary)]"
          />
        </div>

        {/* Preview */}
        <div className="mb-3 p-2 bg-[var(--bg-tertiary)] rounded">
          <p className="text-xs text-[var(--text-muted)] mb-1">Preview:</p>
          {type === 'color' ? (
            <span style={{ color: selectedColor }}>Sample Text</span>
          ) : (
            <span style={{ backgroundColor: selectedColor, padding: '2px 4px', borderRadius: '2px' }}>
              Sample Text
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          >
            {t?.common.cancel || 'Cancel'}
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 text-sm rounded bg-[var(--accent-color)] text-white hover:opacity-90"
          >
            {t?.common.save || 'Apply'}
          </button>
        </div>
      </div>
    </div>
  )
}
