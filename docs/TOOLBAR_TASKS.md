# 工具栏按钮功能实现任务计划

创建时间: 2026-04-06
状态: 进行中

## 任务列表

| # | 任务 | 状态 | 优先级 |
|---|------|------|--------|
| 1 | 代码块 - 插入 ``` 并可选择语言 | 已完成 | P1 |
| 2 | 公式块 - 插入 $$...$$ KaTeX | 已完成 | P1 |
| 3 | Emoji - 弹出 Emoji 选择器 | 已完成 | P2 |
| 4 | 脚注 - 插入脚注语法 | 已完成 | P2 |
| 5 | 定义列表 - 插入 dl/dt/dd 结构 | 已完成 | P2 |
| 6 | 字体颜色 - 弹出颜色选择器 | 已完成 | P2 |
| 7 | 字体背景 - 弹出背景色选择器 | 已完成 | P2 |
| 8 | 导入文件 - 导入 .md 文件 | 已完成 | P1 |
| 9 | 导出 HTML - 导出为 HTML | 已完成 | P1 |
| 10 | 导出 PDF - 导出为 PDF | 已完成 | P1 |
| 11 | 复制公众号 - 复制为公众号格式 | 已完成 | P2 |
| 12 | 复制微博 - 复制为微博格式 | 已完成 | P2 |
| 13 | 专注模式 - 隐藏 UI 只留编辑区 | 已完成 | P1 |
| 14 | 打字机模式 - 光标视口居中 | 已完成 | P1 |
| 15 | 全屏 - F11 全屏切换 | 已完成 | P2 |

## 任务详情

### Task #1: 代码块 (codeBlock)
- 文件: `src/stores/editorSlice.ts`, `src/components/editor/CodeBlockDialog.tsx`
- 功能: 插入 ``` 并弹出语言选择对话框
- 实现状态: 已完成
  - 创建了 CodeBlockDialog.tsx 组件，支持语言搜索和选择
  - 修改了 editorSlice.ts 的 formatMarkdown 支持 lang 参数
  - 在 EditorToolbar 中添加了 codeBlock 的自定义处理器
  - 修复了未使用变量 code 的 TypeScript 错误

### Task #2: 公式块 (math)
- 文件: `src/stores/editorSlice.ts`
- 功能: 插入 $$...$$ KaTeX 公式块
- 实现状态: 已完成
  - formatMarkdown 中已有 math 格式处理
  - 模板: $$\n{placeholder}\n$$

### Task #3: Emoji 选择器 (emoji)
- 文件: `src/components/editor/EmojiPicker.tsx`
- 功能: 弹出 Emoji 选择面板
- 实现状态: 已完成
  - 创建了 EmojiPicker.tsx 组件
  - 支持多类别emoji（表情、手势、心形、物品、符号、自然、食物、动物、旅行、活动）
  - 支持搜索过滤
  - 使用 insertText 插入 emoji

### Task #4: 脚注 (footnote)
- 文件: `src/stores/editorSlice.ts`
- 功能: 插入 [^n] 脚注，自动递增编号
- 实现: 需要维护脚注计数器

### Task #5: 定义列表 (definitionList)
- 文件: `src/stores/editorSlice.ts`
- 功能: 插入 dl/dt/dd 结构
- 实现: 直接插入模板

### Task #6: 字体颜色 (fontColor)
- 文件: 新建颜色选择组件
- 功能: 弹出颜色选择器，插入 HTML span
- 实现: 需要颜色选择器 UI

### Task #7: 字体背景 (fontBackground)
- 文件: 新建颜色选择组件
- 功能: 弹出颜色选择器，插入 HTML span
- 实现: 需要颜色选择器 UI

### Task #8: 导入文件 (importFile)
- 文件: `src/utils/importFile.ts`
- 功能: 打开文件选择器，导入 .md
- 实现: 使用 input type="file"

### Task #9: 导出 HTML (exportHtml)
- 文件: `src/utils/export.ts`
- 功能: 导出为 HTML 文件
- 实现: 需要 Markdown 转 HTML

### Task #10: 导出 PDF (exportPdf)
- 文件: `src/utils/export.ts`
- 功能: 导出为 PDF 文件
- 实现: 使用浏览器打印或 html2pdf

### Task #11: 复制公众号 (copyWechat)
- 文件: `src/utils/clipboard.ts`
- 功能: 一键复制为公众号格式
- 实现: 格式转换处理

### Task #12: 复制微博 (copyWeibo)
- 文件: `src/utils/clipboard.ts`
- 功能: 一键复制为微博格式
- 实现: 格式转换处理

### Task #13: 专注模式 (focusMode)
- 文件: `src/stores/editorSlice.ts` + 布局组件
- 功能: 隐藏 UI，只留编辑区
- 实现: 控制 sidebarVisible 等状态

### Task #14: 打字机模式 (typewriterMode)
- 文件: `src/components/editor/MonacoEditor.tsx`
- 功能: 光标保持在视口垂直居中
- 实现: 监听 cursorPosition，滚动到中间

### Task #15: 全屏 (fullscreen)
- 文件: `src/stores/editorSlice.ts`
- 功能: 切换全屏模式
- 实现: 使用 document.fullscreenElement API
