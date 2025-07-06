import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

/**
 * 浮动操作按钮组件 - Material Design风格
 */
function FloatingActionButton({ 
  actions = [], 
  position = 'bottom-right',
  primaryIcon = <PlusIcon className="w-6 h-6" />,
  primaryAction = null
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // 智能隐藏/显示（滚动时）
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // 向下滚动时隐藏
      } else {
        setIsVisible(true) // 向上滚动时显示
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-24 right-6',
    'top-left': 'top-24 left-6'
  }

  const expandDirection = {
    'bottom-right': 'bottom-16',
    'bottom-left': 'bottom-16',
    'top-right': 'top-16',
    'top-left': 'top-16'
  }

  return (
    <>
      {/* 背景遮罩 */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB容器 */}
      <div 
        className={clsx(
          "fixed z-50 transition-all duration-300",
          positionClasses[position],
          !isVisible && "translate-y-24 opacity-0 pointer-events-none"
        )}
      >
        {/* 子操作按钮 */}
        <div className={clsx(
          "absolute right-0 space-y-3 transition-all duration-300",
          expandDirection[position],
          isExpanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}>
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-end gap-3"
              style={{
                transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
              }}
            >
              {/* 标签 */}
              <span className={clsx(
                "px-3 py-1 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap transition-all duration-300",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"
              )}>
                {action.label}
              </span>

              {/* 按钮 */}
              <button
                onClick={() => {
                  action.onClick()
                  setIsExpanded(false)
                }}
                className={clsx(
                  "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110",
                  action.className || "bg-gray-700 text-white hover:bg-gray-600"
                )}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>

        {/* 主按钮 */}
        <button
          onClick={() => {
            if (primaryAction) {
              primaryAction()
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          className={clsx(
            "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-500 hover:scale-110",
            "bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700",
            isExpanded && "rotate-45"
          )}
        >
          {primaryIcon}
        </button>

        {/* 脉冲效果 */}
        {!isExpanded && actions.length > 0 && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 pointer-events-none" />
        )}
      </div>
    </>
  )
}

export default FloatingActionButton