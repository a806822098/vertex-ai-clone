import { useState, useEffect, useRef } from 'react'

/**
 * 智能定位Hook - 防止元素遮挡
 * @param {Object} options - 配置选项
 * @param {string} options.placement - 默认位置 (top-right, bottom-right, etc.)
 * @param {number} options.offset - 偏移距离
 * @param {boolean} options.avoidOverlap - 是否避免重叠
 */
export function useSmartPosition({
  placement = 'top-right',
  offset = 16,
  avoidOverlap = true
} = {}) {
  const elementRef = useRef(null)
  const [position, setPosition] = useState({ top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' })
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!elementRef.current || !avoidOverlap) return

    const checkOverlap = () => {
      const element = elementRef.current
      const rect = element.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let newPosition = { ...position }
      let needsAdjustment = false

      // 检查是否超出视口
      if (rect.right > viewportWidth) {
        newPosition.right = offset + 'px'
        newPosition.left = 'auto'
        needsAdjustment = true
      }

      if (rect.bottom > viewportHeight) {
        newPosition.bottom = offset + 'px'
        newPosition.top = 'auto'
        needsAdjustment = true
      }

      if (rect.left < 0) {
        newPosition.left = offset + 'px'
        newPosition.right = 'auto'
        needsAdjustment = true
      }

      if (rect.top < 0) {
        newPosition.top = offset + 'px'
        newPosition.bottom = 'auto'
        needsAdjustment = true
      }

      // 检查是否与其他固定元素重叠
      const fixedElements = document.querySelectorAll('[data-smart-position]')
      fixedElements.forEach(other => {
        if (other === element) return
        
        const otherRect = other.getBoundingClientRect()
        if (rectsOverlap(rect, otherRect)) {
          // 智能避让
          if (placement.includes('right')) {
            newPosition.right = (viewportWidth - otherRect.left + offset) + 'px'
          } else if (placement.includes('left')) {
            newPosition.left = (otherRect.right + offset) + 'px'
          }
          
          if (placement.includes('top')) {
            newPosition.top = (otherRect.bottom + offset) + 'px'
          } else if (placement.includes('bottom')) {
            newPosition.bottom = (viewportHeight - otherRect.top + offset) + 'px'
          }
          
          needsAdjustment = true
        }
      })

      if (needsAdjustment) {
        setPosition(newPosition)
      }
    }

    // 初始检查
    checkOverlap()

    // 监听窗口变化
    window.addEventListener('resize', checkOverlap)
    window.addEventListener('scroll', checkOverlap)

    // MutationObserver监听DOM变化
    const observer = new MutationObserver(checkOverlap)
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    })

    return () => {
      window.removeEventListener('resize', checkOverlap)
      window.removeEventListener('scroll', checkOverlap)
      observer.disconnect()
    }
  }, [placement, offset, avoidOverlap])

  return {
    ref: elementRef,
    style: position,
    isVisible,
    setIsVisible
  }
}

// 检查两个矩形是否重叠
function rectsOverlap(rect1, rect2) {
  return !(
    rect1.right < rect2.left || 
    rect1.left > rect2.right || 
    rect1.bottom < rect2.top || 
    rect1.top > rect2.bottom
  )
}

// 导出智能定位样式
export const smartPositionStyles = {
  'top-right': { top: '1rem', right: '1rem' },
  'top-left': { top: '1rem', left: '1rem' },
  'bottom-right': { bottom: '1rem', right: '1rem' },
  'bottom-left': { bottom: '1rem', left: '1rem' },
  'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
}