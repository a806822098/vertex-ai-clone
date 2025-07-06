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

# Vertex AI Clone - **本次任务最高权重**：UI细节完美主义手册

## 🔍 UI问题诊断清单

### 已知严重问题
1. **图标遮挡问题**
   - 位置：主界面右下角
   - 症状：“当前模型：xxx”被"打开提示词库"按钮及文字遮挡
   - 影响：功能可见性受损，用户体验极差
   - 优先级：P0 - 必须立即修复

2. **功能不对称问题**
   - 位置：模型管理界面（配置自定义AI模型）
   - 症状：只有"添加"没有"删除"功能
   - 影响：模型列表会无限增长，无法管理
   - 优先级：P0 - 核心功能缺失

### UI设计原则
- **视觉层级**: 重要元素永不被遮挡
- **功能完整性**: CRUD操作必须完整
- **交互一致性**: 相似功能相似操作
- **错误防护**: 破坏性操作需二次确认

## 🎯 像素级标准

### Z-index 层级规范
```css
/* 层级管理规范 */
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal-backdrop: 1040;
--z-modal: 1050;
--z-popover: 1060;
--z-tooltip: 1070;
--z-notification: 1080;
```

### 间距系统
- 最小可点击区域: 44x44px (移动端) / 32x32px (桌面端)
- 元素间最小间距: 8px的倍数
- 悬浮元素边距: 至少16px远离边界

### 响应式断点
- 移动端: < 640px
- 平板: 640px - 1024px  
- 桌面: > 1024px

## 🔧 UI组件标准

### 按钮组件规范
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  // 防止遮挡的关键属性
  zIndex?: number;
  priority?: 'high' | 'normal' | 'low';
}
```

### 模型管理组件需求
```typescript
interface ModelManagerProps {
  models: Model[];
  onAdd: (model: Model) => void;
  onEdit: (id: string, model: Model) => void;
  onDelete: (id: string) => void; // 必须实现！
  onReorder?: (models: Model[]) => void;
}
```

## 🚨 UI测试检查点

1. **遮挡测试**
   - 所有浮动元素是否正确分层
   - 响应式布局下是否有元素重叠
   - 动画过程中是否产生遮挡

2. **功能完整性测试**
   - 每个列表都有增删改查
   - 每个表单都有重置和提交
   - 每个模态框都有关闭方式

3. **可访问性测试**
   - 键盘导航是否完整
   - 屏幕阅读器是否友好
   - 对比度是否符合WCAG标准

## 💎 UI优化机会

### 快速改进项
- 使用 CSS Grid 避免浮动元素遮挡
- 实现智能 tooltip 定位（避开边界）
- 添加键盘快捷键提升效率

### 创新改进项  
- 手势操作支持（滑动删除）
- 批量操作模式
- 撤销/重做系统
- 实时协作光标

## 🎨 视觉升级指南

### 现代化配色方案
```css
:root {
  /* 主色调 - 中国红与科技蓝 */
  --primary-50: #fef2f2;
  --primary-500: #ef4444;
  --primary-900: #7f1d1d;
  
  /* 暗色模式优先 */
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --bg-tertiary: #262626;
  
  /* 玻璃态效果 */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
}
```

### 微动效库
- 悬停效果: scale(1.02) + 阴影
- 点击反馈: scale(0.98) + 涟漪
- 页面过渡: fade + slide
- 加载动画: 骨架屏 + 脉冲

## 📝 UI改进记录模板
使用 # 记录每个UI改进：
# UI修复：[组件名] - [问题描述] - [解决方案]
# UI创新：[功能名] - [创新点] - [用户价值]
# UI债务：[技术债] - [影响范围] - [修复计划]
```

总之，请像真正的工程师一样工作：
- 遇到问题就修复
- 需要安装依赖就安装
- 需要重构就重构
- 完成后启动项目验证
- 其他问题也具体情况具体分析，举例是永远举不尽的！

开始你的工作吧，我完全信任你的判断！！！
