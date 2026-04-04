# Prest - VSCode 风格 Markdown 编辑器

## 项目概述

Prest 是一个基于 Web 的 Markdown 编辑器，采用 VSCode 风格的三栏布局设计，集成 Pretext 文本布局引擎，提供高性能的实时预览体验。

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
| Pretext | 本地实现 | 文本布局引擎 |

## 项目目录结构

```
prest/
├── public/                     # 静态资源
├── src/
│   ├── components/             # React 组件
│   │   ├── layout/            # 布局组件
│   │   ├── editor/            # 编辑器组件
│   │   ├── preview/           # 预览组件
│   │   └── sidebar/           # 侧边栏组件
│   ├── stores/                # Zustand 状态管理
│   ├── services/              # 业务服务
│   ├── lib/                   # 工具库
│   ├── types/                 # TypeScript 类型
│   ├── styles/                # 全局样式
│   ├── config/                # 配置文件
│   ├── App.tsx                # 主应用
│   └── main.tsx               # 入口文件
├── docs/                       # 项目文档
│   ├── SPECIFICATIONS.md      # 技术规范
│   ├── REQUIREMENTS.md        # 功能需求
│   ├── TASK_PLAN.md           # 任务计划
│   └── FEATURE_CHECKLIST.md   # 功能完备记录
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
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

## 核心特性

- **VSCode 风格界面** - 三栏可调整布局
- **Monaco Editor** - 专业级代码编辑体验
- **实时预览** - Markdown 即时渲染
- **Pretext 布局引擎** - 高性能文本测量
- **多主题支持** - 深色/浅色主题切换
- **状态持久化** - 自动保存用户偏好

## 浏览器支持

- Chrome 90+
- Firefox 90+
- Safari 15+
- Edge 90+

## 许可证

MIT License