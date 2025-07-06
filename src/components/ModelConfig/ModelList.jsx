import { useState } from 'react'
// import { useI18n } from '../../hooks/useI18n.jsx'
import { useModelStore } from '../../stores/modelStore'
import ModelConfigDialog from './ModelConfigDialog'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

function ModelList() {
  // const { t } = useI18n()
  const { models, activeModelId, setActiveModel, addModel, updateModel, deleteModel } = useModelStore()
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleAddModel = () => {
    setEditingModel(null)
    setShowConfigDialog(true)
  }

  const handleEditModel = (model) => {
    setEditingModel(model)
    setShowConfigDialog(true)
  }

  const handleSaveModel = (modelData) => {
    if (editingModel) {
      updateModel(editingModel.id, modelData)
    } else {
      addModel(modelData)
    }
  }

  const handleDeleteModel = (id) => {
    if (deleteConfirmId === id) {
      deleteModel(id)
      toast.success('模型已删除')
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleCopyApiKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API密钥已复制')
  }

  // 配置复制功能（保留以备后续使用）
  // const handleCopyConfig = (model) => {
  //   const config = {
  //     name: model.name,
  //     apiEndpoint: model.apiEndpoint,
  //     apiPath: model.apiPath,
  //     apiKey: model.apiKey,
  //     maxTokens: model.maxTokens,
  //     contextWindow: model.contextWindow
  //   }
  //   navigator.clipboard.writeText(JSON.stringify(config, null, 2))
  //   toast.success('配置已复制到剪贴板')
  // }

  return (
    <div className="p-6 bg-[#0a0a0a] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* 标题和添加按钮 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">模型配置中心</h1>
            <p className="text-gray-400">管理您的自定义AI模型</p>
          </div>
          
          <button
            onClick={handleAddModel}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            添加新模型
          </button>
        </div>

        {/* 模型列表 */}
        {models.length === 0 ? (
          <div className="text-center py-20">
            <CogIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-400 mb-4">还没有配置任何模型</p>
            <button
              onClick={handleAddModel}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              添加您的第一个模型
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {models.map((model) => (
              <div
                key={model.id}
                className={`relative p-6 bg-[#141414] rounded-xl border ${
                  activeModelId === model.id ? 'border-red-500' : 'border-gray-800'
                } hover:border-gray-600 transition-all`}
              >
                {/* 激活状态指示器 */}
                {activeModelId === model.id && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-500/30">
                      当前使用
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-white">{model.name}</h3>
                      {model.enabled ? (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    
                    {model.description && (
                      <p className="text-gray-400 mb-3">{model.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">端点:</span>
                        <span className="text-gray-300 font-mono">{model.apiEndpoint}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">路径:</span>
                        <span className="text-gray-300 font-mono">{model.apiPath}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">最大令牌:</span>
                        <span className="text-gray-300">{model.maxTokens.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">上下文窗口:</span>
                        <span className="text-gray-300">{model.contextWindow.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 ml-6">
                    {activeModelId !== model.id && (
                      <button
                        onClick={() => setActiveModel(model.id)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                      >
                        使用
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleCopyApiKey(model.apiKey)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      title="复制API密钥"
                    >
                      <DocumentDuplicateIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleEditModel(model)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                      title="编辑"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className={`group relative p-2 rounded-lg transition-all duration-200 ${
                        deleteConfirmId === model.id
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:scale-110'
                      }`}
                      title={deleteConfirmId === model.id ? '再次点击确认删除' : '删除模型'}
                    >
                      <TrashIcon className="w-5 h-5" />
                      {deleteConfirmId === model.id && (
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-red-600 text-white text-xs rounded-lg whitespace-nowrap animate-bounce">
                          再次点击确认删除
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 配置对话框 */}
      <ModelConfigDialog
        isOpen={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        model={editingModel}
        onSave={handleSaveModel}
      />
    </div>
  )
}

export default ModelList