# 状态管理

## 6.1 Store 实现

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

## 6.2 Actions 实现

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| Z-010 | setContent | ✅ | `editorSlice.ts` | 更新内容 |
| Z-011 | setCursorPosition | ✅ | `editorSlice.ts` | 更新光标 |
| Z-012 | undo/redo | ✅ | `editorSlice.ts` | 撤销/重做 |
| Z-013 | toggleSidebar | ✅ | `layoutSlice.ts` | 切换侧边栏 |
| Z-014 | togglePreview | ✅ | `layoutSlice.ts` | 切换预览 |
| Z-015 | toggleTheme | ✅ | `settingsSlice.ts` | 切换主题 |
| Z-016 | formatMarkdown | ✅ | `editorSlice.ts` | 格式化 Markdown |
