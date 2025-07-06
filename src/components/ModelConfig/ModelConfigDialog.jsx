import { useState, useEffect } from 'react'
// import { useI18n } from '../../hooks/useI18n.jsx'
import { XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

function ModelConfigDialog({ isOpen, onClose, model, onSave }) {
  // const { t } = useI18n()
  const [formData, setFormData] = useState({
    name: model?.name || '',
    apiEndpoint: model?.apiEndpoint || '',
    apiKey: model?.apiKey || '',
    apiPath: model?.apiPath || '/chat/completions',
    description: model?.description || '',
    maxTokens: model?.maxTokens || 65536,
    contextWindow: model?.contextWindow || 2097152,
    enabled: model?.enabled ?? true,
  })
  const [testing, setTesting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.apiEndpoint || !formData.apiKey) {
      toast.error('请填写所有必填字段')
      return
    }

    onSave({
      ...model,
      ...formData,
    })
    
    toast.success(model ? '模型已更新' : '模型已添加')
    onClose()
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const response = await fetch(formData.apiEndpoint + formData.apiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${formData.apiKey}`,
        },
        body: JSON.stringify({
          model: formData.name,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 10,
        }),
      })

      if (response.ok) {
        toast.success('连接成功！')
      } else {
        toast.error(`连接失败: ${response.status}`)
      }
    } catch (error) {
      toast.error(`连接错误: ${error.message}`)
    } finally {
      setTesting(false)
    }
  }

  // 添加快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen) {
        if (e.key === 'Escape') {
          onClose()
        } else if (e.ctrlKey && e.key === 'Enter') {
          handleSubmit(e)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handleSubmit])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-2xl bg-[#141414] rounded-2xl shadow-2xl border border-gray-800 animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-red-600 to-red-500" />
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {model ? '编辑模型' : '添加新模型'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">基本信息</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  模型名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: gemini-2.5-pro"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="模型的简短描述"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* API 配置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">API 配置</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API 端点 <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.apiEndpoint}
                  onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API 路径
                </label>
                <input
                  type="text"
                  value={formData.apiPath}
                  onChange={(e) => setFormData({ ...formData, apiPath: e.target.value })}
                  placeholder="/chat/completions"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API 密钥 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="sk-xxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>
            </div>

            {/* 模型参数 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-300">模型参数</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    最大输出令牌数
                  </label>
                  <input
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="65536"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    上下文窗口大小
                  </label>
                  <input
                    type="number"
                    value={formData.contextWindow}
                    onChange={(e) => setFormData({ ...formData, contextWindow: parseInt(e.target.value) || 0 })}
                    min="0"
                    max="2097152"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 bg-gray-900 border-gray-600 rounded focus:ring-red-500"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-300">
                  改善网络兼容性
                </label>
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !formData.apiEndpoint || !formData.apiKey}
                className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {testing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    测试中...
                  </span>
                ) : '测试连接'}
              </button>
              
              <div className="flex-1" />
              
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all"
              >
                取消
              </button>
              
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all"
              >
                {model ? '保存更改' : '添加模型'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ModelConfigDialog