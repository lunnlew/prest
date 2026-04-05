# 布局功能

## 4.1 面板布局

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| L-001 | 三栏布局 | ✅ | `AppLayout.tsx` | react-resizable-panels |
| L-002 | 可调整面板 | ✅ | `AppLayout.tsx` | PanelResizeHandle |
| L-003 | 侧边栏显隐 | ✅ | `EditorToolbar.tsx` | toggleSidebar |
| L-004 | 预览区显隐 | ✅ | `EditorToolbar.tsx` | togglePreview |
| L-005 | 布局持久化 | ✅ | `useBoundStore.ts` | Zustand persist |
| L-006 | 响应式设计 | 🔄 | `AppLayout.tsx` | 基础响应式 |

## 4.2 分隔线

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| L-010 | 拖拽手柄 | ✅ | `ResizeHandle.tsx` | 自定义样式 |
| L-011 | 悬停效果 | ✅ | `ResizeHandle.tsx` | 高亮显示 |
| L-012 | 激活效果 | ✅ | `ResizeHandle.tsx` | 拖拽中样式 |
