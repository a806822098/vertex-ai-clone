import { useState } from 'react'
import { CheckIcon, ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useModelStore } from '../../stores/modelStore'
// import { useI18n } from '../../hooks/useI18n.jsx'
import clsx from 'clsx'

function ModelSelector({ value, onChange, className, onAddModel }) {
  // const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const { models, activeModelId, setActiveModel } = useModelStore()
  
  const currentModel = models.find(m => m.id === value) || models.find(m => m.id === activeModelId)
  
  const handleSelect = (modelId) => {
    onChange(modelId)
    setActiveModel(modelId)
    setIsOpen(false)
  }
  
  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3',
          'bg-vertex-bg-secondary border border-vertex-border rounded-lg',
          'hover:border-vertex-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-500',
          'transition-colors'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div className="text-left">
            <div className="font-medium text-vertex-text-primary">
              {currentModel?.name || '选择模型'}
            </div>
            {currentModel?.description && (
              <div className="text-sm text-vertex-text-secondary line-clamp-1">
                {currentModel.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDownIcon className={clsx(
          'w-5 h-5 text-vertex-text-tertiary transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute z-20 w-full mt-2 bg-vertex-bg-secondary rounded-lg shadow-lg border border-vertex-border max-h-[400px] overflow-hidden">
            {/* 添加新模型按钮 */}
            <button
              onClick={() => {
                setIsOpen(false)
                onAddModel && onAddModel()
              }}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-vertex-bg-tertiary transition-colors text-left border-b border-vertex-border"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <PlusIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-vertex-text-primary">添加新模型</div>
                <div className="text-sm text-vertex-text-secondary">配置自定义AI模型</div>
              </div>
            </button>
            
            {/* 模型列表 */}
            <div className="overflow-y-auto max-h-[340px]">
              {models.length === 0 ? (
                <div className="p-8 text-center text-vertex-text-tertiary">
                  <p className="mb-2">还没有配置任何模型</p>
                  <p className="text-sm">点击上方按钮添加您的第一个模型</p>
                </div>
              ) : (
                models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model.id)}
                    disabled={!model.enabled}
                    className={clsx(
                      'w-full px-4 py-3 flex items-start gap-3 hover:bg-vertex-bg-tertiary',
                      'transition-colors text-left',
                      value === model.id && 'bg-red-500/10',
                      !model.enabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-vertex-text-primary">{model.name}</span>
                        {value === model.id && (
                          <CheckIcon className="w-4 h-4 text-red-500" />
                        )}
                        {!model.enabled && (
                          <span className="text-xs text-vertex-text-tertiary">(已禁用)</span>
                        )}
                      </div>
                      
                      {model.description && (
                        <p className="text-sm text-vertex-text-secondary mt-1">
                          {model.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-vertex-text-tertiary">
                        <span>最大令牌: {model.maxTokens?.toLocaleString() || 'N/A'}</span>
                        <span>上下文: {model.contextWindow?.toLocaleString() || 'N/A'}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ModelSelector