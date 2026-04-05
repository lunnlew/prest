# 预览功能

## 3.1 渲染功能

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

## 3.2 预览样式

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| P-020 | 标题样式 | ✅ | `MarkdownPreview.css` | 6级标题 |
| P-021 | 引用块样式 | ✅ | `MarkdownPreview.css` | 左边框 + 背景 |
| P-022 | 列表样式 | ✅ | `MarkdownPreview.css` | 有序/无序 |
| P-023 | 表格样式 | ✅ | `MarkdownPreview.css` | 边框 + hover |
| P-024 | 代码样式 | ✅ | `MarkdownPreview.css` | 行内 + 块级 |
| P-025 | 分隔线样式 | ✅ | `MarkdownPreview.css` | 水平线 |
