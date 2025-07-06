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

### Styling
- Tailwind CSS v3 for all styling
- Utility classes only, no custom CSS
- **Consistent dark theme** (Vertex AI inspired)
- Custom code highlighting theme

## Recent Improvements

### 🎯 Enhanced Features
1. **Streaming Response Support**
   - Real-time message streaming for supported APIs
   - Toggle in AI Studio panel
   - Visual streaming indicator

2. **Markdown & Code Highlighting**
   - Full GFM (GitHub Flavored Markdown) support
   - Syntax highlighting for code blocks
   - Copy button for code snippets
   - Custom dark theme for code

3. **Updated Model Support**
   - Added Gemini 2.0/2.5 series models
   - Accurate context windows (up to 2M tokens)
   - Proper pricing information

4. **UI/UX Improvements**
   - Unified dark theme across all components
   - Message timestamps with relative time
   - Copy message functionality
   - Enhanced keyboard shortcuts (Enter/Cmd+Enter)
   - Better loading animations
   - Improved error handling

5. **Prompt Library Integration**
   - Fully functional prompt management
   - Import/export capabilities
   - Search and filtering
   - Dark theme consistency

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

- Pure frontend application (no backend)
- Vite for fast HMR and builds
- React 19 with latest features
- ESLint configured for React development
- Production-ready code quality

## Security Features

- API keys are encrypted using Web Crypto API (AES-GCM)
- Master password required on app startup
- Encrypted data stored in localStorage
- Password hashing with PBKDF2 for key derivation

## Performance Optimizations

- Efficient re-renders with proper React patterns
- Debounced search inputs
- Lazy loading for heavy components
- Optimized bundle size with tree shaking

## Future Enhancements

- [ ] Model fine-tuning interface
- [ ] Agent Builder functionality

# 🎯 **新增**产品愿景
不再是Google Vertex AI的复制品，而是为中国开发者打造的"终极AI中转站管理器"

## 🏗️ 核心设计原则
- **本土化优先**: 100%中文界面，符合国内开发者习惯
- **极致自由度**: 所有参数可配置，支持任意模型和endpoint

## 🎯 最大目标
自定义API中转站配置

## 🔍 当前问题诊断
1. **问题**: 模型选择器中"自定义"为空，无添加入口
2. **原因**: 硬编码了provider列表，未实现动态配置
3. **影响文件**: 
   - src/components/ModelSelector.tsx (或类似)
   - src/providers/models.ts (或类似)
   - src/store/configStore.ts (或类似)

## 📋 精确需求规格
### 必须删除的内容
- 所有预设provider (OpenAI, Anthropic, Google)
- 所有价格相关UI和逻辑
- 所有benchmark相关功能
- 所有使用统计功能

### ✅ 已实现的功能
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

## 🎨 UI规范
- 主色调: #1a1a1a (深色背景)
- 强调色: #3b82f6 (蓝色按钮)
- 字体: Inter, "Microsoft YaHei"
- 所有文本必须中文
- 使用 Tailwind CSS classes

## ✅ 验收标准 (已完成)
1. ✅ 完全移除所有预设provider
2. ✅ 可以添加/编辑/删除自定义模型
3. ✅ 配置数据本地持久化 (使用Zustand + localStorage)
4. ✅ UI完全中文化
5. ✅ 支持参数范围自定义

## 🔧 核心功能模块
1. **中转站配置中心**
   - 可视化添加/编辑/删除API配置
   - 支持批量导入导出配置
   - 配置模板编辑（用户自行预设其常用的中转站）

2. **模型必须能做到自由选择**
   - 动态加载模型列表
   - 自定义模型参数范围
   - 模型能力标签系统
   - 流式响应优化
   - 对话历史云同步


总之，请像真正的工程师一样工作：
- 遇到问题就修复
- 需要安装依赖就安装
- 需要重构就重构
- 完成后启动项目验证
- 其他问题也具体情况具体分析，举例是永远举不尽的！

开始你的工作吧，我完全信任你的判断！！！
