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
- [服务层](features/services.md) — Pretext 布局、Markdown 解析
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
| P2 | 4 | 2 | 0 | 2 |
| **总计** | **43** | **41** | **0** | **2** |

- **P0 功能完成率:** 100% (21/21)
- **P1 功能完成率:** 100% (18/18)
- **P2 功能完成率:** 50% (2/4)
- **总体完成率:** 95.3% (41/43)

### 文件统计

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
| 2.2 | UX-002 富文本粘贴 | ⏳ | 2h | 新建 `utils/paste.ts` |
| 2.3 | X-002/X-003 导出 HTML/PDF | ⏳ | 3h | 新建 `utils/export.ts` |
| 2.4 | X-004 导入本地文件 | ⏳ | 1h | `FileExplorer.tsx` |
| 2.5 | FIX-001 同步滚动精确映射 | ⏳ | 3h | `PretextService.ts`, `MonacoEditor.tsx` |
| 2.6 | PERF-001 大文档虚拟渲染 | ⏳ | 4h | `MarkdownPreview.tsx`, `PretextService.ts` |
| 2.7 | SEC-002 CSP 安全策略 | ⏳ | 1h | `index.html`, `vite.config.ts` |
| 2.8 | FIX-005 浏览器兼容性测试 | ⏳ | 2h | - |
| 2.9 | FIX-006 响应式布局完善 | ⏳ | 3h | `AppLayout.tsx`, `globals.css` |
| 2.10 | A11Y-001 键盘导航/快捷键提示 | ⏳ | 2h | `EditorToolbar.tsx`, `SettingsPanel.tsx` |

### Phase 3: 功能丰富与体验（P2）

| 序号 | 任务 | 状态 | 预估工作量 | 相关文件 |
|------|------|------|-----------|----------|
| 3.1 | UX-004 Emoji 选择器 | ⏳ | 2h | 新建 `EmojiPicker.tsx`, `tools.tsx` |
| 3.2 | EX-002 Mermaid 图表 | ⏳ | 3h | `MarkdownPreview.tsx` |
| 3.3 | E-016/E-017 代码块行号 & 复制 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.4 | M-003 图片点击放大/灯箱 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.5 | EX-004 Admonition/Callout | ⏳ | 2h | 自定义 remark 插件 |
| 3.6 | E-019 Front Matter 支持 | ⏳ | 2h | 新建 `utils/frontmatter.ts` |
| 3.7 | EX-006 自动目录生成 | ⏳ | 2h | `MarkdownPreview.tsx` |
| 3.8 | PERF-002/003/004 性能优化 | ⏳ | 4h | 多处 |
| 3.9 | X-005/X-006 批量导出 & 配置导出 | ⏳ | 2h | 新建 `utils/configExport.ts` |
| 3.10 | I18N-002/A11Y 语言包 & 无障碍 | ⏳ | 2h | `locales/` |

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
| 4.13 | I18N-001 RTL 语言支持 | ⏳ | 3h | 从右到左书写 |