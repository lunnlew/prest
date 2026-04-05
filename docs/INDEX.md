# Prest 项目文档索引

## 文档结构

```
docs/
├── INDEX.md                      # 本索引文件（快速导航）
├── FEATURE_CHECKLIST.md          # 功能文档主索引（统计 + 路线图 + 导航）
│
├── features/                     # 已实现功能详情
│   ├── editor.md                 #   核心编辑、工具栏、快捷键
│   ├── preview.md                #   Markdown 渲染、GFM、预览样式
│   ├── layout.md                 #   三栏布局、面板拖拽、分隔线
│   ├── sidebar.md                #   文件树、大纲、搜索、设置
│   ├── state-management.md       #   Zustand stores、actions
│   ├── services.md               #   Pretext 布局、Markdown 解析
│   └── styles.md                 #   CSS 变量、Tailwind 配置
│
├── export/                       # 导出功能规划
│   ├── image-export.md           #   通用图片导出（PNG/PDF/HTML/WebP）
│   └── xiaohongshu.md            #   小红书排版出图（模板 + 导出）
│
├── missing-features.md           # 缺失功能补遗（完整清单，含优先级）
└── testing.md                    # 测试验证（功能/构建/兼容性）
  └── archive/                    # 历史文档归档
├── archive/                      # 历史文档归档
│   ├── SPECIFICATIONS.md         #   技术规范（架构/状态/Pretext/构建）
│   ├── REQUIREMENTS.md           #   原始需求文档（需求/用户故事/NFR）
│   └── TASK_PLAN.md              #   任务实施记录（开发日志/里程碑）
```

## 按用途导航

### 了解项目全貌
- [FEATURE_CHECKLIST.md](FEATURE_CHECKLIST.md) — 统计摘要、版本历史、实现路线图
- [archive/SPECIFICATIONS.md](archive/SPECIFICATIONS.md) — 技术架构、状态管理协议、Monaco 规范、构建配置

### 了解需求
- [archive/REQUIREMENTS.md](archive/REQUIREMENTS.md) — 原始功能需求、验收标准、用户故事
- [missing-features.md](missing-features.md) — 缺失功能清单、优先级排序
- [export/xiaohongshu.md](export/xiaohongshu.md) — 小红书排版出图需求

### 开发参考
- [features/editor.md](features/editor.md) — 编辑器功能实现详情
- [features/preview.md](features/preview.md) — 预览功能实现详情
- [features/layout.md](features/layout.md) — 布局系统实现详情
- [features/sidebar.md](features/sidebar.md) — 侧边栏功能实现详情
- [features/state-management.md](features/state-management.md) — 状态管理实现详情
- [features/services.md](features/services.md) — 服务层实现详情
- [features/styles.md](features/styles.md) — 样式系统实现详情

### 导出功能
- [export/image-export.md](export/image-export.md) — 通用导出规划
- [export/xiaohongshu.md](export/xiaohongshu.md) — 小红书出图规划

### 测试验证
- [testing.md](testing.md) — 功能/构建/兼容性测试记录

### 历史任务记录
- [archive/TASK_PLAN.md](archive/TASK_PLAN.md) — 初始开发日志、任务实施记录

## 状态符号说明

| 符号 | 含义 |
|------|------|
| ✅ | 完成 - 已完整实现 |
| 🔄 | 部分完成 - 需要优化 |
| 🚧 | 进行中 |
| ⏳ | 待开始 |
| ❌ | 不实现 |
