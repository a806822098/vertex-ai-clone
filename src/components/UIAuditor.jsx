import { useEffect, useState } from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

/**
 * UI审计器 - 开发模式下检测UI问题
 */
function UIAuditor() {
  const [issues, setIssues] = useState([])
  const [isMinimized, setIsMinimized] = useState(true)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const auditUI = () => {
      const newIssues = []

      // 1. 检查z-index冲突
      const elements = document.querySelectorAll('*')
      const zIndexMap = new Map()
      
      elements.forEach(el => {
        const style = window.getComputedStyle(el)
        const zIndex = parseInt(style.zIndex)
        
        if (!isNaN(zIndex) && zIndex > 0) {
          const rect = el.getBoundingClientRect()
          const key = `${Math.round(rect.top)}-${Math.round(rect.left)}`
          
          if (zIndexMap.has(key)) {
            const existing = zIndexMap.get(key)
            if (Math.abs(existing.zIndex - zIndex) < 10) {
              newIssues.push({
                type: 'z-index-conflict',
                severity: 'warning',
                message: `Z-index冲突: 两个元素在相似位置使用了相近的z-index (${existing.zIndex} vs ${zIndex})`,
                element: el
              })
            }
          } else {
            zIndexMap.set(key, { zIndex, element: el })
          }
        }
      })

      // 2. 检查元素遮挡
      const interactiveElements = document.querySelectorAll('button, a, input, textarea, select')
      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) return

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const topElement = document.elementFromPoint(centerX, centerY)

        if (topElement && topElement !== el && !el.contains(topElement)) {
          newIssues.push({
            type: 'element-blocked',
            severity: 'error',
            message: `交互元素被遮挡: ${el.tagName.toLowerCase()}${el.className ? '.' + el.className.split(' ')[0] : ''}`,
            element: el,
            blocker: topElement
          })
        }
      })

      // 3. 检查点击区域大小
      interactiveElements.forEach(el => {
        const rect = el.getBoundingClientRect()
        const minSize = 44 // 最小可点击区域 (WCAG标准)

        if (rect.width < minSize || rect.height < minSize) {
          newIssues.push({
            type: 'small-target',
            severity: 'warning',
            message: `点击区域过小: ${Math.round(rect.width)}x${Math.round(rect.height)}px (建议最小 ${minSize}x${minSize}px)`,
            element: el
          })
        }
      })

      // 4. 检查对比度
      elements.forEach(el => {
        const style = window.getComputedStyle(el)
        const bgColor = style.backgroundColor
        const textColor = style.color

        if (bgColor !== 'rgba(0, 0, 0, 0)' && textColor !== 'rgba(0, 0, 0, 0)') {
          const contrast = getContrastRatio(bgColor, textColor)
          if (contrast < 4.5 && el.textContent?.trim()) {
            newIssues.push({
              type: 'low-contrast',
              severity: 'warning',
              message: `对比度不足: ${contrast.toFixed(2)}:1 (建议最小 4.5:1)`,
              element: el
            })
          }
        }
      })

      setIssues(newIssues)
    }

    // 初始审计
    auditUI()

    // 定期审计
    const interval = setInterval(auditUI, 5000)

    // DOM变化时审计
    const observer = new MutationObserver(() => {
      clearTimeout(observer.timeout)
      observer.timeout = setTimeout(auditUI, 500)
    })
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  if (process.env.NODE_ENV !== 'development' || issues.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-md">
      <div className={`bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-96'
      }`}>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-full p-3 bg-gray-800 hover:bg-gray-700 flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            {!isMinimized && <span className="text-sm font-medium">UI审计器 ({issues.length}个问题)</span>}
          </div>
        </button>

        {!isMinimized && (
          <div className="max-h-96 overflow-y-auto p-3 space-y-2">
            {issues.map((issue, index) => (
              <div
                key={index}
                className={`p-2 rounded text-xs ${
                  issue.severity === 'error' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                }`}
                onMouseEnter={() => highlightElement(issue.element)}
                onMouseLeave={() => unhighlightElement(issue.element)}
              >
                <p className="font-medium">{issue.type}</p>
                <p className="opacity-80">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 高亮问题元素
function highlightElement(element) {
  if (!element) return
  element.style.outline = '2px solid red'
  element.style.outlineOffset = '2px'
}

function unhighlightElement(element) {
  if (!element) return
  element.style.outline = ''
  element.style.outlineOffset = ''
}

// 计算对比度
function getContrastRatio(color1, color2) {
  // 简化的对比度计算
  const rgb1 = parseRGB(color1)
  const rgb2 = parseRGB(color2)
  
  if (!rgb1 || !rgb2) return 21 // 如果无法解析，返回高对比度

  const l1 = getLuminance(rgb1)
  const l2 = getLuminance(rgb2)
  
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

function parseRGB(color) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return null
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3])
  }
}

function getLuminance({ r, g, b }) {
  const rsRGB = r / 255
  const gsRGB = g / 255
  const bsRGB = b / 255

  const rLin = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
  const gLin = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
  const bLin = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin
}

export default UIAuditor