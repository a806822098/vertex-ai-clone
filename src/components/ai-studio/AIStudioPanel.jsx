import { useState } from 'react'
import ModelSelector from './ModelSelector.jsx'
import ParameterPanel from './ParameterPanel.jsx'
import SystemPrompt from './SystemPrompt.jsx'
import SeedManager from './SeedManager.jsx'
import ModelConfigDialog from '../ModelConfig/ModelConfigDialog'
import { useModelStore } from '../../stores/modelStore'
import { useI18n } from '../../hooks/useI18n.jsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

function AIStudioPanel({ 
  isOpen, 
  onClose, 
  config, 
  onConfigChange,
  className 
}) {
  const { t } = useI18n()
  const { addModel } = useModelStore()
  const [activeTab, setActiveTab] = useState('model')
  const [showModelConfig, setShowModelConfig] = useState(false)
  
  const tabs = [
    { id: 'model', label: t('studio.model'), icon: '🤖' },
    { id: 'parameters', label: t('studio.parameters'), icon: '⚙️' },
    { id: 'system', label: t('studio.systemPrompt'), icon: '📝' },
    { id: 'advanced', label: t('studio.advanced'), icon: '🔧' }
  ]
  
  const handleConfigUpdate = (updates) => {
    onConfigChange({
      ...config,
      ...updates
    })
  }
  
  return (
    <div className={clsx(
      'fixed inset-y-0 right-0 w-[480px] bg-vertex-bg-primary shadow-xl',
      'transform transition-transform duration-300 ease-in-out z-50',
      isOpen ? 'translate-x-0' : 'translate-x-full',
      className
    )}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-vertex-bg-secondary border-b border-vertex-border px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-vertex-text-primary">{t('studio.title')}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-vertex-bg-tertiary rounded-md transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-vertex-text-secondary" />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-vertex-accent/20 text-vertex-accent'
                    : 'text-vertex-text-secondary hover:text-vertex-text-primary hover:bg-vertex-bg-tertiary'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'model' && (
            <div className="space-y-6">
              <ModelSelector
                value={config.model}
                onChange={(modelId) => handleConfigUpdate({ model: modelId })}
                onAddModel={() => setShowModelConfig(true)}
              />
              
            </div>
          )}
          
          {activeTab === 'parameters' && (
            <ParameterPanel
              parameters={config.parameters || {
                temperature: 0.7,
                maxTokens: 1024,
                topP: 1,
                topK: 40,
                frequencyPenalty: 0,
                presencePenalty: 0
              }}
              onChange={(parameters) => handleConfigUpdate({ parameters })}
            />
          )}
          
          {activeTab === 'system' && (
            <SystemPrompt
              value={config.systemPrompt}
              onChange={(systemPrompt) => handleConfigUpdate({ systemPrompt })}
            />
          )}
          
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              <SeedManager
                seed={config.seed}
                onChange={(seed) => handleConfigUpdate({ seed })}
              />
              
              <div className="bg-vertex-bg-secondary rounded-lg p-4 border border-vertex-border">
                <h3 className="text-sm font-medium text-vertex-text-primary mb-3">Streaming Response</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-vertex-text-secondary">Enable real-time streaming of AI responses</p>
                    <p className="text-xs text-vertex-text-tertiary mt-1">Responses appear word-by-word as they're generated</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableStreaming !== false}
                      onChange={(e) => handleConfigUpdate({ enableStreaming: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-vertex-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-vertex-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vertex-accent"></div>
                  </label>
                </div>
              </div>
              
              <div className="bg-vertex-bg-secondary rounded-lg p-4 border border-vertex-border">
                <h3 className="text-sm font-medium text-vertex-text-primary mb-3">Response Format</h3>
                <select
                  value={config.responseFormat || 'text'}
                  onChange={(e) => handleConfigUpdate({ responseFormat: e.target.value })}
                  className="w-full px-3 py-2 bg-vertex-bg-tertiary border border-vertex-border rounded-md focus:ring-2 focus:ring-vertex-accent text-vertex-text-primary"
                >
                  <option value="text">Text</option>
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                  <option value="code">Code</option>
                </select>
              </div>
              
              <div className="bg-vertex-bg-secondary rounded-lg p-4 border border-vertex-border">
                <h3 className="text-sm font-medium text-vertex-text-primary mb-3">Stop Sequences</h3>
                <textarea
                  value={config.stopSequences?.join('\n') || ''}
                  onChange={(e) => handleConfigUpdate({ 
                    stopSequences: e.target.value.split('\n').filter(s => s.trim()) 
                  })}
                  placeholder="Enter stop sequences (one per line)"
                  className="w-full px-3 py-2 text-sm font-mono bg-vertex-bg-tertiary border border-vertex-border rounded-md focus:ring-2 focus:ring-vertex-accent text-vertex-text-primary placeholder-vertex-text-tertiary"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-vertex-bg-secondary border-t border-vertex-border px-6 py-4">
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Export configuration
                const configStr = JSON.stringify(config, null, 2)
                const blob = new Blob([configStr], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'ai-studio-config.json'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex-1 px-4 py-2 text-sm font-medium text-vertex-text-secondary bg-vertex-bg-tertiary hover:bg-vertex-bg-primary rounded-md transition-colors"
            >
              Export Config
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-vertex-accent hover:bg-vertex-accent-hover rounded-md transition-colors"
            >
              Apply & Close
            </button>
          </div>
        </div>
      </div>
      
      {/* 模型配置对话框 */}
      <ModelConfigDialog
        isOpen={showModelConfig}
        onClose={() => setShowModelConfig(false)}
        onSave={(model) => {
          addModel(model)
          setShowModelConfig(false)
        }}
      />
    </div>
  )
}

export default AIStudioPanel