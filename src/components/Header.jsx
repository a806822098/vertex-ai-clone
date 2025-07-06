import { useState } from 'react'
import { useI18n } from '../hooks/useI18n.jsx'
import { useModelStore } from '../stores/modelStore'
import ModelList from './ModelConfig/ModelList'
import { CogIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

function Header() {
  const { t } = useI18n()
  const { getActiveModel } = useModelStore()
  const [showModelConfig, setShowModelConfig] = useState(false)
  
  const activeModel = getActiveModel()

  return (
    <>
      <div className="bg-vertex-bg-secondary border-b border-vertex-border px-6 py-4 relative z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-vertex-text-primary flex items-center gap-2">
            {t('app.title')}
            <span className="text-xs text-vertex-text-tertiary font-normal">v2.0</span>
          </h1>

          <div className="flex items-center gap-4">
            {/* 模型状态指示器 - 增强视觉效果 */}
            <div className="relative group">
              <div className={clsx(
                "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300",
                activeModel 
                  ? "bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              )}>
                <div className={clsx(
                  "w-2 h-2 rounded-full animate-pulse",
                  activeModel ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-sm text-vertex-text-secondary">当前模型:</span>
                <span className={clsx(
                  "font-semibold",
                  activeModel ? "text-vertex-text-primary" : "text-red-400"
                )}>
                  {activeModel?.name || '未配置'}
                </span>
              </div>
              
              {/* 悬浮提示 */}
              {activeModel && (
                <div className="absolute top-full mt-2 right-0 w-64 p-3 bg-gray-900 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><span className="text-gray-500">端点:</span> {activeModel.apiEndpoint}</p>
                    <p><span className="text-gray-500">路径:</span> {activeModel.apiPath}</p>
                    <p><span className="text-gray-500">状态:</span> <span className="text-green-400">已连接</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* 模型配置按钮 - 增强交互 */}
            <button
              onClick={() => setShowModelConfig(!showModelConfig)}
              className={clsx(
                "relative p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110",
                showModelConfig 
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/25" 
                  : "bg-vertex-bg-tertiary hover:bg-vertex-bg-primary text-vertex-text-secondary hover:text-vertex-text-primary"
              )}
              title="模型配置"
            >
              <CogIcon className={clsx(
                "w-6 h-6 transition-transform duration-500",
                showModelConfig && "rotate-180"
              )} />
              {!activeModel && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 模型配置面板 */}
      {showModelConfig && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-4 md:inset-8 lg:inset-12 bg-[#0a0a0a] rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-full flex flex-col">
              {/* 关闭按钮 */}
              <button
                onClick={() => setShowModelConfig(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-gray-800/80 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* 模型列表 */}
              <div className="flex-1 overflow-y-auto">
                <ModelList />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header