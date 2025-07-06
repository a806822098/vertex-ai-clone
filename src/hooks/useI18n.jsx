import { useState, useEffect, createContext, useContext } from 'react'
import zhCN from '../locales/zh-CN'

// 创建 i18n 上下文
const I18nContext = createContext()

// 支持的语言
const languages = {
  'zh-CN': zhCN,
}

// i18n Provider 组件
export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    // 从 localStorage 获取保存的语言，默认中文
    return localStorage.getItem('locale') || 'zh-CN'
  })
  
  const [translations, setTranslations] = useState(languages[locale])
  
  useEffect(() => {
    // 语言改变时更新翻译
    setTranslations(languages[locale])
    localStorage.setItem('locale', locale)
    document.documentElement.lang = locale
  }, [locale])
  
  // 翻译函数
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (!value) {
        console.warn(`Translation missing for key: ${key}`)
        return key
      }
    }
    
    // 替换参数
    if (typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match
      })
    }
    
    return value
  }
  
  const value = {
    locale,
    setLocale,
    t,
    translations,
  }
  
  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

// 使用 i18n 的 Hook
export function useI18n() {
  const context = useContext(I18nContext)
  
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  
  return context
}