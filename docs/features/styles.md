# 样式系统

## 8.1 CSS 变量

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| C-001 | 亮色主题变量 | ✅ | `globals.css` | :root |
| C-002 | 暗色主题变量 | ✅ | `globals.css` | .dark |
| C-003 | 主题切换 | ✅ | `App.tsx` | class 切换 |
| C-004 | 搜索高亮样式 | ✅ | `globals.css` | search-highlight |
| C-005 | 多主题配色 | ✅ | `globals.css`, `types/index.ts` | blue/purple/green 主题 |
| C-006 | 主题选择器 | ✅ | `SettingsPanel.tsx` | 网格选择 UI |
| C-007 | FileExplorer 主题化 | ✅ | `globals.css`, `FileExplorer.tsx` | 拖拽指示器/活动文件颜色 |
| C-008 | Monaco 编辑器主题化 | ✅ | `MonacoEditor.tsx` | 所有 5 主题对应编辑器配色 |

## 8.2 Tailwind

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| C-010 | 基础配置 | ✅ | `tailwind.config.js` | presets |
| C-011 | 自定义颜色 | ✅ | `tailwind.config.js` | vscode 颜色 |
| C-012 | 自定义字体 | ✅ | `tailwind.config.js` | Inter/JetBrains |
