# 服务层

## 7.1 Pretext 服务

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| SV-001 | prepare | ✅ | `lib/pretext.ts` | 文本预处理 |
| SV-002 | layout | ✅ | `lib/pretext.ts` | 布局计算 |
| SV-003 | layoutWithLines | ✅ | `lib/pretext.ts` | 获取行信息 |
| SV-004 | calculateTotalHeight | ✅ | `PretextService.ts` | 总高度 |
| SV-005 | calculateScrollMapping | ✅ | `PretextService.ts` | 滚动映射 |
| SV-006 | 缓存管理 | ✅ | `PretextService.ts` | clearCache |

## 7.2 Markdown 解析

| ID | 功能 | 状态 | 实现文件 | 备注 |
|----|------|------|----------|------|
| SV-010 | parseMarkdownToBlocks | ✅ | `MarkdownParser.ts` | 解析为块 |
| SV-011 | extractHeadings | ✅ | `MarkdownParser.ts` | 提取标题 |
