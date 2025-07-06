// 自定义模型配置模块
// # 已删除：所有预设provider (openai, anthropic, google) - 原因：只支持自定义模型

// 从modelStore获取自定义模型信息
export function getCustomModels() {
  // 这个功能现在由modelStore管理
  return []
}

// 简化的MODEL_PROVIDERS，只保留自定义模型
export const MODEL_PROVIDERS = {
  custom: {
    name: '自定义模型',
    icon: '⚙️',
    models: {}
  }
}

// 简化的模型信息获取函数 - 现在由modelStore管理
export function getModelInfo() {
  // 保留此函数以兼容旧代码，但返回null让调用者使用modelStore
  return null
}

// # 已删除：updateCustomModels函数 - 原因：由modelStore管理
// # 已删除：getModelsByCapability函数 - 原因：不需要能力筛选功能

// # 已删除：calculateCost函数 - 原因：不需要价格功能