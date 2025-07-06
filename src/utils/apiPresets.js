/**
 * 为中国开发者优化的 API 预设配置
 * 专注于各类中转站和本地部署
 */

export const CHINA_API_PRESETS = {
  '🚀 通用中转站': {
    endpoint: '',
    format: 'openai',
    placeholder: 'sk-xxxxxxxxxxxxxx',
    defaultModel: 'gpt-3.5-turbo',
    description: '支持 OpenAI 格式的通用中转站',
    configTemplate: {
      baseUrl: 'https://api.your-proxy.com',
      models: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'],
      needsProxy: false
    }
  },
  
  '🌟 OneAPI 中转': {
    endpoint: 'https://api.oneapi.com/v1/chat/completions',
    format: 'openai',
    placeholder: 'sk-oneapi-xxxxxx',
    defaultModel: 'gpt-3.5-turbo',
    description: 'OneAPI 统一接口，支持多种模型',
    configTemplate: {
      supportedModels: ['gpt-3.5-turbo', 'gpt-4', 'claude-3', 'gemini-pro'],
      features: ['balance-query', 'model-list', 'usage-stats']
    }
  },
  
  '🐧 腾讯混元': {
    endpoint: 'https://hunyuan.cloud.tencent.com/v1/chat/completions',
    format: 'openai',
    placeholder: 'secret_id:secret_key',
    defaultModel: 'hunyuan-lite',
    description: '腾讯混元大模型，国产之光',
    configTemplate: {
      models: ['hunyuan-lite', 'hunyuan-standard', 'hunyuan-pro'],
      region: 'ap-guangzhou'
    }
  },
  
  '🌙 月之暗面 Kimi': {
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
    format: 'openai',
    placeholder: 'sk-xxxxxxxxxxxxxx',
    defaultModel: 'moonshot-v1-8k',
    description: 'Kimi AI，超长上下文支持',
    configTemplate: {
      models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
      maxContext: 128000
    }
  },
  
  '🔥 智谱 GLM': {
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    format: 'openai',
    placeholder: 'your-api-key',
    defaultModel: 'glm-4',
    description: '智谱清言，中文理解能力强',
    configTemplate: {
      models: ['glm-4', 'glm-3-turbo', 'glm-4v'],
      features: ['vision', 'function-calling']
    }
  },
  
  '🏠 本地 Ollama': {
    endpoint: 'http://localhost:11434/v1/chat/completions',
    format: 'openai',
    placeholder: '无需密钥',
    defaultModel: 'qwen:7b',
    description: '本地运行的开源模型',
    configTemplate: {
      models: ['llama2', 'qwen', 'chatglm3', 'mistral'],
      isLocal: true,
      requiresGPU: true
    }
  },
  
  '🌐 自定义端点': {
    endpoint: '',
    format: 'custom',
    placeholder: '输入您的 API 密钥',
    defaultModel: '',
    description: '配置您自己的 API 端点',
    configTemplate: {
      supportedFormats: ['openai', 'anthropic', 'google'],
      customHeaders: {},
      timeout: 30000
    }
  }
}

// API 格式检测规则
export const API_FORMAT_RULES = {
  openai: {
    test: (url) => url.includes('/chat/completions') || url.includes('/v1/'),
    requestAdapter: (messages, config) => ({
      model: config.model,
      messages: messages,
      stream: config.stream || false,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty,
    }),
    responseParser: (data) => {
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content
      }
      throw new Error('Invalid response format')
    }
  },
  
  anthropic: {
    test: (url) => url.includes('anthropic') || url.includes('/messages'),
    requestAdapter: (messages, config) => ({
      model: config.model,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content,
      max_tokens: config.maxTokens || 1024,
      temperature: config.temperature,
      top_p: config.topP,
    }),
    responseParser: (data) => {
      if (data.content && data.content[0]) {
        return data.content[0].text
      }
      throw new Error('Invalid response format')
    }
  },
  
  google: {
    test: (url) => url.includes('google') || url.includes('generativelanguage'),
    requestAdapter: (messages, config) => ({
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        topP: config.topP,
        topK: config.topK,
      }
    }),
    responseParser: (data) => {
      if (data.candidates && data.candidates[0]) {
        return data.candidates[0].content.parts[0].text
      }
      throw new Error('Invalid response format')
    }
  }
}

// 模型能力标签
export const MODEL_CAPABILITIES = {
  'text': '文本生成',
  'vision': '图像理解',
  'function-calling': '函数调用',
  'code': '代码生成',
  'math': '数学推理',
  'long-context': '长文本',
  'multilingual': '多语言',
  'fast': '快速响应',
  'cheap': '经济实惠',
  'free': '免费使用'
}

// 参数配置模板
export const PARAMETER_TEMPLATES = {
  creative: {
    name: '创意模式',
    temperature: 0.9,
    topP: 0.95,
    presencePenalty: 0.5,
    frequencyPenalty: 0.5,
    description: '更有创造力和想象力的回复'
  },
  
  balanced: {
    name: '平衡模式',
    temperature: 0.7,
    topP: 0.9,
    presencePenalty: 0,
    frequencyPenalty: 0,
    description: '平衡创造性和准确性'
  },
  
  precise: {
    name: '精确模式',
    temperature: 0.3,
    topP: 0.5,
    presencePenalty: 0,
    frequencyPenalty: 0,
    description: '更准确和一致的回复'
  },
  
  deterministic: {
    name: '确定模式',
    temperature: 0,
    topP: 1,
    presencePenalty: 0,
    frequencyPenalty: 0,
    description: '每次都返回相同的结果'
  }
}