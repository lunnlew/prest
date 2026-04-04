# Prest 技术规范文档

## 1. 架构设计

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│  │   Sidebar   │  │     Editor Panel    │  │  Preview Panel  │  │
│  │   Panel     │  │  ┌───────────────┐  │  │                 │  │
│  │             │  │  │    Toolbar    │  │  │  react-markdown │  │
│  │  - Files    │  │  ├───────────────┤  │  │       +         │  │
│  │  - Search   │  │  │    Monaco     │  │  │  Pretext Layout │  │
│  │  - Outline  │  │  │    Editor     │  │  │                 │  │
│  │  - Settings │  │  ├───────────────┤  │  │                 │  │
│  │             │  │  │  Status Bar   │  │  │                 │  │
│  └─────────────┘  │  └───────────────┘  │  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                       State Management                          │
│                     Zustand Store (Slices)                      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────────┐  │
│  │  Editor   │ │  Preview  │ │  Layout   │ │     Settings    │  │
│  │  Slice    │ │   Slice   │ │   Slice   │ │      Slice      │  │
│  └───────────┘ └───────────┘ └───────────┘ └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Services Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ PretextService  │  │ MarkdownParser  │  │ StorageService  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Core Libraries                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │    Pretext      │  │  Monaco Editor  │  │  react-markdown │  │
│  │  (Text Layout)  │  │   (Editing)     │  │   (Rendering)   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 组件层次结构

```
App
└── AppLayout
    ├── PanelGroup (horizontal)
    │   ├── SidebarPanel
    │   │   ├── ActivityBar (图标栏)
    │   │   └── SidebarContent
    │   │       ├── FileExplorer
    │   │       ├── SearchPanel
    │   │       ├── OutlineView
    │   │       └── SettingsPanel
    │   │
    │   ├── EditorPanel
    │   │   ├── EditorToolbar
    │   │   ├── MonacoEditor
    │   │   └── EditorStatusBar
    │   │
    │   └── PreviewPanel
    │       ├── PreviewHeader
    │       └── MarkdownPreview
    │
    └── ResizeHandle (可拖拽分隔线)
```

## 2. 状态管理规范

### 2.1 Store 结构

采用 Zustand Slices Pattern 进行模块化管理：

```typescript
interface AppStore {
  // Editor Slice - 编辑器状态
  content: string                    // Markdown 内容
  cursorPosition: { line, column }   // 光标位置
  selection: { start, end } | null   // 选区
  undoStack: string[]                // 撤销栈
  redoStack: string[]                // 重做栈
  isDirty: boolean                   // 是否有未保存更改
  currentFile: string | null         // 当前文件ID

  // Preview Slice - 预览状态
  scrollPosition: number             // 滚动位置
  syncScroll: boolean                // 同步滚动开关
  layoutResults: Map<string, LayoutResult>  // Pretext 布局结果
  previewWidth: number               // 预览区宽度

  // Layout Slice - 布局状态
  sidebarVisible: boolean            // 侧边栏可见性
  previewVisible: boolean            // 预览区可见性
  panelLayout: number[]              // 面板布局百分比
  activeSidebarTab: string           // 当前侧边栏标签

  // Sidebar Slice - 侧边栏状态
  files: FileNode[]                  // 文件树
  expandedFolders: Set<string>       // 展开的文件夹
  searchQuery: string                // 搜索关键词

  // Settings Slice - 设置状态
  settings: {
    theme: 'light' | 'dark'
    editor: EditorSettings
    syncScroll: boolean
    autoSave: boolean
  }
}
```

### 2.2 状态持久化策略

```typescript
// 使用 Zustand persist 中间件
persist(store, {
  name: 'prest-storage',
  partialize: (state) => ({
    content: state.content,
    panelLayout: state.panelLayout,
    settings: state.settings,
    sidebarVisible: state.sidebarVisible,
    previewVisible: state.previewVisible,
    expandedFolders: Array.from(state.expandedFolders),
  }),
})
```

## 3. Pretext 文本布局引擎

### 3.1 核心概念

Pretext 是一个纯 JavaScript 文本测量库，主要功能：
- **无 DOM 测量** - 使用 Canvas 进行文本测量
- **高性能** - 避免 layout reflow
- **精确布局** - 计算文本高度、行数、行宽

### 3.2 API 设计

```typescript
// 准备文本 - 一次性测量
function prepare(text: string, font: string): PreparedText

// 计算布局 - 纯算术运算
function layout(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number }

// 获取行信息
function layoutWithLines(
  prepared: PreparedText,
  maxWidth: number,
  lineHeight: number
): { height: number; lineCount: number; lines: LayoutLine[] }
```

### 3.3 使用场景

1. **预览区高度预计算** - 在渲染前知道文本高度
2. **编辑器-预览同步滚动** - 建立行号到滚动位置的映射
3. **响应式布局** - 窗口调整时快速重算

## 4. Monaco Editor 集成规范

### 4.1 语言定义

自定义 Markdown 语言 `markdown-prest`，支持：
- 标题（# 标题）
- 粗体（**文本**）
- 斜体（*文本*）
- 删除线（~~文本~~）
- 代码块（```语言）
- 行内代码（`代码`）
- 链接（[文本](URL)）
- 图片（![alt](URL)）
- 引用块（> 文本）
- 列表（- 项目）
- 分隔线（---）

### 4.2 主题配置

```typescript
// 深色主题
monaco.editor.defineTheme('prest-dark', {
  base: 'vs-dark',
  rules: [
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'strong', foreground: '4EC9B0', fontStyle: 'bold' },
    { token: 'emphasis', foreground: 'CE9178', fontStyle: 'italic' },
    // ...
  ],
})

// 浅色主题
monaco.editor.defineTheme('prest-light', {
  base: 'vs',
  // ...
})
```

### 4.3 快捷键绑定

| 快捷键 | 功能 |
|--------|------|
| Ctrl+B | 切换粗体 |
| Ctrl+I | 切换斜体 |
| Ctrl+S | 保存 |
| Ctrl+Shift+P | 命令面板 |

## 5. 样式规范

### 5.1 CSS 变量

```css
:root {
  /* 亮色主题 */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f3f3;
  --text-primary: #1e1e1e;
  --border-color: #e0e0e0;
  --accent-color: #0078d4;
}

.dark {
  /* 暗色主题 - VSCode 风格 */
  --bg-primary: #1e1e1e;
  --bg-secondary: #252526;
  --text-primary: #cccccc;
  --border-color: #3c3c3c;
  --accent-color: #0078d4;
}
```

### 5.2 Tailwind 配置

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      colors: {
        vscode: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          panel: '#2d2d2d',
          border: '#3c3c3c',
          text: '#cccccc',
          accent: '#0078d4',
        }
      }
    }
  }
}
```

## 6. 性能规范

### 6.1 渲染性能目标

| 指标 | 目标值 |
|------|--------|
| 首屏加载 | < 1s |
| 编辑响应 | < 16ms (60fps) |
| 预览渲染 | < 100ms |
| 面板调整 | < 50ms |

### 6.2 优化策略

1. **代码分割**
   - Monaco Editor 单独打包
   - Markdown 渲染器单独打包
   - 动态导入非关键组件

2. **渲染优化**
   - 使用 React.memo 避免不必要的重渲染
   - 防抖处理频繁更新（搜索、预览更新）
   - 虚拟滚动（大型文档）

3. **状态优化**
   - Zustand 选择器精确订阅
   - 避免不必要的状态更新

## 7. 构建规范

### 7.1 Vite 配置

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' }
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor', '@monaco-editor/react'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-raw'],
          panels: ['react-resizable-panels'],
          state: ['zustand'],
        }
      }
    }
  }
})
```

### 7.2 TypeScript 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

## 8. 扩展性设计

### 8.1 插件系统（规划中）

```typescript
interface Plugin {
  name: string
  version: string
  activate(context: PluginContext): void
  deactivate(): void
}
```

### 8.2 自定义渲染器

支持自定义 Markdown 组件渲染：

```typescript
<Markdown
  components={{
    code: CustomCodeBlock,
    img: CustomImage,
    a: CustomLink,
  }}
>
  {content}
</Markdown>
```

## 9. 错误处理规范

### 9.1 错误边界

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // 记录错误
    console.error('Application error:', error, errorInfo)
    // 可选：发送到错误监控服务
  }
}
```

### 9.2 用户反馈

- 加载状态：显示加载指示器
- 错误状态：显示友好的错误信息
- 空状态：显示引导提示

## 10. 安全规范

### 10.1 XSS 防护

- 使用 `rehype-sanitize` 清理 HTML
- 禁止内联脚本执行
- 外部链接使用 `rel="noopener noreferrer"`

### 10.2 内容安全

- 图片懒加载
- 限制资源大小
- 禁止自动执行脚本