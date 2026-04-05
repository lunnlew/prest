# 编辑器功能

## 2.1 核心编辑

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| E-001 | Monaco Editor 集成 | ✅ | `MonacoEditor.tsx` | 使用 @monaco-editor/react |
| E-002 | Markdown 语法高亮 | ✅ | `MonacoEditor.tsx` | 自定义 monarch tokens |
| E-003 | 实时编辑 | ✅ | `editorSlice.ts` | setContent action |
| E-004 | 撤销/重做 | ✅ | `editorSlice.ts` | undoStack/redoStack |
| E-005 | 光标位置显示 | ✅ | `EditorStatusBar.tsx` | 状态栏显示 |
| E-006 | 字数统计 | ✅ | `EditorStatusBar.tsx` | 行/字/字符统计 |
| E-007 | 代码块语法高亮 | ✅ | `MarkdownPreview.tsx` | react-syntax-highlighter |
| E-008 | 自动补全 | ✅ | `MonacoEditor.tsx` | 18种 Markdown snippets |
| E-009 | 快捷键支持 | ✅ | `MonacoEditor.tsx` | Ctrl+B/I/K, Ctrl+Shift+1-6 等 |
| E-010 | 字体设置 | ✅ | `SettingsPanel.tsx` | 滑块调整 |
| E-011 | 行高设置 | ✅ | `SettingsPanel.tsx` | 滑块调整 |
| E-012 | 自动换行 | ✅ | `SettingsPanel.tsx` | 开关控制 |
| E-013 | 高亮文本 | ✅ | `editorSlice.ts` | ==text== 语法 |
| E-014 | 文本对齐 | ✅ | `editorSlice.ts` | 左/中/右对齐 |
| E-015 | 任务列表 | ✅ | `editorSlice.ts` | - [ ] 语法 |

## 2.2 编辑器界面

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| E-020 | 工具栏 | ✅ | `EditorToolbar.tsx` | 可分组折叠，支持自定义 |
| E-021 | 状态栏 | ✅ | `EditorStatusBar.tsx` | 统计信息 |
| E-022 | 深色主题 | ✅ | `MonacoEditor.tsx` | prest-dark |
| E-023 | 浅色主题 | ✅ | `MonacoEditor.tsx` | prest-light |
| E-024 | 多语言支持 | ✅ | `locales/index.ts`, `locales/data/*.json` | 中文/英文，按需加载 JSON |
| E-025 | 工具栏配置 | ✅ | `ToolbarConfigDialog.tsx` | 弹框配置，拖拽排序，多语言支持 |
| E-026 | 语言包按需加载 | ✅ | `locales/index.ts` | 动态 import JSON，独立 chunk |
| E-027 | 语言包缓存 | ✅ | `locales/index.ts` | loadedLocales 缓存 |
| E-028 | 工具栏配置弹框多语言 | ✅ | `ToolbarConfigDialog.tsx`, `locales/*.json` | 9个新增翻译键 |
| E-029 | 工具栏拖拽排序 | ✅ | `ToolbarConfigDialog.tsx` | @dnd-kit 实现 |
| E-030 | 工具栏分组管理 | ✅ | `ToolbarConfigDialog.tsx` | 新建/删除/显示隐藏分组 |
| E-031 | 分组隐藏时按钮控制 | ✅ | `EditorToolbar.tsx` | 隐藏分组不渲染，按钮由独立按钮项控制 |
| E-032 | 工具栏统一排序 | ✅ | `EditorToolbar.tsx`, `ToolbarConfigDialog.tsx` | 按钮与分组混合排序，统一 items 数组 |
| E-033 | 分组双击收起/展开 | ✅ | `ToolbarConfigDialog.tsx` | 双击分组标题收起/展开按钮列表 |
| E-035 | 按钮配置模块化 | ✅ | `buttons/*.tsx` | 按钮拆分为独立文件，便于扩展维护 |

## 2.3 工具栏统一排序架构

**类型定义 (`types/index.ts`)：**
```typescript
export type ToolbarItem = ToolbarButtonItem | ToolbarGroupItem
// ToolbarButtonItem: { type: 'button', id: ToolbarButtonId }
// ToolbarGroupItem: { type: 'group', id: ToolbarGroupId }
```

**状态管理 (`settingsSlice.ts`)：**
- `defaultToolbarItems`: 统一的默认顺序
- `setToolbarItems`: 更新工具栏顺序

**渲染规则 (`EditorToolbar.tsx`)：**
- 遍历 `items` 数组渲染
- 按钮项：若属于可见分组则跳过（在下拉菜单中），否则渲染按钮
- 分组项：若可见则渲染下拉菜单，若隐藏则不渲染

**配置弹框 (`ToolbarConfigDialog.tsx`)：**
- 点击切换区域：控制按钮项的添加/移除
- 顺序列表：与工具栏渲染逻辑完全一致
- 分组隐藏时：分组不显示，按钮由独立按钮项控制

**设计原则：**
1. 按钮显示由 `items` 数组中的按钮项控制
2. 分组显示由 `groups` 配置中的 `visible` 属性控制
3. 可见分组的按钮在分组下拉菜单中显示，避免重复

## 2.4 语言包架构

| 语言 | 文件 | 大小 (gzip) | 备注 |
|------|------|-------------|------|
| zh-CN | `locales/data/zh-CN.json` | 1.04 kB | 默认语言 |
| en | `locales/data/en.json` | 0.80 kB | 按需加载 |

**加载机制：**
- 使用动态 `import()` 按需加载
- 加载后缓存，避免重复请求
- 默认加载中文，切换语言时加载对应 JSON
- 主 bundle 不包含语言数据，独立 chunk

## 2.5 快捷键详细

| 快捷键 | 功能 | 状态 |
|--------|------|------|
| Ctrl+B | 粗体 | ✅ |
| Ctrl+I | 斜体 | ✅ |
| Ctrl+K | 链接 | ✅ |
| Ctrl+Shift+C | 行内代码 | ✅ |
| Ctrl+/ | 引用块 | ✅ |
| Ctrl+Shift+1-6 | 标题 1-6 | ✅ |

## 2.6 自动补全 Snippets

| 触发词 | 补全内容 |
|--------|----------|
| bold | **text** |
| italic | *text* |
| strikethrough | ~~text~~ |
| code | `code` |
| codeblock | ```language\ncode\n``` |
| link | [text](url) |
| image | ![alt](url) |
| quote | > quote |
| list | - item |
| orderedlist | 1. item |
| task | - [ ] task |
| hr | --- |
| table | \| Header 1 \| Header 2 \| |
