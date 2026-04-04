# Prest 任务计划文档

## 1. 项目概览

### 1.1 项目信息

| 项目 | 内容 |
|------|------|
| 项目名称 | Prest - VSCode 风格 Markdown 编辑器 |
| 开始日期 | 2026-04-04 |
| 完成日期 | 2026-04-04 |
| 技术栈 | React + TypeScript + Vite |
| 总任务数 | 35 |
| 已完成 | 35 (100%) |
| 状态 | 已完成基础版本 |

### 1.2 里程碑

| 里程碑 | 目标 | 状态 | 完成日期 |
|--------|------|------|----------|
| M1 | 项目初始化和基础配置 | 完成 | 2026-04-04 |
| M2 | 核心状态管理实现 | 完成 | 2026-04-04 |
| M3 | Pretext 服务实现 | 完成 | 2026-04-04 |
| M4 | 布局组件实现 | 完成 | 2026-04-04 |
| M5 | Monaco Editor 集成 | 完成 | 2026-04-04 |
| M6 | Markdown 预览实现 | 完成 | 2026-04-04 |
| M7 | 侧边栏组件实现 | 完成 | 2026-04-04 |
| M8 | 样式和主题实现 | 完成 | 2026-04-04 |

### 1.3 任务时间线

```
Phase 1: 项目初始化
├── Task 1.1: 基础配置 ──────────── 10:00 ✅
└── Task 1.2: 入口文件 ──────────── 10:30 ✅

Phase 2: 状态管理
├── Task 2.1: 类型定义 ──────────── 11:00 ✅
└── Task 2.2: Zustand Stores ────── 11:30 ✅

Phase 3: 服务层
├── Task 3.1: Pretext 服务 ──────── 12:00 ✅
└── Task 3.2: Markdown 解析 ─────── 12:30 ✅

Phase 4: 布局组件
├── Task 4.1: 主布局 ─────────────── 13:00 ✅

Phase 5: 编辑器组件
├── Task 5.1: Monaco Editor ──────── 14:00 ✅

Phase 6: 预览组件
├── Task 6.1: Markdown 预览 ──────── 15:00 ✅

Phase 7: 侧边栏组件
├── Task 7.1: 文件浏览器 ─────────── 16:00 ✅
├── Task 7.2: 大纲视图 ───────────── 16:30 ✅
├── Task 7.3: 搜索面板 ───────────── 17:00 ✅
└── Task 7.4: 设置面板 ───────────── 17:30 ✅

Phase 8: 样式和主题
├── Task 8.1: CSS 变量 ──────────── 18:00 ✅
└── Task 8.2: Tailwind ───────────── 18:30 ✅
```

## 2. 任务分解

### 2.1 Phase 1: 项目初始化

#### Task 1.1: 创建项目基础配置 ✅

**描述:** 创建项目的基础配置文件

**子任务：**

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| 1.1.1 | 创建 package.json | `package.json` | ✅ |
| 1.1.2 | 创建 vite.config.ts | `vite.config.ts` | ✅ |
| 1.1.3 | 创建 tsconfig.json | `tsconfig.json` | ✅ |
| 1.1.4 | 创建 tsconfig.node.json | `tsconfig.node.json` | ✅ |
| 1.1.5 | 创建 index.html | `index.html` | ✅ |
| 1.1.6 | 创建 postcss.config.js | `postcss.config.js` | ✅ |
| 1.1.7 | 创建 tailwind.config.js | `tailwind.config.js` | ✅ |

**关键配置：**
```json
// package.json 核心依赖
{
  "@monaco-editor/react": "^4.7.0",
  "react-markdown": "^9.0.1",
  "react-resizable-panels": "^2.0.0",
  "zustand": "^5.0.0"
}
```

**完成日期:** 2026-04-04

---

#### Task 1.2: 创建入口文件 ✅

**描述:** 创建应用入口和基础样式

**子任务：**

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| 1.2.1 | 创建 main.tsx | `src/main.tsx` | ✅ |
| 1.2.2 | 创建 App.tsx | `src/App.tsx` | ✅ |
| 1.2.3 | 创建 globals.css | `src/styles/globals.css` | ✅ |
| 1.2.4 | 创建 vite-env.d.ts | `src/vite-env.d.ts` | ✅ |

**完成日期:** 2026-04-04

---

### 2.2 Phase 2: 状态管理

#### Task 2.1: 创建类型定义 ✅

**描述:** 定义 TypeScript 类型

**文件:** `src/types/index.ts`

**定义内容：**
```typescript
interface EditorState {
  content: string
  cursorPosition: CursorPosition
  undoStack: string[]
  redoStack: string[]
}

interface LayoutState {
  panelLayout: number[]
  sidebarVisible: boolean
  previewVisible: boolean
}
```

**完成日期:** 2026-04-04

---

#### Task 2.2: 创建 Zustand Stores ✅

**描述:** 实现状态管理

**子任务：**

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| 2.2.1 | editorSlice | `src/stores/editorSlice.ts` | ✅ |
| 2.2.2 | previewSlice | `src/stores/previewSlice.ts` | ✅ |
| 2.2.3 | layoutSlice | `src/stores/layoutSlice.ts` | ✅ |
| 2.2.4 | sidebarSlice | `src/stores/sidebarSlice.ts` | ✅ |
| 2.2.5 | settingsSlice | `src/stores/settingsSlice.ts` | ✅ |
| 2.2.6 | useBoundStore | `src/stores/useBoundStore.ts` | ✅ |
| 2.2.7 | stores/index.ts | `src/stores/index.ts` | ✅ |

**完成日期:** 2026-04-04

---

### 2.3 Phase 3: 服务层

#### Task 3.1: 实现 Pretext 服务 ✅

**描述:** 封装 Pretext 文本布局引擎

**文件:**
- `src/lib/pretext.ts` - 本地 Pretext 实现
- `src/services/PretextService.ts` - 服务封装

**核心功能:**
- [x] prepare() - 文本预处理
- [x] layout() - 布局计算
- [x] layoutWithLines() - 获取行信息
- [x] calculateTotalHeight() - 总高度计算
- [x] calculateScrollMapping() - 滚动映射

**核心 API：**
```typescript
// lib/pretext.ts
export function prepare(text: string): PreparedText
export function layout(text: PreparedText, width: number): LayoutResult
export function layoutWithLines(text: PreparedText, width: number): LayoutWithLines

// services/PretextService.ts
export class PretextService {
  prepareBlock(block: TextBlock): PreparedText
  calculateLayout(prepared: PreparedText, width: number): LayoutResult
  calculateScrollMapping(editorLines, previewBlocks): Map<number, number>
}
```

**问题解决：** @chenglou/pretext npm 包不存在，创建本地实现

**完成日期:** 2026-04-04

---

#### Task 3.2: 实现 Markdown 解析服务 ✅

**描述:** Markdown 解析工具

**文件:** `src/services/MarkdownParser.ts`

**功能:**
- [x] parseMarkdownToBlocks() - 解析为文本块
- [x] extractHeadings() - 提取标题大纲

**核心功能：**
```typescript
export function parseMarkdownToBlocks(text: string): TextBlock[]
export function extractHeadings(text: string): Heading[]
```

**完成日期:** 2026-04-04

---

### 2.4 Phase 4: 布局组件

#### Task 4.1: 实现主布局 ✅

**描述:** 实现三栏可调整布局

**子任务：**

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| 4.1.1 | AppLayout | `src/components/layout/AppLayout.tsx` | ✅ |
| 4.1.2 | ResizeHandle | `src/components/layout/ResizeHandle.tsx` | ✅ |
| 4.1.3 | SidebarPanel | `src/components/layout/SidebarPanel.tsx` | ✅ |
| 4.1.4 | EditorPanel | `src/components/layout/EditorPanel.tsx` | ✅ |
| 4.1.5 | PreviewPanel | `src/components/layout/PreviewPanel.tsx` | ✅ |

**功能:**
- [x] 三栏布局
- [x] 可拖拽调整大小
- [x] 面板显隐控制

**布局结构：**
```tsx
<PanelGroup direction="horizontal">
  <Panel id="sidebar" defaultSize={20}>
    <SidebarPanel />
  </Panel>
  <PanelResizeHandle />
  <Panel id="main">
    <PanelGroup direction="horizontal">
      <Panel id="editor">
        <EditorPanel />
      </Panel>
      <PanelResizeHandle />
      <Panel id="preview">
        <PreviewPanel />
      </Panel>
    </PanelGroup>
  </Panel>
</PanelGroup>
```

**Bug 修复：** 拖拽方向问题 - 重新调整 PanelResizeHandle 位置

**完成日期:** 2026-04-04

---

### 2.5 Phase 5: 编辑器组件

#### Task 5.1: Monaco Editor 集成 ✅

**描述:** 集成 Monaco Editor

**子任务：**

| ID | 任务 | 文件 | 状态 |
|----|------|------|------|
| 5.1.1 | MonacoEditor | `src/components/editor/MonacoEditor.tsx` | ✅ |
| 5.1.2 | EditorToolbar | `src/components/editor/EditorToolbar.tsx` | ✅ |
| 5.1.3 | EditorStatusBar | `src/components/editor/EditorStatusBar.tsx` | ✅ |

**功能:**
- [x] 编辑器初始化
- [x] Markdown 语法高亮
- [x] 自定义主题
- [x] 快捷键绑定
- [x] 光标位置跟踪
- [x] 工具栏
- [x] 状态栏

**实现内容：**
- 自定义 Markdown monarch tokenizer
- prest-dark/prest-light 主题
- 快捷键绑定（Ctrl+B/I）
- 光标位置监听

**完成日期:** 2026-04-04

---

### 2.6 Phase 6: 预览组件

#### Task 6.1: Markdown 预览 ✅

**描述:** 实现 Markdown 实时预览

**文件:**
- `src/components/preview/MarkdownPreview.tsx`
- `src/components/preview/MarkdownPreview.css`

**功能:**
- [x] react-markdown 集成
- [x] 代码语法高亮
- [x] GFM 支持
- [x] Pretext 布局优化
- [x] 预览样式

**实现内容：**
- react-markdown + remark-gfm
- react-syntax-highlighter 代码高亮
- Pretext 布局计算
- 自定义组件渲染

**完成日期:** 2026-04-04

---

### 2.7 Phase 7: 侧边栏组件

#### Task 7.1: 文件浏览器 ✅

**文件:** `src/components/sidebar/FileExplorer.tsx`

**功能:**
- [x] 文件树显示
- [x] 文件夹展开/折叠
- [x] 文件点击切换
- [x] 文件图标

**完成日期:** 2026-04-04

---

#### Task 7.2: 大纲视图 ✅

**文件:** `src/components/sidebar/OutlineView.tsx`

**功能:**
- [x] 提取标题
- [x] 层级显示
- [x] 点击跳转

**完成日期:** 2026-04-04

---

#### Task 7.3: 搜索面板 ✅

**文件:** `src/components/sidebar/SearchPanel.tsx`

**功能:**
- [x] 搜索输入
- [x] 实时搜索
- [x] 结果显示
- [x] 行号定位

**完成日期:** 2026-04-04

---

#### Task 7.4: 设置面板 ✅

**文件:** `src/components/sidebar/SettingsPanel.tsx`

**功能:**
- [x] 主题切换
- [x] 字体设置
- [x] 行高设置
- [x] 同步滚动开关
- [x] 自动保存开关
- [x] 自动换行

**完成日期:** 2026-04-04

---

### 2.8 Phase 8: 样式和主题

#### Task 8.1: CSS 变量 ✅

**文件:** `src/styles/globals.css`

**主题变量：**
```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
}

.dark {
  --bg-primary: #1e1e1e;
  --text-primary: #d4d4d4;
}
```

**完成日期:** 2026-04-04

---

#### Task 8.2: Tailwind 配置 ✅

**文件:** `tailwind.config.js`

**自定义配置：**
- VSCode 颜色
- Inter/JetBrains 字体
- 自定义预设

**完成日期:** 2026-04-04

---

## 3. 任务依赖关系

```
Task 1.1 (基础配置)
    └── Task 1.2 (入口文件)
        └── Task 2.1 (类型定义)
            └── Task 2.2 (Stores)
                └── Task 3.1 (Pretext)
                │   └── Task 3.2 (Parser)
                │       └── Task 4.1 (布局)
                │           ├── Task 5.1 (编辑器)
                │           ├── Task 6.1 (预览)
                │           └── Task 7.1-7.4 (侧边栏)
                │               └── Task 8.1-8.2 (样式)
```

## 4. 进度统计

### 4.1 任务统计

| 类型 | 总数 | 完成 | 进行中 | 待开始 |
|------|------|------|--------|--------|
| 主要任务 | 8 | 8 | 0 | 0 |
| 子任务 | 35 | 35 | 0 | 0 |

### 4.2 完成率

- **总体完成率:** 100%
- **P0 功能:** 100%
- **P1 功能:** 100%
- **P2 功能:** 0% (未开始)

### 4.3 分阶段完成率

| Phase | 任务数 | 完成 | 完成率 |
|-------|--------|------|--------|
| Phase 1 | 7 | 7 | 100% |
| Phase 2 | 7 | 7 | 100% |
| Phase 3 | 2 | 2 | 100% |
| Phase 4 | 5 | 5 | 100% |
| Phase 5 | 3 | 3 | 100% |
| Phase 6 | 1 | 1 | 100% |
| Phase 7 | 4 | 4 | 100% |
| Phase 8 | 2 | 2 | 100% |
| **总计** | **35** | **35** | **100%** |

## 5. 遇到的问题和解决方案

### 5.1 Pretext 包不存在

**问题:** `@chenglou/pretext` npm 包不存在

**解决方案:** 创建本地实现 `src/lib/pretext.ts`

**工作量:** 约 2 小时

---

### 5.2 clsx 导入错误

**问题:** `clsx` 从 lodash-es 导入错误

**解决方案:** 改为 `import { clsx } from 'clsx'`

---

### 5.3 TypeScript 未使用变量

**问题:** 多处未使用导入

**解决方案:** 移除未使用的导入

---

### 5.4 tsconfig 配置错误

**问题:** `ignoreDeprecations` 选项无效

**解决方案:** 移除该配置项

---

### 5.5 拖拽方向问题

**问题:** 向右拖动工具区反而变小

**解决方案:** 重新调整 PanelResizeHandle 位置

## 6. 后续计划

### 6.1 待实现任务（P2）

| ID | 任务 | 预计时间 | 优先级 |
|----|------|----------|--------|
| T-001 | 数学公式渲染 (KaTeX) | 2h | P2 |
| T-002 | 虚拟滚动优化 | 4h | P2 |
| T-003 | 自动补全功能 | 3h | P2 |
| T-004 | 搜索结果高亮 | 2h | P2 |

**总预计时间:** 11h

### 6.2 优化方向

1. **性能优化**
   - 虚拟滚动实现
   - 大文档优化
   - 内存管理

2. **功能增强**
   - 图片粘贴上传
   - 导出功能 (PDF/HTML)
   - 多语言支持

3. **用户体验**
   - 更多主题
   - 自定义快捷键
   - 插件系统

## 7. 版本发布记录

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| v0.1.0 | 2026-04-04 | 完成全部 P0/P1 功能 |
