# Prest - 小红书笔记导出工具

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=flat&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Monaco%20Editor-0.45-007ACC?style=flat&logo=visual-studio-code" alt="Monaco Editor">
</p>

Prest 是一个优雅的 Markdown 笔记预览和导出工具，采用 VSCode 风格的三栏布局设计，支持导出为小红书笔记格式。

## 核心功能

### 📝 Markdown 编辑
- **Monaco Editor** - 专业级代码编辑体验，支持语法高亮、代码折叠
- **实时预览** - Markdown 即时渲染，所见即所得
- **多主题支持** - 深色/浅色主题切换
- **键盘快捷键** - 完整的快捷键支持，提升效率

### 🎨 小红书模板导出
- **35+ 精美模板** - 涵盖多种风格，满足不同场景需求

| 分类 | 模板 |
|------|------|
| 配色类 | 奶油、简约、渐变、粉、薄荷、薰衣草、蜜桃 |
| 中国风 | 墨绿、复古、明信片 |
| 日系 | 樱花、手账、网格、胶带 |
| 欧美风 | 北欧、森林、杂志、画廊 |
| 情感类 | 烈焰、天空、夜空、极光 |
| 美食类 | 蜂蜜、焦糖、珊瑚、柠檬、抹茶、浆果 |
| 四季 | 日落、海洋、秋叶、红酒 |

- **多尺寸导出** - 支持 3:5、3:4、1:1、16:9 多种比例
- **水印设置** - 支持自定义水印、位置、透明度
- **分页导出** - 自动分页，导出 PDF 或 PNG

### 🤖 AI 辅助功能
- **AI 对话** - 内置 AI 助手，辅助写作
- **代码解释** - 智能解析代码片段

### 📄 Claude Skill 文档支持
- 支持 Skill 文档的 YAML frontmatter 元数据解析
- 自动渲染技能元信息面板

### 💾 数据持久化
- **IndexedDB 存储** - 本地自动保存文档
- **文件管理** - 支持创建、删除、重命名文件
- **导入导出** - 支持导入 Markdown 文件

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2.0 | UI 框架 |
| TypeScript | 5.4.2 | 类型安全 |
| Vite | 5.4.21 | 构建工具 |
| Monaco Editor | 0.45.0 | 代码编辑器 |
| react-markdown | 9.0.1 | Markdown 渲染 |
| react-resizable-panels | 2.0.19 | 可调整面板 |
| Zustand | 4.5.2 | 状态管理 |
| Tailwind CSS | 3.4.1 | 样式框架 |
| jsPDF | 4.2.1 | PDF 生成 |
| html2canvas | 1.4.1 | 页面截图 |

## 项目目录结构

```
prest/
├── public/                     # 静态资源
├── src/
│   ├── components/             # React 组件
│   │   ├── layout/           # 布局组件（侧边栏、编辑器、预览面板）
│   │   ├── editor/           # 编辑器组件（Monaco、工具栏、AI 对话）
│   │   ├── preview/          # 预览组件（Markdown、小红书模板）
│   │   └── sidebar/          # 侧边栏组件（文件管理、搜索、大纲）
│   ├── stores/               # Zustand 状态管理
│   ├── services/             # 业务服务（Markdown 解析、分页、导出）
│   ├── utils/                # 工具函数
│   ├── types/                # TypeScript 类型定义
│   ├── styles/               # 样式文件（模板 CSS）
│   │   └── templates/        # 小红书模板样式（35+ 套）
│   ├── config/               # 配置文件
│   └── hooks/                # React Hooks
├── docs/                      # 项目文档
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## Markdown 支持

- **GFM** - GitHub 风格 Markdown
- **数学公式** - KaTeX 渲染
- **代码高亮** - 多语言支持
- **表格** - 完整的表格语法
- **任务列表** - Todo list
- **脚注** - 注释支持
- **Emoji** - Emoji 快捷输入
- **自定义容器** - :::warning 等提示框

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## 许可证

MIT License
