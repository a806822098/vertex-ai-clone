import { useEffect, useState } from 'react'
import { useI18n } from '../hooks/useI18n.jsx'

function SplashScreen({ onComplete }) {
  const { t } = useI18n()
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  
  useEffect(() => {
    // 显示内容动画
    const showTimer = setTimeout(() => setShowContent(true), 100)
    
    // 进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 30)
    
    return () => {
      clearTimeout(showTimer)
      clearInterval(progressInterval)
    }
  }, [onComplete])
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]">
      {/* 背景动画 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* 主要内容 */}
      <div className={`relative z-10 text-center transition-all duration-1000 ${showContent ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95'}`}>
        {/* Logo动画 */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 mx-auto relative">
            {/* 外圈旋转动画 */}
            <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border-4 border-red-500/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-2xl shadow-red-500/50 flex items-center justify-center transform rotate-45">
                <span className="text-white text-4xl font-bold transform -rotate-45">AI</span>
              </div>
            </div>
          </div>
          
          {/* 光晕效果 */}
          <div className="absolute inset-0 -z-10">
            <div className="w-32 h-32 mx-auto bg-red-500/30 rounded-full blur-2xl animate-pulse" />
          </div>
        </div>
        
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-white mb-2">
          {t('app.title')}
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          {t('app.subtitle')}
        </p>
        
        {/* 进度条 */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-3">
            {progress < 30 && '正在初始化系统...'}
            {progress >= 30 && progress < 60 && '加载语言包...'}
            {progress >= 60 && progress < 90 && '准备界面...'}
            {progress >= 90 && '即将完成...'}
          </p>
        </div>
        
        {/* 版本信息 */}
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
          {t('app.version')} | Made with ❤️ for China Developers
        </div>
      </div>
    </div>
  )
}

export default SplashScreen