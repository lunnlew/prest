# Prest 功能文档索引

## 图例说明

| 状态 | 符号 | 含义 |
|------|------|------|
| 完成 | ✅ | 功能已完整实现并通过测试 |
| 部分完成 | 🔄 | 功能已实现但需要优化 |
| 进行中 | 🚧 | 正在开发中 |
| 待开始 | ⏳ | 已规划但未开始 |
| 不实现 | ❌ | 该版本不实现 |

---

## 文档导航

### 功能详情
- [编辑器功能](features/editor.md) — 核心编辑、工具栏、快捷键、自动补全
- [预览功能](features/preview.md) — Markdown 渲染、GFM、预览样式
- [布局功能](features/layout.md) — 三栏布局、面板拖拽、分隔线
- [侧边栏功能](features/sidebar.md) — 文件树、大纲、搜索、设置
- [状态管理](features/state-management.md) — Zustand stores、actions
- [服务层](features/services.md) — Markdown 解析、XHS 分页引擎、文字测量
- [样式系统](features/styles.md) — CSS 变量、Tailwind 配置

### 专项文档
- [缺失功能补遗](missing-features.md) — 完整缺失功能清单，含优先级
- [图片导出](export/image-export.md) — PNG/PDF/HTML/WebP 导出
- [小红书排版出图](export/xiaohongshu.md) — 小红书专属模板与导出
- [测试验证](testing.md) — 功能测试、构建测试、兼容性测试

---

## 统计摘要

| 优先级 | 总数 | 完成 | 部分完成 | 待开始 |
|--------|------|------|----------|--------|
| P0 | 21 | 21 | 0 | 0 |
| P1 | 18 | 18 | 0 | 0 |
| P2 | 4 | 4 | 0 | 0 |
| **总计** | **43** | **43** | **0** | **0** |

- **P0 功能完成率:** 100% (21/21)
- **P1 功能完成率:** 100% (18/18)
- **P2 功能完成率:** 100% (4/4)
- **总体完成率:** 100% (43/43)

### 文件统计

| 类型 | 数量 | 说明 |
|------|------|------|
| React 组件 | 17 | 含 XHS 导出/预览新组件 |
| Store 文件 | 6 | editor/preview/layout/sidebar/settings + useBoundStore |
| Service 文件 | 3 | index.ts / MarkdownParser.ts / XHSPaginator.ts |
| 类型文件 | 1 | `types/index.ts` |
| lib 工具 | 1 | `pretext.ts` — 文字测量 |
| 配置文件 | 7 | vite/package/tailwind/tsconfig 等 |
| 样式文件 | 3 | globals.css / MarkdownPreview.css / xiaohongshu.css |
| **总计** | **38** | |

---

## 版本历史

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
| v0.5.3 | 2026-04-05 | 文件树：创建/重命名自动去重编号（区分后缀），同类型 sibling 不重名，文件与目录名可重叠 |
| v0.6.0 | 2026-04-05 | 小红书排版出图：预览组件/导出对话框/分页引擎/三种模板；移除 PretextService 改用浏览器 DOM 渲染 |
| v0.7.0 | 2026-04-05 | 大纲视图：滚动自动高亮/点击跳转定位/编辑器光标联动 |
| v0.7.1 | 2026-04-06 | XHS 导出宽度可调/隐藏页码时自动释放 footer 空间/面板布局自动保存持久化 |
| v0.8.0 | 2026-04-06 | 编辑器-预览区滚动同步（双向）/编辑器滚动-大纲同步选中 |
| v0.8.1 | 2026-04-06 | 侧边栏标签页选中状态持久化/语言切换即时更新生效 |
| v0.8.2 | 2026-04-06 | 水印配置独立栏目：位置(7种)/显示范围/透明度/大小，去掉话题标签 |

---

## 实现路线图

### Phase 1: 安全与基础完善（P0）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 1.1 | SEC-001 XSS sanitize | ✅ | 2h | `MarkdownPreview.tsx`, `package.json` |
| 1.2 | FIX-002 高亮文本预览渲染 | ✅ | 1h | `MarkdownPreview.tsx` |
| 1.3 | X-001 下载当前 .md 文件 | ✅ | 1h | `EditorToolbar.tsx`, `tools.tsx` |
| 1.4 | ARC-002 自动保存逻辑完整实现 | ⏳ | 2h | `settingsSlice.ts`, `MonacoEditor.tsx` |
| 1.5 | FIX-004 未保存状态指示器 | ⏳ | 0.5h | `EditorStatusBar.tsx` |
| 1.6 | ARC-001 真实文件系统对接 (IndexedDB) | ⏳ | 4h | `FileExplorer.tsx`, 新建 `storage/` |
| 1.7 | EX-001 数学公式 (KaTeX) | ✅ | 3h | `package.json`, `MarkdownPreview.tsx` |

### Phase 2: 核心体验提升（P1）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 2.1 | M-001/M-002 图片拖拽 & 粘贴上传 | ⏳ | 3h | `MonacoEditor.tsx` |
| 2.2 | UX-002 富文本粘贴 (HTML→Markdown) | ⏳ | 2h | 新建 `utils/paste.ts` |
| 2.3 | X-002/X-003 导出 HTML/PDF | ⏳ | 3h | 新建 `utils/export.ts` |
| 2.4 | X-004 导入本地文件 | ⏳ | 1h | `FileExplorer.tsx` |
| 2.5 | FIX-001 同步滚动精确映射 | ✅ | 3h | `MonacoEditor.tsx`, `OutlineView.tsx`, `PreviewPanel.tsx` — 编辑器-预览双向同步 + 大纲滚动联动 |
| 2.6 | PERF-001 大文档虚拟渲染 | ⏳ | 4h | `MarkdownPreview.tsx` |
| 2.7 | SEC-002 CSP 安全策略 | ⏳ | 1h | `index.html`, `vite.config.ts` |
| 2.8 | FIX-005 浏览器兼容性测试 | ⏳ | 2h | — |
| 2.9 | FIX-006 响应式布局完善 | ⏳ | 3h | `AppLayout.tsx`, `globals.css` |
| 2.10 | A11Y-001 键盘导航/快捷键提示 | ⏳ | 2h | `EditorToolbar.tsx`, `SettingsPanel.tsx` |

### Phase 3: 功能丰富与体验（P2）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 3.1 | UX-004 Emoji 选择器 | ⏳ | 2h | 新建 `EmojiPicker.tsx`, `tools.tsx` |
| 3.2 | EX-002 Mermaid 图表 | ⏳ | 3h | `MarkdownPreview.tsx` |
| 3.3 | E-016/E-017 代码块行号 & 复制 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.4 | M-003 图片点击放大/灯箱 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.5 | EX-004 Admonition/Callout 块 | ⏳ | 2h | 自定义 remark 插件 |
| 3.6 | E-019 Front Matter / YAML 元数据 | ⏳ | 2h | 新建 `utils/frontmatter.ts` |
| 3.7 | EX-006 自动目录生成 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.8 | PERF-002/003/004 性能优化 | ⏳ | 4h | 多处 |
| 3.9 | X-005/X-006 批量导出 & 配置导出 | ⏳ | 2h | 新建 `utils/configExport.ts` |
| 3.10 | I18N-002/A11Y 更多语言包 & 无障碍 | ✅ | 2h | `locales/` — zh-CN/en 双语 + 翻译键体系 |

### Phase 3.5: 小红书排版出图（新增特性）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 3.5.1 | 小红书预览组件 (XiaohongshuPreview) | ✅ | 3h | `XiaohongshuPreview.tsx` — 模板/水印/页码/分页块渲染 |
| 3.5.2 | 小红书 CSS 样式系统 | ✅ | 2h | `base.css` — cream/minimal/gradient 等30+套模板完整样式 |
| 3.5.3 | 分页估计算法 | ✅ | 2h | `XHSPaginator.ts`, `pretext.ts` — canvas 测量 + 安全系数 0.85 |
| 3.5.4 | 小红书导出对话框 | ✅ | 2h | `XHSExportDialog.tsx` — 比例/模板/页码导航/水印配置/分页卡片预览 |
| 3.5.5 | XHS 状态管理 | ✅ | 1h | `settingsSlice.ts`, `types/index.ts` — XHSExportSettings + defaultXHSExport |
| 3.5.6 | 工具栏快捷入口 | ✅ | 0.5h | `EditorToolbar.tsx` — 📕 按钮 + `toolbar.xhsExport` 翻译键 |
| 3.5.7 | 平台预览切换（文档/小红书） | ✅ | 0.5h | `PreviewPanel.tsx`, `previewSlice.ts` — selector + platformPreview state |
| 3.5.8 | 文字测量工具（最小化） | ✅ | 1h | `lib/pretext.ts` — prepare/layoutWithLines，仅 canvas 宽度测量 |
| 3.5.9 | 隐藏页码时自动释放分页空间 | ✅ | 1h | `XHSPaginator.ts`, `XiaohongshuPreview.tsx`, `base.css` — footer 高度自适应分页计算 |
| 3.5.10 | 导出宽度可调滑块 | ✅ | 1h | `XHSExportDialog.tsx`, `XHSPaginator.ts`, `base.css` — 宽度滑块 320-1920px，自动重排分页 |
| 3.5.11 | 水印配置独立栏目 | ✅ | 1h | `XHSExportDialog.tsx` — 位置(7种)/显示范围/透明度/大小，去掉话题标签 |

### Phase 4: 高级功能（P3）

| 序号 | 任务 | 状态 | 预估工作量 | 备注 |
|------|------|------|-----------|------|
| 4.1 | UX-001 WYSIWYG 所见即所得模式 | ⏳ | 8h | Typora 式编辑 |
| 4.2 | UX-003 多光标编辑 | ⏳ | 2h | Monaco API 暴露 |
| 4.3 | UX-005 打字机模式 | ⏳ | 2h | 光标视口居中 |
| 4.4 | UX-006 焦点模式 | ⏳ | 2h | 当前段落高亮 |
| 4.5 | UX-007 全屏/专注编辑 | ⏳ | 1h | 隐藏多余 UI |
| 4.6 | UX-008/009 编辑历史 & 阅读时间 | ⏳ | 2h | 状态面板 |
| 4.7 | FIX-003 多标签页编辑 | ⏳ | 3h | 多文件同时编辑 |
| 4.8 | EX-003/005 脚注 & 定义列表 | ⏳ | 2h | Markdown 扩展 |
| 4.9 | ARC-003 插件系统架构 | ⏳ | 4h | 插件机制设计 |
| 4.10 | ARC-004 Git 集成 | ⏳ | 4h | 版本控制 |
| 4.11 | ARC-005 协作编辑 (Yjs/CRDT) | ⏳ | 8h | 多人实时编辑 |
| 4.12 | ARC-006 PWA / 离线支持 | ⏳ | 4h | Service Worker |
| 4.13 | I18N-001 RTL 语言支持 | ⏳ | 3h | 阿拉伯语等从右到左 |

### Phase 5: 编辑体验优化（新增）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 5.1 | 大纲视图：滚动自动高亮 | ✅ | 1h | `OutlineView.tsx` — 基于 cursorPosition 计算 active heading |
| 5.2 | 大纲视图：点击跳转定位 | ✅ | 0.5h | `OutlineView.tsx` → Monaco `setPosition` + `revealLineInCenter` |
| 5.3 | 大纲视图：编辑器光标联动 | ✅ | 1h | `MonacoEditor.tsx` — useEffect 监听 cursorPosition，防循环检测 |
| 5.4 | MarkdownPreview 移除 Pretext 依赖 | ✅ | 1h | `pretext.ts` 最小化保留，仅 XHS 分页使用 |
| 5.5 | PretextService 删除 | ✅ | 0.5h | 改用 ResizeObserver 获取真实 DOM 尺寸 |
| 5.6 | 面板布局自动保存持久化 | ✅ | 0.5h | `AppLayout.tsx` — react-resizable-panels `autoSaveId` 保留分隔线位置 |
| 5.7 | 编辑器-预览区滚动同步 | ✅ | 2h | `MonacoEditor.tsx`, `PreviewPanel.tsx`, `previewSlice.ts` — 双向滚动同步，🔗 按钮切换 |
| 5.8 | 编辑器滚动-大纲同步选中 | ✅ | 1h | `MonacoEditor.tsx`, `OutlineView.tsx`, `previewSlice.ts` — 滚动时自动高亮对应标题 |
| 5.9 | 侧边栏标签页选中状态持久化 | ✅ | 0.5h | `useBoundStore.ts` — `activeSidebarTab` 添加到 persist partialize |
| 5.10 | 语言切换即时更新 | ✅ | 0.5h | `useTranslation.ts` — 语言包缓存时调用 setMessages 更新状态 |
