# 侧边栏功能

## 5.1 Activity Bar

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-001 | 标签页切换 | ✅ | `SidebarPanel.tsx` | 4个标签 |
| S-002 | 活动状态显示 | ✅ | `SidebarPanel.tsx` | 高亮当前标签 |
| S-003 | 图标显示 | ✅ | `SidebarPanel.tsx` | Emoji 图标 |

## 5.2 文件浏览器

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-010 | 文件树显示 | ✅ | `FileExplorer.tsx` | 递归渲染 |
| S-011 | 文件夹展开/折叠 | ✅ | `FileExplorer.tsx` | expandedFolders |
| S-012 | 文件点击切换 | ✅ | `FileExplorer.tsx` | setContent |
| S-013 | 文件图标 | ✅ | `FileExplorer.tsx` | 文件/文件夹图标 |
| S-014 | 当前文件高亮 | ✅ | `FileExplorer.tsx` | currentFile |

## 5.3 大纲视图

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-020 | 标题提取 | ✅ | `MarkdownParser.ts` | extractHeadings |
| S-021 | 层级显示 | ✅ | `OutlineView.tsx` | 缩进表示 |
| S-022 | 点击跳转 | ✅ | `OutlineView.tsx` | setCursorPosition |
| S-023 | 空状态提示 | ✅ | `OutlineView.tsx` | No headings found |

## 5.4 搜索面板

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

## 5.5 设置面板

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| S-040 | 主题切换 | ✅ | `SettingsPanel.tsx` | toggleTheme |
| S-041 | 字体大小设置 | ✅ | `SettingsPanel.tsx` | 滑块 |
| S-042 | 行高设置 | ✅ | `SettingsPanel.tsx` | 滑块 |
| S-043 | 自动换行开关 | ✅ | `SettingsPanel.tsx` | wordWrap |
| S-044 | 同步滚动开关 | ✅ | `SettingsPanel.tsx` | syncScroll |
| S-045 | 自动保存开关 | ✅ | `SettingsPanel.tsx` | autoSave |
