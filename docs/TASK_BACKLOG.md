# Prest 任务清单

> 基于代码审查整理，记录所有已实现功能与待开发任务。
> 最后更新：2026-04-05

---

## 一、已完成功能清单

### 1. 编辑器核心

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| ED-001 | Monaco 自定义 Markdown 语言 (`markdown-prest`) | `MonacoEditor.tsx` | 注册语言、token 语法高亮 |
| ED-002 | 自定义暗色/亮色主题 (`prest-dark`/`prest-light`) | `MonacoEditor.tsx:268-312` | 完整 token 颜色规则 |
| ED-003 | 代码智能补全 | `MonacoEditor.tsx:19-209` | 18 种 Snippet：bold/italic/code/table/link/image/quote/list/hr/align* 等 |
| ED-004 | 工具栏格式按钮 | `EditorToolbar.tsx`, `buttons/` | | |
| ED-005 | 快捷键：Ctrl+B/I/K、Ctrl+Shift+C、Ctrl+/、Ctrl+Shift+1-6 | `MonacoEditor.tsx:332-468` | Monaco editor 命令 |
| ED-006 | Ctrl+S/Cmd+S 保存 | `App.tsx:57-66` | `saveFileContent` + `save` |
| ED-007 | 自定义撤销/重做栈（50 条上限） | `editorSlice.ts:121-141` | 独立于 Monaco 状态管理 |
| ED-008 | 格式操作：包裹选区 / 插入占位符 / 清除格式 | `editorSlice.ts:169-277` | 22 种格式类型 |
| ED-009 | 下载 .md 文件 | `editorSlice.ts:279-291` | Blob 方式 |
| ED-010 | 光标位置追踪 | `MonacoEditor.tsx:324-329` | 状态栏显示 |
| ED-011 | 状态栏：行数/字数/字符数/行号列号/保存状态 | `EditorStatusBar.tsx` | 未保存黄灯 / 已保存绿灯 |

### 2. 工具栏

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| TB-001 | 拖拽排序按钮和分组 | `ToolbarConfigDialog.tsx` | @dnd-kit/core + @dnd-kit/sortable |
| TB-002 | 混合工具栏项（按钮 + 分组）统一排序 | `EditorToolbar.tsx:184-271` | 避免重复渲染 |
| TB-003 | 自定义分组创建/删除 | `ToolbarConfigDialog.tsx:169-191` | 动态 `custom_*` ID |
| TB-004 | 分组可见性切换 | `ToolbarConfigDialog.tsx:149-166` | 隐藏 → 按钮提至顶层 |
| TB-005 | 双击展开/收起分组 | `ToolbarConfigDialog.tsx:555-558` | |
| TB-006 | 组内按钮拖拽排序 | `ToolbarConfigDialog.tsx:259-273` | |
| TB-007 | 按钮去重（同一按钮仅出现在一个分组） | `ToolbarConfigDialog.tsx:194-209` | |
| TB-008 | 恢复默认配置 | `ToolbarConfigDialog.tsx:322-325` | |
| TB-009 | 7 个预设分组：标题/文本/代码/列表/区块/对齐/工具 | `settingsSlice.ts:24-73` | |
| TB-010 | 配置弹窗（ESC 关闭 / 点击外部关闭） | `ToolbarConfigDialog.tsx:96-120` | |

### 3. 预览

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| PV-001 | GFM 表格/删除线/任务列表 | `MarkdownPreview.tsx` | remark-gfm |
| PV-002 | KaTeX 数学公式 | `MarkdownPreview.tsx` | remark-math + rehype-katex |
| PV-003 | Obsidian 高亮 `==text==` | `MarkdownPreview.tsx` | remark-highlight-mark → `<mark>` |
| PV-004 | HTML 标签透传 | `MarkdownPreview.tsx` | rehype-raw |
| PV-005 | XSS 安全防护 | `MarkdownPreview.tsx` | rehype-sanitize 自定义 schema |
| PV-006 | 代码块语法高亮 | `MarkdownPreview.tsx` | Prism oneDark/oneLight |
| PV-007 | 预览自动宽度跟踪 | `MarkdownPreview.tsx` | ResizeObserver |
| PV-009 | 延迟加载图片 | `MarkdownPreview.tsx` | `loading="lazy"` |
| PV-010 | 自定义链接/图片/引用/表格/列表样式 | `MarkdownPreview.tsx` | 组件覆盖 |
| PV-011 | 同步滚动开关 | `PreviewPanel.tsx` | 按钮状态（映射逻辑待完善） |
| PV-012 | 平台预览切换（文档/小红书） | `PreviewPanel.tsx`, `previewSlice.ts` | selector 下拉切换 |
| PV-013 | 小红书实时预览 | `XiaohongshuPreview.tsx`, `xiaohongshu.css` | 模板样式渲染 |
| PV-014 | 小红书导出对话框 | `XHSExportDialog.tsx` | 比例/模板/页码导航/水印/话题 |

### 4. 侧边栏

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| SB-001 | Activity Bar 四标签切换 | `SidebarPanel.tsx` | 文件/搜索/大纲/设置 |
| SB-002 | 文件树递归渲染 | `FileExplorer.tsx` | 无限层级嵌套 |
| SB-003 | 文件夹展开/折叠 | `FileExplorer.tsx` | expandedFolders Set |
| SB-004 | 右键上下文菜单 | `FileExplorer.tsx:205-227`, `ContextMenu.tsx` | 新建/重命名/删除 |
| SB-005 | 文件树拖拽排序 | `FileExplorer.tsx:46-90` | 文件夹内移入 / 上下重排 |
| SB-006 | 文件名自动去重（区分后缀） | `sidebarSlice.ts:269-300` | `name (1).ext` 格式 |
| SB-007 | IndexedDB 持久化 | `storage/indexedDB.ts` | FlatFileNode 结构，启动加载 |
| SB-008 | 大纲视图（标题提取+跳转） | `OutlineView.tsx`, `MarkdownParser.ts` | extractHeadings |
| SB-009 | 搜索面板（高亮+跳转+计数） | `SearchPanel.tsx` | Monaco 装饰标记 |
| SB-010 | 设置面板（主题/字体/换行/同步/保存） | `SettingsPanel.tsx` | 7 个设置项 |

### 5. 布局

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| LY-001 | 三栏可调布局 | `AppLayout.tsx` | react-resizable-panels |
| LY-002 | 侧边栏显示/隐藏 | `AppLayout.tsx` | toggleSidebar |
| LY-003 | 预览面板显示/隐藏 | `AppLayout.tsx` | togglePreview |
| LY-004 | 拖拽分隔线 | `ResizeHandle.tsx` | 视觉反馈 + aria |

### 6. 状态管理

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| ST-001 | Zustand 五 Slice 管理 | `stores/` | editor/preview/layout/sidebar/settings |
| ST-002 | localStorage 持久化 + 迁移 | `useBoundStore.ts` | persist 中间件，toolbar/locale 自动补全 |

### 7. 国际化

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| I18N-001 | 双语支持（zh-CN / en） | `locales/`, `useTranslation.ts` | JSON 语言包 |
| I18N-002 | 语言切换设置 | `SettingsPanel.tsx` | dropdown |
| I18N-003 | xhsExport 翻译键新增 | `en.json`, `zh-CN.json` | `LocaleMessages.toolbar.xhsExport: "XHS Export" / "小红书出图"` |

### 8. 小红书排版

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| XHS-001 | 小红书预览组件 | `XiaohongshuPreview.tsx` | 模板/水印/话题标签/页码/分页块 |
| XHS-002 | 小红书 CSS 样式 | `xiaohongshu.css` | 三套模板完整样式 |
| XHS-003 | 分页计算引擎 | `XHSPaginator.ts`, `pretext.ts` | DOM 布局 + 块级高度分配 |
| XHS-004 | 导出对话框 | `XHSExportDialog.tsx` | 比例/模板/页码导航 |
| XHS-005 | XHS 状态管理 | `settingsSlice.ts`, `types/index.ts` | XHSExportSettings + defaultXHSExport |
| XHS-006 | 工具栏快捷入口 | `EditorToolbar.tsx` | 📕 + 翻译键 xhsExport |
| XHS-007 | 平台切换选择器 | `PreviewPanel.tsx`, `PreviewPanel` | selector + platformPreview state |

---

### 9. 服务层

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| SV-001 | Markdown 块解析 | `MarkdownParser.ts` | parseMarkdownToBlocks / extractHeadings |
| SV-002 | XHS 分页引擎 | `XHSPaginator.ts` | paginateXHS / extractPageContent |
| SV-003 | 文字测量工具 | `lib/pretext.ts` | prepare / layoutWithLines (canvas) |

### 10. 类型系统

| ID | 功能 | 实现文件 | 说明 |
|----|------|----------|------|
| TP-001 | XHS 类型定义 | `types/index.ts` | XHSAspectRatio / XHSTemplate / XHSExportSettings |
| TP-002 | PlatformPreview 扩展系统 | `types/index.ts` | PlatformPreviewId / PlatformPreviewMeta / PlatformPreviewDef |

---

## 二、待开发任务

### P0 — 阻塞性问题

| # | ID | 任务 | 相关文件 | 备注 |
|---|-----|------|----------|------|
| 1 | FIX-001 | 同步滚动精确映射 | `MonacoEditor.tsx`, `MarkdownPreview.tsx` | 开关存在，映射逻辑未实现 |
| 2 | FIX-005 | 浏览器兼容性测试 | — | Firefox/Safari/Edge 验证 |

### P1 — 高优先级

| # | ID | 任务 | 相关文件 | 备注 |
|---|-----|------|----------|------|
| 1 | M-001 | 拖拽图片插入编辑器 | `MonacoEditor.tsx` | 拖放转 base64 引用 |
| 2 | M-002 | 剪贴板图片粘贴上传 | `MonacoEditor.tsx` | Ctrl+V 图片自动处理 |
| 3 | X-002 | 导出 HTML | 新建 `utils/export.ts` | 将预览结果导出 HTML |
| 4 | X-003 | 导出 PDF | 新建 `utils/export.ts` | 将预览结果导出 PDF |
| 5 | X-004 | 导入本地 .md 文件 | `FileExplorer.tsx` | 文件选择器导入 |
| 6 | UX-002 | 富文本粘贴 (HTML→Markdown) | 新建 `utils/paste.ts` | Word/网页粘贴自动转换 |
| 7 | PERF-001 | 大文档虚拟渲染 | `MarkdownPreview.tsx` | 长文档预览性能 |
| 8 | A11Y-001 | 键盘导航/快捷键提示 | `EditorToolbar.tsx`, `SettingsPanel.tsx` | 工具栏/面板 |

### P2 — 功能增强

| # | ID | 任务 | 相关文件 | 备注 |
|---|-----|------|----------|------|
| 1 | M-003 | 图片灯箱预览 | `MarkdownPreview.tsx` | 预览区图片点击放大 |
| 2 | M-004 | Mermaid 图表渲染 | `MarkdownPreview.tsx` | 流程图/时序图/饼图 |
| 3 | E-016 | 代码块行号显示 | `MarkdownPreview.tsx` | SyntaxHighlighter 行号 |
| 4 | E-017 | 代码块复制按钮 | `MarkdownPreview.tsx` | 一键复制代码块 |
| 5 | EX-002 | Mermaid 图表语法 | `MarkdownPreview.tsx` | \`\`\`mermaid 渲染 |
| 6 | EX-003 | 脚注支持 | — | remark-gfm 已支持，待验证 |
| 7 | EX-004 | Admonition/Callout 块 | 自定义 remark 插件 | 警告/提示区块 |
| 8 | EX-006 | 自动目录生成 | `MarkdownPreview.tsx` | 文档内 TOC 链接 |
| 9 | E-019 | Front Matter / YAML | 新建 `utils/frontmatter.ts` | Markdown 元数据 |
| 10 | UX-004 | Emoji 选择器 | 新建 `EmojiPicker.tsx` | 工具栏按钮 |
| 11 | UX-005 | 打字机模式 | `MonacoEditor.tsx` | 光标视口居中 |
| 12 | UX-006 | 焦点模式 | — | 只显示当前段落 |
| 13 | UX-007 | 全屏/专注编辑 | `App.tsx` | 隐藏多余 UI |
| 14 | PERF-002 | 预览区域防抖渲染 | `MarkdownPreview.tsx` | 减少过度刷新 |
| 15 | PERF-003 | Monaco 懒加载 | `MonacoEditor.tsx` | 按需加载 |
| 16 | X-005 | 批量导出多文件 | — | 批量下载 |
| 17 | X-006 | 导入/导出编辑器配置 | — | 主题/工具栏配置文件 |
| 18 | A11Y-002 | ARIA 标签完善 | 多处 | 屏幕阅读器支持 |
| 19 | A11Y-003 | 高对比度主题 | 主题系统 | 无障碍对比度 |
| 20 | I18N-002 | 更多语言包 | `locales/` | 日语/法语/西语 |
| 21 | FIX-003 | 多标签页编辑 | 新建 `TabBar.tsx` | 同时打开多文件 |
| 22 | E-018 | 拼写检查 | `MonacoEditor.tsx` | Monaco 拼写纠错 |

### P3 — 远期规划

| # | ID | 任务 | 备注 |
|---|-----|------|------|
| 1 | ARC-003 | 插件系统架构 | 可扩展机制 |
| 2 | ARC-004 | Git 集成 | 版本控制 |
| 3 | ARC-005 | 协作编辑 | Yjs/CRDT 多人实时 |
| 4 | ARC-006 | PWA / 离线支持 | Service Worker |
| 5 | I18N-001 | RTL 语言支持 | 阿拉伯语等从右到左 |
| 6 | UX-001 | WYSIWYG 所见即所得模式 | Typora 式编辑 |
| 7 | UX-003 | 多光标编辑 | Monaco API 暴露 |
| 8 | UX-008 | 编辑历史面板 | 可视浏览 undo/redo |
| 9 | UX-009 | 阅读时间显示 | 状态栏估算 |
| 10 | M-005 | 视频/音频嵌入 | HTML5 媒体标签 |
| 11 | EX-005 | 定义列表 | DL/DT/DD 语法 |

---

## 三、统计

| 类别 | 数量 |
|------|------|
| 已实现功能 | 64 |
| P0 待开发 | 2 |
| P1 待开发 | 8 |
| P2 待开发 | 22 |
| P3 长期规划 | 11 |
| **总计待开发** | **43** |
