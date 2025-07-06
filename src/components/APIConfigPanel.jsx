import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, PlusIcon, TrashIcon, ChevronDownIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { getPresetEndpoints } from '../utils/api'
import toast from 'react-hot-toast'

function APIConfigPanel({ isOpen, onClose, currentConfig, onConfigChange }) {
  const [config, setConfig] = useState({
    endpoint: '',
    apiKey: '',
    customHeaders: {},
    proxyUrl: '',
    timeout: 30000,
    retryAttempts: 3,
    customModels: [],
    ...currentConfig
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [newHeaderKey, setNewHeaderKey] = useState('')
  const [newHeaderValue, setNewHeaderValue] = useState('')
  const [newModel, setNewModel] = useState({ name: '', id: '', maxTokens: 4096 })
  
  const fileInputRef = useRef(null)
  const presetEndpoints = getPresetEndpoints()

  useEffect(() => {
    setConfig(prev => ({ ...prev, ...currentConfig }))
  }, [currentConfig])

  const handleAddHeader = () => {
    if (newHeaderKey && newHeaderValue) {
      setConfig(prev => ({
        ...prev,
        customHeaders: {
          ...prev.customHeaders,
          [newHeaderKey]: newHeaderValue
        }
      }))
      setNewHeaderKey('')
      setNewHeaderValue('')
    }
  }

  const handleRemoveHeader = (key) => {
    setConfig(prev => {
      const { [key]: _, ...rest } = prev.customHeaders
      return { ...prev, customHeaders: rest }
    })
  }

  const handleAddModel = () => {
    if (newModel.name && newModel.id) {
      setConfig(prev => ({
        ...prev,
        customModels: [...prev.customModels, { ...newModel, id: `custom-${Date.now()}` }]
      }))
      setNewModel({ name: '', id: '', maxTokens: 4096 })
    }
  }

  const handleRemoveModel = (modelId) => {
    setConfig(prev => ({
      ...prev,
      customModels: prev.customModels.filter(m => m.id !== modelId)
    }))
  }

  const handleSave = () => {
    onConfigChange(config)
    onClose()
  }

  const handlePresetSelect = (preset) => {
    setConfig(prev => ({
      ...prev,
      endpoint: preset.url,
      customHeaders: preset.headers || {}
    }))
  }

  const handleExportConfig = () => {
    const exportData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config: {
        endpoint: config.endpoint,
        customHeaders: config.customHeaders,
        proxyUrl: config.proxyUrl,
        timeout: config.timeout,
        retryAttempts: config.retryAttempts,
        customModels: config.customModels
      }
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-config-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Configuration exported successfully')
  }

  const handleImportConfig = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.config) {
          setConfig(prev => ({
            ...prev,
            ...data.config
          }))
          toast.success('Configuration imported successfully')
        } else {
          toast.error('Invalid configuration file')
        }
      } catch {
        toast.error('Failed to parse configuration file')
      }
    }
    reader.readAsText(file)
    
    // Reset file input
    event.target.value = ''
  }

  return (
    <div className={clsx(
      'fixed right-0 top-0 h-full z-50 transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="h-full w-[500px] bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">API Configuration</h2>
          <div className="flex items-center gap-2">
            {/* Import/Export buttons */}
            <button
              onClick={handleExportConfig}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Export Configuration"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Import Configuration"
            >
              <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfig}
              className="hidden"
            />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preset Endpoints */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetEndpoints.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetSelect(preset)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-left"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Endpoint URL
            </label>
            <input
              type="text"
              value={config.endpoint}
              onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              <ChevronDownIcon className={clsx(
                'w-4 h-4 transition-transform',
                showAdvanced && 'rotate-180'
              )} />
              Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4 space-y-4">
                {/* Custom Headers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Headers
                  </label>
                  <div className="space-y-2">
                    {Object.entries(config.customHeaders).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={key}
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <input
                          type="text"
                          value={value}
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <button
                          onClick={() => handleRemoveHeader(key)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newHeaderKey}
                        onChange={(e) => setNewHeaderKey(e.target.value)}
                        placeholder="Header name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newHeaderValue}
                        onChange={(e) => setNewHeaderValue(e.target.value)}
                        placeholder="Header value"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddHeader}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Proxy URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proxy URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.proxyUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, proxyUrl: e.target.value }))}
                    placeholder="http://proxy.example.com:8080"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) }))}
                    min="5000"
                    max="120000"
                    step="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Retry Attempts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    value={config.retryAttempts}
                    onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                    min="0"
                    max="5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Custom Models */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Models
                  </label>
                  <div className="space-y-2">
                    {config.customModels.map((model) => (
                      <div key={model.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{model.name}</div>
                          <div className="text-xs text-gray-500">{model.id} • {model.maxTokens} tokens</div>
                        </div>
                        <button
                          onClick={() => handleRemoveModel(model.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="space-y-2 p-3 border border-gray-300 rounded-lg">
                      <input
                        type="text"
                        value={newModel.name}
                        onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Model display name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newModel.id}
                        onChange={(e) => setNewModel(prev => ({ ...prev, id: e.target.value }))}
                        placeholder="Model ID (e.g., gpt-4)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        value={newModel.maxTokens}
                        onChange={(e) => setNewModel(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        placeholder="Max tokens"
                        min="1"
                        max="128000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleAddModel}
                        className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Model
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  )
}

export default APIConfigPanel