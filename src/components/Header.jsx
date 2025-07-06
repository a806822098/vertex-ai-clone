import { useState } from 'react'
import { useI18n } from '../hooks/useI18n.jsx'
import { useModelStore } from '../stores/modelStore'
import ModelList from './ModelConfig/ModelList'
import { CogIcon } from '@heroicons/react/24/outline'

function Header() {
  const { t } = useI18n()
  const { getActiveModel } = useModelStore()
  const [showModelConfig, setShowModelConfig] = useState(false)
  
  const activeModel = getActiveModel()

  return (
    <>
      <div className="bg-vertex-bg-secondary border-b border-vertex-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-vertex-text-primary">{t('app.title')}</h1>

          <div className="flex items-center gap-3">
            {/* 模型状态指示器 */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-vertex-bg-tertiary rounded-lg text-sm">
              <span className="text-vertex-text-secondary">当前模型:</span>
              <span className="text-vertex-text-primary font-medium">
                {activeModel?.name || '未配置'}
              </span>
            </div>

            {/* 模型配置按钮 */}
            <button
              onClick={() => setShowModelConfig(!showModelConfig)}
              className="p-2 hover:bg-vertex-bg-tertiary rounded-lg transition-all duration-200 text-vertex-text-secondary hover:text-vertex-text-primary"
              title="模型配置"
            >
              <CogIcon className="w-6 h-6" />
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