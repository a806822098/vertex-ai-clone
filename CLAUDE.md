# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Transfer Station Manager (AI中转站管理器) - a React-based chat interface specifically designed for Chinese developers to manage and connect to multiple custom AI/LLM API endpoints. The application provides complete flexibility to configure any compatible API without hardcoded provider restrictions.

## 🎮 Git快捷命令（超级小白版）

### 日常使用只需记住这三个词：
- 想保存进度时说：**'保存一下'** 或 **'save'**
- 想备份到云端时说：**'备份到GitHub'** 或 **'backup'**
- 想看历史记录时说：**'显示历史'** 或 **'history'**
- 想撤销更改时说：**'撤销'** 或 **'undo'**

### Claude会自动理解并执行：
- '保存' / '存一下' / 'save' → 执行 `./save.sh`
- '备份' / '上传' / '推送' / 'backup' → 执行 `./backup.sh`
- '撤销' / '退回' / 'undo' → 执行 `./undo.sh`
- '历史' / '记录' / 'log' → 执行 `./history.sh`

### 智能理解功能：
- "恢复到[时间]的版本" → 自动查找并恢复到指定时间的版本
- "这个文件是什么时候改的" → 查询特定文件的修改历史
- "最近改了什么" → 显示最近的更改内容
- "回到昨天的版本" → 智能识别时间并恢复

### 自动化行为：
- 每次重大修改后会提醒您备份
- 检测到大量删除时自动创建备份点
- 发现代码冲突时提供解决方案
- 定期提醒您查看未提交的更改

## Key Commands

```bash
# Development (using pnpm)
pnpm dev          # Start development server on http://localhost:5173
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
```

## Architecture

### Component Structure
The application uses a component-based architecture with state management via Zustand:

- **App.jsx** - Root component managing global state (conversations, authentication)
- **ChatInterface.jsx** - Main chat UI handling message display and API calls with streaming support
- **Header.jsx** - Shows current model and provides access to model configuration
- **Sidebar.jsx** - Conversation list and navigation
- **PasswordModal.jsx** - Master password input for encryption
- **MessageWrapper.jsx** - Enhanced message display with timestamps and copy functionality
- **MessageContent.jsx** - Markdown renderer with syntax highlighting
- **LoadingDots.jsx** - Animated loading indicator
- **ModelConfig/ModelList.jsx** - Complete model management interface
- **ModelConfig/ModelConfigDialog.jsx** - Add/Edit model form with API testing
- **ai-studio/ModelSelector.jsx** - Custom model selection dropdown

### State Management
- **Zustand store** for model management (modelStore.js)
- Custom models persisted in localStorage
- API configuration managed through model store
- Conversation data managed centrally in App component
- Message history persisted in localStorage per conversation

### API Integration
- **utils/api.js** - Unified API handler supporting any custom endpoints
- No hardcoded providers - fully customizable
- Users configure their own API endpoints and authentication
- Auto-detects API format from endpoint URL
- Handles different request/response formats automatically
- **Streaming support** for real-time responses
- API connection testing built into model configuration

## Project Structure

```
src/
├── components/       # All React components
│   ├── ai-studio/   # AI configuration panels
│   ├── prompt-library/ # Prompt management
│   └── shared/      # Reusable components
├── styles/          # Custom CSS files
├── utils/           # API and utility functions
├── App.jsx          # Root component with global state
├── main.jsx         # Entry point
└── index.css        # Tailwind imports and utilities
```

## Development Notes

- Vite for fast HMR and builds
- ESLint configured for React development
- Production-ready code quality

## Security Features

- API keys are encrypted using Web Crypto API (AES-GCM)
- Master password required on app startup
- Encrypted data stored in localStorage
- Password hashing with PBKDF2 for key derivation

## Future Enhancements

- [ ] Model fine-tuning interface
- [ ] Agent Builder functionality

### ✅ 已实现的中转调用功能
1. **自定义模型配置界面**
   ```javascript
   // 模型数据结构 (src/stores/modelStore.js)
   {
     id: string,
     name: string,           // 如 "gemini-2.5-pro"
     apiEndpoint: string,    // 如 "https://new.nexai.it.com/v1"
     apiKey: string,         // 如 "sk-xy8WhgXk8kC5MO7xMIGNuAzOfl7GZPhmCQEnXJ7IlLPFiae4"
     apiPath: string,        // 如 "/chat/completions"
     enabled: boolean,       // 启用/禁用开关
     description: string,    // 模型描述
     maxTokens: number,      // 最大令牌数
     contextWindow: number,  // 上下文窗口大小
   }
   ```

2. **模型管理功能** ✅
   - 添加模型按钮 (✅ 已实现)
   - 编辑模型 (✅ 已实现)
   - 删除模型 (✅ 已实现)
   - 复制API Key (✅ 已实现)
   - 检查连接 (✅ 已实现)

3. **参数配置面板**
   - maxTokens: 滑块 0-65536
   - temperature: 滑块 0-2
   - topP: 滑块 0-1
   - contextWindow: 输入框 0-2097152

## 🏗️ 实现架构
```
src/
├── components/
│   ├── ModelConfig/
│   │   ├── ModelConfigDialog.tsx    # 配置弹窗
│   │   ├── ModelList.tsx           # 模型列表
│   │   └── ModelForm.tsx           # 表单组件
│   └── ModelSelector/
│       └── ModelSelector.tsx        # 重构为只显示自定义模型
├── stores/
│   └── modelStore.ts               # Zustand store for models
├── utils/
│   └── apiTester.ts                # API连接测试工具
└── hooks/
    └── useModels.ts                # 模型管理hooks
```

## 💾 数据持久化
```typescript
// 使用 localStorage 存储配置
const MODEL_STORAGE_KEY = 'vertex-ai-clone-models';

// 存储结构
{
  models: CustomModel[],
  activeModelId: string,
  settings: {
    maxTokens: number,
    temperature: number,
    // ...
  }
}
```

# Vertex AI Clone - **本次任务最高权重**：紧急崩溃恢复程序

## 🚨 当前危机状态
- **严重程度**: P0 - 系统完全不可用
- **症状**: 基础对话功能崩溃
- **错误**: Assertion: Unexpected value for children prop
- **影响**: 100%功能失效

## 🔥 紧急诊断清单

### 立即检查项
1. **React基础架构**
   - children prop类型错误是React最基础的问题
   - 可能整个组件树都有问题
   - TypeScript配置可能失效

2. **核心功能缺失**
   - 对话组件是否存在？
   - 消息状态管理在哪？
   - API调用逻辑是否实现？

3. **项目完整性**
   - package.json依赖是否正确
   - 是否有关键文件缺失
   - 构建配置是否正确

## 🏥 紧急修复流程

### Phase 1: 止血（5分钟）
```bash
# 1. 检查项目是否能启动
npm run dev || yarn dev || pnpm dev

# 2. 查看控制台完整错误
# 3. 定位崩溃组件
# 4. 临时注释问题代码
```

### Phase 2: 诊断（10分钟）
```typescript
// 核心组件健康检查
const healthCheck = {
  // 1. 对话组件是否存在
  chatComponent: Boolean(ChatWindow),
  
  // 2. 消息类型定义是否正确
  messageTypes: {
    user: 'string',
    assistant: 'string',
    system: 'string'
  },
  
  // 3. 状态管理是否初始化
  storeInitialized: Boolean(useStore),
  
  // 4. API配置是否存在
  apiConfigured: Boolean(apiClient)
};
```

### Phase 3: 重建（30分钟）
如果基础架构损坏，需要重建核心功能：

```typescript
// 最小可行对话系统
interface MinimalViableChat {
  // 1. 消息数据结构
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  }>;
  
  // 2. 发送消息
  sendMessage: (content: string) => Promise<void>;
  
  // 3. 渲染消息
  renderMessage: (message: Message) => ReactNode;
  
  // 4. API调用
  callAPI: (messages: Message[]) => Promise<Response>;
}
```

## 🔧 从零开始的核心功能

### 1. 基础消息组件
```tsx
// 防御性编程 - 处理所有可能的输入
const MessageComponent: React.FC<{children: any}> = ({children}) => {
  // 确保children是字符串
  const content = typeof children === 'string' 
    ? children 
    : JSON.stringify(children);
    
  return <div className="message">{content}</div>;
};
```

### 2. 最小状态管理
```typescript
const useChatStore = create((set) => ({
  messages: [],
  apiEndpoint: '',
  apiKey: '',
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now().toString(),
      timestamp: Date.now()
    }]
  })),
  
  setApiConfig: (endpoint, key) => set({
    apiEndpoint: endpoint,
    apiKey: key
  })
}));
```

### 3. 基础API调用
```typescript
const callLLM = async (messages, config) => {
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model: config.model || 'gpt-3.5-turbo',
        stream: true
      })
    });
    
    if (!response.ok) throw new Error(`API call failed: ${response.status}`);
    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};
```

## 📋 功能恢复优先级

1. **P0 - 立即修复**
   - [ ] 应用能启动不崩溃
   - [ ] 能输入和显示文本
   - [ ] 基础UI能渲染

2. **P1 - 基础功能**
   - [ ] 能发送消息到API
   - [ ] 能接收和显示响应
   - [ ] 能配置API endpoint

3. **P2 - 核心功能**
   - [ ] 流式响应
   - [ ] 错误处理
   - [ ] 基础设置界面

## 🎯 成功标准
- 能进行基础对话 ✓
- 不再有崩溃错误 ✓
- API调用正常工作 ✓
```


总之，请像真正的工程师一样工作：
- 遇到问题就修复
- 需要安装依赖就安装
- 需要重构就重构
- 完成后启动项目验证
- 其他问题也具体情况具体分析，举例是永远举不尽的！

开始你的工作吧，我完全信任你的判断！！！
