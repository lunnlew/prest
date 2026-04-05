import { useEffect, useState, useCallback, useRef } from 'react'
import { useBoundStore } from '../stores'
import { loadLocale, getLoadedLocale, LocaleMessages, Locale, defaultLocale } from '../locales'

export function useTranslation() {
  const { settings, setLocale } = useBoundStore()
  const locale: Locale = settings?.locale ?? defaultLocale
  const [messages, setMessages] = useState<LocaleMessages | null>(getLoadedLocale(locale) ?? null)
  const [loading, setLoading] = useState(() => !getLoadedLocale(locale))
  const pendingRef = useRef<string | null>(null)

  // 加载语言包
  useEffect(() => {
    // 检查是否已加载
    const cached = getLoadedLocale(locale)
    if (cached) {
      setLoading(false)
      return
    }

    // 如果已经有一个同样的 locale 在 pending，避免重复加载
    if (pendingRef.current === locale) return
    pendingRef.current = locale

    // 动态加载
    setLoading(true)
    loadLocale(locale)
      .then((data) => {
        if (pendingRef.current === locale) {
          setMessages(data)
          setLoading(false)
          pendingRef.current = null
        }
      })
      .catch((err) => {
        console.error(`Failed to load locale: ${locale}`, err)
        if (pendingRef.current === locale) {
          // 失败时也回退到默认语言
          if (locale !== defaultLocale) {
            loadLocale(defaultLocale).then((data) => {
              // 如果当前 locale 改变了，则使用当前 locale 的数据；否则使用默认
              const { settings: currentSettings } = useBoundStore.getState()
              const currentLocale = (currentSettings?.locale as Locale) ?? defaultLocale
              if (currentLocale !== defaultLocale) {
                return
              }
              setMessages(data)
              setLoading(false)
            })
          }
          pendingRef.current = null
          setLoading(false)
        }
      })
  }, [locale])

  // 切换语言的回调
  const changeLocale = useCallback(
    async (newLocale: Locale) => {
      setLocale(newLocale)
    },
    [setLocale]
  )

  const t = messages

  return { t, locale, setLocale: changeLocale, loading, messages }
}

export type { Locale, LocaleMessages }
