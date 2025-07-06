import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 模型配置接口
const MODEL_STORAGE_KEY = 'vertex-ai-clone-models'

// 默认参数配置
const DEFAULT_SETTINGS = {
  maxTokens: 4096,
  temperature: 0.7,
  topP: 1,
  topK: 40,
  contextWindow: 32768,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

// 默认的第一个模型示例（仅在用户未配置时显示）
const EXAMPLE_MODEL = {
  id: 'example-model',
  name: '示例模型',
  apiEndpoint: 'https://api.example.com',
  apiKey: 'sk-your-api-key-here',
  apiPath: '/v1/chat/completions',
  enabled: false,
  description: '这是一个示例配置，请根据您的实际情况修改',
  maxTokens: 4096,
  contextWindow: 32768,
}

export const useModelStore = create(
  persist(
    (set, get) => ({
      // 模型列表
      models: [],
      
      // 当前选中的模型ID
      activeModelId: null,
      
      // 全局参数设置
      settings: DEFAULT_SETTINGS,
      
      // 添加模型
      addModel: (model) => {
        const newModel = {
          ...model,
          id: model.id || `model-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          models: [...state.models, newModel],
          activeModelId: state.activeModelId || newModel.id,
        }))
        
        return newModel
      },
      
      // 更新模型
      updateModel: (id, updates) => {
        set((state) => ({
          models: state.models.map((model) =>
            model.id === id
              ? { ...model, ...updates, updatedAt: new Date().toISOString() }
              : model
          ),
        }))
      },
      
      // 删除模型
      deleteModel: (id) => {
        set((state) => {
          const newModels = state.models.filter((model) => model.id !== id)
          const newActiveId = state.activeModelId === id 
            ? (newModels[0]?.id || null)
            : state.activeModelId
            
          return {
            models: newModels,
            activeModelId: newActiveId,
          }
        })
      },
      
      // 设置当前模型
      setActiveModel: (id) => {
        set({ activeModelId: id })
      },
      
      // 获取当前模型
      getActiveModel: () => {
        const state = get()
        return state.models.find((model) => model.id === state.activeModelId)
      },
      
      // 更新全局设置
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
      },
      
      // 导出配置
      exportConfig: () => {
        const state = get()
        return {
          models: state.models,
          activeModelId: state.activeModelId,
          settings: state.settings,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        }
      },
      
      // 导入配置
      importConfig: (config) => {
        if (config.models && Array.isArray(config.models)) {
          set({
            models: config.models,
            activeModelId: config.activeModelId || config.models[0]?.id || null,
            settings: config.settings || DEFAULT_SETTINGS,
          })
        }
      },
      
      // 测试API连接
      testConnection: async (model) => {
        try {
          const response = await fetch(model.apiEndpoint + model.apiPath, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${model.apiKey}`,
            },
            body: JSON.stringify({
              model: model.name,
              messages: [{ role: 'user', content: 'test' }],
              max_tokens: 10,
            }),
          })
          
          return {
            success: response.ok,
            status: response.status,
            message: response.ok ? '连接成功' : `连接失败: ${response.status}`,
          }
        } catch (error) {
          return {
            success: false,
            status: 0,
            message: `连接错误: ${error.message}`,
          }
        }
      },
      
      // 初始化默认数据
      initialize: () => {
        const state = get()
        // 如果没有模型，不自动添加示例模型，让用户从零开始配置
        if (state.models.length === 0) {
          set({
            models: [],
            activeModelId: null,
          })
        }
      },
    }),
    {
      name: MODEL_STORAGE_KEY,
      version: 1,
    }
  )
)