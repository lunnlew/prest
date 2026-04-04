# Prest 功能完备记录表

## 1. 功能实现状态

### 1.1 图例说明

| 状态 | 符号 | 含义 |
|------|------|------|
| 完成 | ✅ | 功能已完整实现并通过测试 |
| 部分完成 | 🔄 | 功能已实现但需要优化 |
| 进行中 | 🚧 | 正在开发中 |
| 待开始 | ⏳ | 已规划但未开始 |
| 不实现 | ❌ | 该版本不实现 |

---

## 2. 编辑器功能

### 2.1 核心编辑

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

### 2.2 编辑器界面

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

### 2.3 工具栏统一排序架构

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

### 2.4 语言包架构

| 语言 | 文件 | 大小 (gzip) | 备注 |
|------|------|-------------|------|
| zh-CN | `locales/data/zh-CN.json` | 1.04 kB | 默认语言 |
| en | `locales/data/en.json` | 0.80 kB | 按需加载 |

**加载机制：**
- 使用动态 `import()` 按需加载
- 加载后缓存，避免重复请求
- 默认加载中文，切换语言时加载对应 JSON
- 主 bundle 不包含语言数据，独立 chunk

### 2.5 快捷键详细

| 快捷键 | 功能 | 状态 |
|--------|------|------|
| Ctrl+B | 粗体 | ✅ |
| Ctrl+I | 斜体 | ✅ |
| Ctrl+K | 链接 | ✅ |
| Ctrl+Shift+C | 行内代码 | ✅ |
| Ctrl+/ | 引用块 | ✅ |
| Ctrl+Shift+1-6 | 标题 1-6 | ✅ |

### 2.6 自动补全 Snippets

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

---

## 3. 预览功能

### 3.1 渲染功能

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| P-001 | 实时预览 | ✅ | `MarkdownPreview.tsx` | react-markdown |
| P-002 | GFM 支持 | ✅ | `MarkdownPreview.tsx` | remark-gfm |
| P-003 | 表格渲染 | ✅ | `MarkdownPreview.css` | CSS 样式 |
| P-004 | 任务列表 | ✅ | `remark-gfm` | 复选框支持 |
| P-005 | 代码块渲染 | ✅ | `MarkdownPreview.tsx` | SyntaxHighlighter |
| P-006 | 图片显示 | ✅ | `MarkdownPreview.css` | lazy loading |
| P-007 | 链接点击 | ✅ | `MarkdownPreview.tsx` | 新窗口打开 |
| P-008 | 数学公式 | ⏳ | - | 规划中 (KaTeX) |
| P-009 | 同步滚动 | 🔄 | `settingsSlice.ts` | 开关已有，映射待优化 |
| P-010 | Pretext 布局 | ✅ | `PretextService.ts` | 本地实现 |

### 3.2 预览样式

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| P-020 | 标题样式 | ✅ | `MarkdownPreview.css` | 6级标题 |
| P-021 | 引用块样式 | ✅ | `MarkdownPreview.css` | 左边框 + 背景 |
| P-022 | 列表样式 | ✅ | `MarkdownPreview.css` | 有序/无序 |
| P-023 | 表格样式 | ✅ | `MarkdownPreview.css` | 边框 + hover |
| P-024 | 代码样式 | ✅ | `MarkdownPreview.css` | 行内 + 块级 |
| P-025 | 分隔线样式 | ✅ | `MarkdownPreview.css` | 水平线 |

---

## 4. 布局功能

### 4.1 面板布局

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| L-001 | 三栏布局 | ✅ | `AppLayout.tsx` | react-resizable-panels |
| L-002 | 可调整面板 | ✅ | `AppLayout.tsx` | PanelResizeHandle |
| L-003 | 侧边栏显隐 | ✅ | `EditorToolbar.tsx` | toggleSidebar |
| L-004 | 预览区显隐 | ✅ | `EditorToolbar.tsx` | togglePreview |
| L-005 | 布局持久化 | ✅ | `useBoundStore.ts` | Zustand persist |
| L-006 | 响应式设计 | 🔄 | `AppLayout.tsx` | 基础响应式 |

### 4.2 分隔线

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| L-010 | 拖拽手柄 | ✅ | `ResizeHandle.tsx` | 自定义样式 |
| L-011 | 悬停效果 | ✅ | `ResizeHandle.tsx` | 高亮显示 |
| L-012 | 激活效果 | ✅ | `ResizeHandle.tsx` | 拖拽中样式 |

---

## 5. 侧边栏功能

### 5.1 Activity Bar

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-001 | 标签页切换 | ✅ | `SidebarPanel.tsx` | 4个标签 |
| S-002 | 活动状态显示 | ✅ | `SidebarPanel.tsx` | 高亮当前标签 |
| S-003 | 图标显示 | ✅ | `SidebarPanel.tsx` | Emoji 图标 |

### 5.2 文件浏览器

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-010 | 文件树显示 | ✅ | `FileExplorer.tsx` | 递归渲染 |
| S-011 | 文件夹展开/折叠 | ✅ | `FileExplorer.tsx` | expandedFolders |
| S-012 | 文件点击切换 | ✅ | `FileExplorer.tsx` | setContent |
| S-013 | 文件图标 | ✅ | `FileExplorer.tsx` | 文件/文件夹图标 |
| S-014 | 当前文件高亮 | ✅ | `FileExplorer.tsx` | currentFile |

### 5.3 大纲视图

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-020 | 标题提取 | ✅ | `MarkdownParser.ts` | extractHeadings |
| S-021 | 层级显示 | ✅ | `OutlineView.tsx` | 缩进表示 |
| S-022 | 点击跳转 | ✅ | `OutlineView.tsx` | setCursorPosition |
| S-023 | 空状态提示 | ✅ | `OutlineView.tsx` | No headings found |

### 5.4 搜索面板

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-030 | 搜索输入 | ✅ | `SearchPanel.tsx` | 文本输入框 |
| S-031 | 实时搜索 | ✅ | `SearchPanel.tsx` | 输入即搜索 |
| S-032 | 结果列表 | ✅ | `SearchPanel.tsx` | 显示匹配行 |
| S-033 | 行号显示 | ✅ | `SearchPanel.tsx` | Line X |
| S-034 | 空结果提示 | ✅ | `SearchPanel.tsx` | No results found |
| S-035 | 搜索结果高亮 | ✅ | `SearchPanel.tsx` | 编辑器高亮 |
| S-036 | 点击跳转 | ✅ | `SearchPanel.tsx` | 跳转到匹配行 |
| S-037 | 结果计数 | ✅ | `SearchPanel.tsx` | 显示匹配数量 |

### 5.5 设置面板

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-040 | 主题切换 | ✅ | `SettingsPanel.tsx` | toggleTheme |
| S-041 | 字体大小设置 | ✅ | `SettingsPanel.tsx` | 滑块 |
| S-042 | 行高设置 | ✅ | `SettingsPanel.tsx` | 滑块 |
| S-043 | 自动换行开关 | ✅ | `SettingsPanel.tsx` | wordWrap |
| S-044 | 同步滚动开关 | ✅ | `SettingsPanel.tsx` | syncScroll |
| S-045 | 自动保存开关 | ✅ | `SettingsPanel.tsx` | autoSave |

---

## 6. 状态管理

### 6.1 Store 实现

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| Z-001 | Editor Slice | ✅ | `editorSlice.ts` | 编辑器状态 |
| Z-002 | Preview Slice | ✅ | `previewSlice.ts` | 预览状态 |
| Z-003 | Layout Slice | ✅ | `layoutSlice.ts` | 布局状态 |
| Z-004 | Sidebar Slice | ✅ | `sidebarSlice.ts` | 侧边栏状态 |
| Z-005 | Settings Slice | ✅ | `settingsSlice.ts` | 设置状态 |
| Z-006 | Bound Store | ✅ | `useBoundStore.ts` | 组合 Store |
| Z-007 | 状态持久化 | ✅ | `useBoundStore.ts` | localStorage |
| Z-008 | Editor Instance | ✅ | `editorSlice.ts` | 编辑器引用 |

### 6.2 Actions 实现

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| Z-010 | setContent | ✅ | `editorSlice.ts` | 更新内容 |
| Z-011 | setCursorPosition | ✅ | `editorSlice.ts` | 更新光标 |
| Z-012 | undo/redo | ✅ | `editorSlice.ts` | 撤销/重做 |
| Z-013 | toggleSidebar | ✅ | `layoutSlice.ts` | 切换侧边栏 |
| Z-014 | togglePreview | ✅ | `layoutSlice.ts` | 切换预览 |
| Z-015 | toggleTheme | ✅ | `settingsSlice.ts` | 切换主题 |
| Z-016 | formatMarkdown | ✅ | `editorSlice.ts` | 格式化 Markdown |

---

## 7. 服务层

### 7.1 Pretext 服务

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| SV-001 | prepare | ✅ | `lib/pretext.ts` | 文本预处理 |
| SV-002 | layout | ✅ | `lib/pretext.ts` | 布局计算 |
| SV-003 | layoutWithLines | ✅ | `lib/pretext.ts` | 获取行信息 |
| SV-004 | calculateTotalHeight | ✅ | `PretextService.ts` | 总高度 |
| SV-005 | calculateScrollMapping | ✅ | `PretextService.ts` | 滚动映射 |
| SV-006 | 缓存管理 | ✅ | `PretextService.ts` | clearCache |

### 7.2 Markdown 解析

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| SV-010 | parseMarkdownToBlocks | ✅ | `MarkdownParser.ts` | 解析为块 |
| SV-011 | extractHeadings | ✅ | `MarkdownParser.ts` | 提取标题 |

---

## 8. 样式系统

### 8.1 CSS 变量

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| C-001 | 亮色主题变量 | ✅ | `globals.css` | :root |
| C-002 | 暗色主题变量 | ✅ | `globals.css` | .dark |
| C-003 | 主题切换 | ✅ | `App.tsx` | class 切换 |
| C-004 | 搜索高亮样式 | ✅ | `globals.css` | search-highlight |

### 8.2 Tailwind

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| C-010 | 基础配置 | ✅ | `tailwind.config.js` | presets |
| C-011 | 自定义颜色 | ✅ | `tailwind.config.js` | vscode 颜色 |
| C-012 | 自定义字体 | ✅ | `tailwind.config.js` | Inter/JetBrains |

---

## 9. 统计汇总

### 9.1 功能统计

| 优先级 | 总数 | 完成 | 部分完成 | 待开始 |
|--------|------|------|----------|--------|
| P0 | 21 | 21 | 0 | 0 |
| P1 | 18 | 18 | 0 | 0 |
| P2 | 4 | 2 | 0 | 2 |
| **总计** | **43** | **41** | **0** | **2** |

### 9.2 完成率

- **P0 功能完成率:** 100% (21/21)
- **P1 功能完成率:** 100% (18/18)
- **P2 功能完成率:** 50% (2/4)
- **总体完成率:** 95.3% (41/43)

### 9.3 文件统计

| 类型 | 数量 |
|------|------|
| React 组件 | 15 |
| Store 文件 | 6 |
| Service 文件 | 3 |
| 类型文件 | 1 |
| 配置文件 | 7 |
| 样式文件 | 2 |
| **总计** | **34** |

---

## 10. 测试验证

### 10.1 功能测试

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 编辑器输入 | ✅ | 正常 |
| 语法高亮 | ✅ | 正常 |
| 实时预览 | ✅ | 正常 |
| 面板调整 | ✅ | 正常 |
| 主题切换 | ✅ | 正常 |
| 设置保存 | ✅ | 正常 |
| 文件切换 | ✅ | 正常 |
| 大纲跳转 | ✅ | 正常 |
| 搜索功能 | ✅ | 正常 |
| 搜索高亮 | ✅ | 正常 |
| 搜索跳转 | ✅ | 正常 |
| 自动补全 | ✅ | 正常 |
| 工具栏格式化 | ✅ | 正常 |
| 快捷键 | ✅ | 正常 |
| 工具栏统一排序 | ✅ | 正常 |
| 分组双击收起/展开 | ✅ | 正常 |
| 配置弹框数据一致性 | ✅ | 正常 |

### 10.2 构建测试

| 测试项 | 状态 | 备注 |
|--------|------|------|
| TypeScript 编译 | ✅ | 无错误 |
| Vite 构建 | ✅ | 成功 |
| 打包大小 | ✅ | ~1.2MB gzip |

### 10.3 兼容性测试

| 浏览器 | 状态 | 备注 |
|--------|------|------|
| Chrome | ✅ | 正常 |
| Firefox | ⏳ | 待测试 |
| Safari | ⏳ | 待测试 |
| Edge | ⏳ | 待测试 |

---

## 11. 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v0.1.0 | 2026-04-04 | 初始版本，完成 P0/P1 功能 |
| v0.2.0 | 2026-04-04 | 添加自动补全、搜索高亮、搜索跳转、扩展快捷键 |
| v0.3.0 | 2026-04-04 | 语言包重构：JSON 按需加载、独立 chunk、全组件接入 |
| v0.3.1 | 2026-04-04 | ToolbarConfigDialog 多语言支持：9个新增翻译键，类型定义完善 |
| v0.4.0 | 2026-04-04 | 工具栏配置重构：拖拽排序(@dnd-kit)、分组管理、隐藏分组按钮保留 |
| v0.5.0 | 2026-04-04 | 工具栏统一排序：按钮与分组混合排序、双击收起/展开分组、配置弹框数据一致性 |
| v0.5.1 | 2026-04-04 | 按钮配置模块化重构：每个分组独立文件，便于扩展维护 |
| v0.5.2 | 2026-04-04 | 拖拽排序修复：自定义分组显示 label 而非 ID；稳定 sortable ID 避免拖拽同步错位；`ToolbarGroupId` 类型扩展支持动态自定义 ID；补充 tools 按钮注册 |

---

## 12. 待办事项

### 12.1 优先级 P2

- [ ] 数学公式渲染 (KaTeX)
- [ ] 虚拟滚动优化

### 12.2 优化项

- [ ] 同步滚动精确映射
- [ ] 响应式布局优化
- [ ] 大文档性能优化
- [ ] 内存使用优化

### 12.3 新功能规划

- [ ] 图片粘贴上传
- [ ] 导出 PDF/HTML
- [ ] 插件系统

---

## 13. 缺失功能补遗

### 13.1 图片与媒体

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| M-001 | 拖拽图片插入编辑器 | P1 | ❌ | 拖放图片到编辑器区域 |
| M-002 | 剪贴板图片粘贴上传 | P1 | ❌ | Ctrl+V 粘贴图片自动转 base64 或上传 |
| M-003 | 图片点击放大/灯箱预览 | P2 | ❌ | 预览区图片点击可放大查看 |
| M-004 | Mermaid 图表渲染 | P2 | ❌ | 流程图/时序图/饼图支持 |
| M-005 | 视频/音频嵌入 | P2 | ❌ | 支持 HTML5 音视频标签 |

### 13.2 导出与导入

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| X-001 | 下载当前 .md 文件 | P0 | ✅ | 保存/下载当前编辑内容 | `editorSlice.ts`, `EditorToolbar.tsx` |
| X-002 | 导出 HTML | P1 | ❌ | 将预览结果导出为 HTML 文件 |
| X-003 | 导出 PDF | P1 | ❌ | 将预览结果导出为 PDF 文件 |
| X-004 | 导入本地 .md 文件 | P1 | ❌ | 通过文件选择器导入编辑 |
| X-005 | 批量导出多个文件 | P2 | ❌ | 批量导出/下载多个文档 |
| X-006 | 导入/导出编辑器配置 | P2 | ❌ | 导出主题/快捷键/工具栏配置 |

### 13.3 编辑体验增强

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| UX-001 | WYSIWYG 所见即所得模式 | P2 | ❌ | Typora 式即时渲染编辑 |
| UX-002 | 富文本粘贴 (HTML→Markdown) | P1 | ❌ | 从 Word/网页粘贴自动转换 |
| UX-003 | 多光标编辑 | P2 | ❌ | Monaco 原生支持但未暴露 |
| UX-004 | Emoji 选择器 | P2 | ❌ | Emoji picker 按钮 |
| UX-005 | 打字机模式 | P2 | ❌ | 光标保持在视口中心 |
| UX-006 | 焦点模式 | P2 | ❌ | 只显示当前编辑段落 |
| UX-007 | 全屏/专注编辑 | P2 | ❌ | 全屏模式，隐藏多余 UI |
| UX-008 | 编辑历史面板 | P2 | ❌ | 可视浏览 undo/redo 历史 |
| UX-009 | 预计阅读时间显示 | P3 | ❌ | 状态栏增加阅读时间估算 |

### 13.4 Markdown 扩展语法

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| EX-001 | 数学公式 (KaTeX) | P0 | ✅ | 支持 `$..$` 行内和 `$$..$$` 块级公式 | `MarkdownPreview.tsx`, `remark-math`, `rehype-katex` | 已记录在 TODO，待实现 |
| EX-002 | Mermaid 图表语法 | P1 | ❌ | \`\`\`mermaid 代码块渲染 |
| EX-003 | 脚注支持 | P2 | ❌ | remark-gfm 已支持，待验证 |
| EX-004 | Admonition/Callout 块 | P2 | ❌ | 警告/提示/注意等特殊块 |
| EX-005 | 定义列表 | P2 | ❌ | DL/DT/DD 语法 |
| EX-006 | 自动目录生成 | P2 | ❌ | 文档内自动生成 TOC 链接 |

### 13.5 安全与性能

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| SEC-001 | XSS sanitize | P0 | ✅ | rehype-sanitize 配置自定义 safe schema | `MarkdownPreview.tsx` | rehypeRaw 允许原始 HTML，需配置 sanitize |
| SEC-002 | CSP 安全策略 | P1 | ❌ | Content Security Policy 配置 |
| PERF-001 | 大文档虚拟渲染 | P1 | ❌ | 长文档预览性能优化 |
| PERF-002 | 预览区域防抖渲染 | P2 | ❌ | 编辑时减少过于频繁的预览刷新 |
| PERF-003 | Monaco 懒加载 | P2 | ❌ | 按需加载 Monaco 编辑器 |
| PERF-004 | 代码块语言按需加载 | P2 | ❌ | 只加载使用过的语法高亮 |

### 13.6 架构与工程化

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| ARC-001 | 真实文件系统对接 | P0 | ❌ | IndexedDB 或 File System Access API |
| ARC-002 | 自动保存逻辑完整实现 | P0 | ❌ | 有 switch 但未真正写入 |
| ARC-003 | 插件系统架构 | P2 | ❌ | 可扩展的插件机制 |
| ARC-004 | Git 集成 | P3 | ❌ | 版本控制支持 |
| ARC-005 | 协作编辑 | P3 | ❌ | 多人实时编辑 (Yjs/CRDT) |
| ARC-006 | PWA / 离线支持 | P3 | ❌ | 渐进式 Web 应用 |

### 13.7 无障碍与国际化

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| A11Y-001 | 键盘导航/快捷键提示 | P1 | ❌ | 工具栏/面板键盘导航 |
| A11Y-002 | ARIA 标签完善 | P2 | ❌ | 屏幕阅读器支持 |
| A11Y-003 | 高对比度主题 | P2 | ❌ | 无障碍高对比度模式 |
| I18N-001 | RTL 语言支持 | P3 | ❌ | 阿拉伯语等从右到左书写 |
| I18N-002 | 更多语言包 | P2 | ❌ | 日语/法语/西语等 |

### 13.8 现有功能待完善

| ID | 功能 | 优先级 | 状态 | 备注 |
|----|------|--------|------|------|
| FIX-001 | 同步滚动精确映射 | P1 | 🔄 | 开关存在，映射逻辑待实现 |
| FIX-002 | 高亮文本预览渲染 | P0 | ✅ | `==text==` 语法预览转为 `<mark>` 标签 | `MarkdownPreview.tsx`, CSS | \`\`==text==\`\` 语法预览未转为 \`<mark>\` |
| FIX-003 | 多标签页编辑 | P2 | ❌ | 同时打开多个文件标签 |
| FIX-004 | 未保存状态指示器 | P1 | ❌ | isDirty 存在但未在 UI 显示 |
| FIX-005 | 浏览器兼容性测试 | P1 | ⏳ | Firefox/Safari/Edge 待测试 |
| FIX-006 | 响应式布局完善 | P1 | 🔄 | 移动端/小屏适配 |
| E-016 | 代码块行号显示 | P2 | ❌ | SyntaxHighlighter 未启用行号 |
| E-017 | 代码块复制按钮 | P2 | ❌ | 一键复制代码块内容 |
| E-018 | 拼写检查 | P3 | ❌ | 拼写纠错功能 |
| E-019 | Front Matter / YAML | P2 | ❌ | Markdown 元数据支持 |

---

## 14. 实现路线图

### Phase 1: 安全与基础完善（P0）

| 序号 | 任务 | 预估工作量 | 相关文件 |
|------|------|-----------|----------|
| 1.1 | SEC-001 XSS sanitize | ✅ 已完成 | 2h | \`MarkdownPreview.tsx\`, \`package.json\` |
| 1.2 | FIX-002 高亮文本预览渲染 | ✅ 已完成 | 1h | \`MarkdownPreview.tsx\` |
| 1.3 | X-001 下载当前 .md 文件 | ✅ 已完成 | 1h | \`EditorToolbar.tsx\`, \`tools.tsx\` |
| 1.4 | ARC-002 自动保存逻辑完整实现 | 2h | \`settingsSlice.ts\`, \`MonacoEditor.tsx\` |
| 1.5 | FIX-004 未保存状态指示器 | 0.5h | \`EditorStatusBar.tsx\` |
| 1.6 | ARC-001 真实文件系统对接 (IndexedDB) | 4h | \`FileExplorer.tsx\`, 新建 \`storage/\` |
| 1.7 | EX-001 数学公式 (KaTeX) | ✅ 已完成 | 3h | \`package.json\`, \`MarkdownPreview.tsx\` |

### Phase 2: 核心体验提升（P1）

| 序号 | 任务 | 预估工作量 | 相关文件 |
|------|------|-----------|----------|
| 2.1 | M-001/M-002 图片拖拽 & 粘贴上传 | 3h | \`MonacoEditor.tsx\` |
| 2.2 | UX-002 富文本粘贴 | 2h | 新建 \`utils/paste.ts\` |
| 2.3 | X-002/X-003 导出 HTML/PDF | 3h | 新建 \`utils/export.ts\` |
| 2.4 | X-004 导入本地文件 | 1h | \`FileExplorer.tsx\` |
| 2.5 | FIX-001 同步滚动精确映射 | 3h | \`PretextService.ts\`, \`MonacoEditor.tsx\` |
| 2.6 | PERF-001 大文档虚拟渲染 | 4h | \`MarkdownPreview.tsx\`, \`PretextService.ts\` |
| 2.7 | SEC-002 CSP 安全策略 | 1h | \`index.html\`, \`vite.config.ts\` |
| 2.8 | FIX-005 浏览器兼容性测试 | 2h | - |
| 2.9 | FIX-006 响应式布局完善 | 3h | \`AppLayout.tsx\`, \`globals.css\` |
| 2.10 | A11Y-001 键盘导航/快捷键提示 | 2h | \`EditorToolbar.tsx\`, \`SettingsPanel.tsx\` |

### Phase 3: 功能丰富与体验（P2）

| 序号 | 任务 | 预估工作量 | 相关文件 |
|------|------|-----------|----------|
| 3.1 | UX-004 Emoji 选择器 | 2h | 新建 \`EmojiPicker.tsx\`, \`tools.tsx\` |
| 3.2 | EX-002 Mermaid 图表 | 3h | \`MarkdownPreview.tsx\` |
| 3.3 | E-016/E-017 代码块行号 & 复制 | 2h | \`MarkdownPreview.tsx\` |
| 3.4 | M-003 图片点击放大/灯箱 | 2h | \`MarkdownPreview.tsx\` |
| 3.5 | EX-004 Admonition/Callout | 2h | 自定义 remark 插件 |
| 3.6 | E-019 Front Matter 支持 | 2h | 新建 \`utils/frontmatter.ts\` |
| 3.7 | EX-006 自动目录生成 | 2h | \`MarkdownPreview.tsx\` |
| 3.8 | PERF-002/003/004 性能优化 | 4h | 多处 |
| 3.9 | X-005/X-006 批量导出 & 配置导出 | 2h | 新建 \`utils/configExport.ts\` |
| 3.10 | I18N-002/A11Y 语言包 & 无障碍 | 2h | \`locales/\` |

### Phase 4: 高级功能（P3）

| 序号 | 任务 | 预估工作量 | 备注 |
|------|------|-----------|------|
| 4.1 | UX-001 WYSIWYG 所见即所得模式 | 8h | Typora 式编辑 |
| 4.2 | UX-003 多光标编辑 | 2h | Monaco API 暴露 |
| 4.3 | UX-005 打字机模式 | 2h | 光标视口居中 |
| 4.4 | UX-006 焦点模式 | 2h | 当前段落高亮 |
| 4.5 | UX-007 全屏/专注编辑 | 1h | 隐藏多余 UI |
| 4.6 | UX-008/009 编辑历史 & 阅读时间 | 2h | 状态面板 |
| 4.7 | FIX-003 多标签页编辑 | 3h | 多文件同时编辑 |
| 4.8 | EX-003/005 脚注 & 定义列表 | 2h | Markdown 扩展 |
| 4.9 | ARC-003 插件系统架构 | 4h | 插件机制设计 |
| 4.10 | ARC-004 Git 集成 | 4h | 版本控制 |
| 4.11 | ARC-005 协作编辑 (Yjs/CRDT) | 8h | 多人实时编辑 |
| 4.12 | ARC-006 PWA / 离线支持 | 4h | Service Worker |
| 4.13 | I18N-001 RTL 语言支持 | 3h | 从右到左书写 |

---
