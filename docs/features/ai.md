# AI 功能详细文档

## 概述

Prest 编辑器集成 AI 写作助手功能，支持自定义 API 后端（兼容 OpenAI 格式），可进行 AI 对话、文本润色、翻译、总结等操作。

## 功能列表

### 1. AI 开关控制

| 功能 | 状态 | 说明 |
|------|------|------|
| 设置面板 AI 开关 | ✅ | AI 设置默认关闭，需要手动开启 |
| AI 面板条件渲染 | ✅ | 关闭时 AI 浮动按钮和对话框不显示 |
| 设置持久化 | ✅ | `aiEnabled` 保存到 localStorage |

### 2. AI 配置

| 功能 | 状态 | 说明 |
|------|------|------|
| API Endpoint | ✅ | 自定义 API 地址（支持 OpenAI 兼容格式） |
| API Key | ✅ | API 密钥（存储在 localStorage） |
| Model | ✅ | 模型名称（如 gpt-3.5-turbo） |
| Temperature | ✅ | 0-2 随机性调节滑块 |
| Max Tokens | ✅ | 最大生成 token 数 |

### 3. AI 对话面板

| 功能 | 状态 | 说明 |
|------|------|------|
| 浮动面板 | ✅ | 固定在编辑器下方 |
| 高度可调 | ✅ | 支持拖拽调整（200px - 600px） |
| 消息持久化 | ✅ | 对话消息保存到 localStorage |
| 高度持久化 | ✅ | 面板高度保存到 localStorage |
| 消息时间戳 | ✅ | 每条消息显示发送时间 |
| 消息复制 | ✅ | 点击复制按钮复制消息内容 |
| 打字动画 | ✅ | AI 响应时显示加载动画 |

### 4. 快捷命令

| 功能 | 状态 | 快捷键 | 说明 |
|------|------|--------|------|
| 总结 | ✅ | Ctrl+Shift+S | 总结选中文本 |
| 翻译 | ✅ | — | 翻译选中文本 |
| 润色 | ✅ | — | 润色选中文本 |
| 解释 | ✅ | — | 解释选中文本 |
| 续写 | ✅ | — | 续写光标后内容 |

### 5. 编辑器集成

| 功能 | 状态 | 说明 |
|------|------|------|
| 右键菜单 AI 操作 | ✅ | 选中文字后右键显示 AI 操作 |
| 插入到编辑器 | ✅ | 将 AI 回复插入到光标位置 |
| 替换选中内容 | ✅ | 用 AI 回复替换选中文本 |
| 选择状态检测 | ✅ | 有选中文本时显示替换按钮 |

### 6. AI 对话功能

| 功能 | 状态 | 说明 |
|------|------|------|
| 流式响应 | ✅ | OpenAI SDK 流式输出 |
| 自定义 API | ✅ | 支持 DashScope、OpenAI 等兼容 API |
| 错误处理 | ✅ | API 错误时显示错误消息 |
| 空消息防护 | ✅ | 防止重复提交 |

## 文件结构

```
src/
├── components/editor/
│   ├── AIChatPanel.tsx      # AI 对话面板组件
│   └── MonacoEditor.tsx     # 编辑器 AI 右键菜单
├── services/
│   └── AIService.ts         # AI API 调用服务（OpenAI SDK）
├── stores/
│   ├── aiSlice.ts           # AI 状态管理
│   └── useBoundStore.ts     # Store 持久化配置
├── types/
│   └── index.ts             # AI 类型定义
└── locales/
    ├── index.ts              # 翻译键定义
    └── data/
        ├── zh-CN.json        # 中文翻译
        └── en.json           # 英文翻译

docs/features/
└── ai.md                    # 本文档
```

## 类型定义

### AIConfig

```typescript
interface AIConfig {
  provider: 'openai' | 'claude' | 'custom'
  apiEndpoint: string      // API 地址
  apiKey: string           // API Key
  model: string            // 模型名称
  temperature: number       // 0-2
  maxTokens: number        // 最大 token 数
}
```

### AIMessage

```typescript
interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}
```

## 使用方式

### 1. 启用 AI 功能

1. 进入设置面板
2. 找到「AI 设置」区域
3. 开启顶部开关
4. 填写 API Endpoint、API Key、Model 等配置
5. 保存后 AI 浮动按钮将显示

### 2. AI 对话

1. 点击右下角 AI 按钮打开对话面板
2. 在输入框中输入问题或指令
3. 按 Enter 或点击发送按钮
4. 等待 AI 回复

### 3. 快捷命令

1. 选中编辑器中的文字
2. 点击快捷命令按钮（总结/翻译/润色/解释）
3. 或使用右键菜单选择 AI 操作
4. AI 将根据命令处理选中文本

### 4. 插入结果

1. AI 回复完成后，点击「Insert」插入到编辑器
2. 如果有选中文本，可点击「Replace」替换

## CSP 配置

AI API 请求需要在 `vite.config.ts` 和 `index.html` 中添加域名到 CSP 白名单：

```typescript
// vite.config.ts
connect-src 'self' https://*.openai.com https://*.anthropic.com https://*.deepseek.com https://*.mistral.ai https://dashscope.aliyuncs.com https://*.aliyun.com;
```

## 本地存储

| Key | 内容 | 说明 |
|-----|------|------|
| `prest-ai-chat-messages` | JSON 数组 | AI 对话消息 |
| `prest-ai-chat-height` | 数字 | AI 面板高度(px) |
| `prest-storage` | JSON 对象 | 包含 AI 配置和开关状态 |

## 已知问题

- 选择区视觉宽度与实际字符宽度不一致（Monaco 内部问题，输入字符后恢复正常）

## 更新日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.9.0 | 2026-04-06 | AI 功能集成基础版本 |
| v0.9.1 | 2026-04-07 | 添加高度可调、消息持久化、AI 开关控制 |
