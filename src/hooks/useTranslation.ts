import { useEffect, useState, useCallback } from 'react'
import { useBoundStore } from '../stores'
import { loadLocale, getLoadedLocale, LocaleMessages, Locale, defaultLocale } from '../locales'

export function useTranslation() {
  const { settings, setLocale } = useBoundStore()
  const locale: Locale = settings?.locale ?? defaultLocale
  const [messages, setMessages] = useState<LocaleMessages | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载语言包
  useEffect(() => {
    // 检查是否已加载
    const cached = getLoadedLocale(locale)
    if (cached) {
      setMessages(cached)
      setLoading(false)
      return
    }

    // 动态加载
    setLoading(true)
    loadLocale(locale)
      .then((data) => {
        setMessages(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error(`Failed to load locale: ${locale}`, err)
        // 失败时加载默认语言
        if (locale !== defaultLocale) {
          loadLocale(defaultLocale).then((data) => {
            setMessages(data)
            setLoading(false)
          })
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

  // 返回当前语言包（加载中时返回 null）
  const t = messages

  return { t, locale, setLocale: changeLocale, loading, messages }
}

export type { Locale, LocaleMessages }