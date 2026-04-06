/**
 * 小红书模板配置中心（单一数据源）
 * 每套模板 = CSS文件（含样式+配色）+ 元数据 + 字体配置
 */
import type { XHSTemplate } from '../types'

export interface XHSTemplateMeta {
  /** 中文显示名称 */
  label: string
  /** 简短描述 */
  description: string
  /** 预览 emoji */
  emoji: string
  /** CSS 文件路径（相对于 src/styles/templates/） */
  cssFile: string
  /** 标题字体 */
  fontTitle: string
  /** 正文字体 */
  fontBody: string
}

export const XHS_TEMPLATE_META: Record<XHSTemplate, XHSTemplateMeta> = {
  // ===== 配色类模板（卡片式布局） =====
  cream:     { label: '奶油',   description: '温暖米色调，柔和卡片风格',     emoji: '🥛', cssFile: 'cream.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  minimal:   { label: '简约',   description: '黑白灰极简风，无卡片阴影',     emoji: '⬜', cssFile: 'minimal.css',   fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  gradient:  { label: '渐变',   description: '紫蓝渐变背景，白色卡片',       emoji: '🌈', cssFile: 'gradient.css',  fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  pink:      { label: '粉色',   description: '马卡龙粉色，少女心风格',       emoji: '🌸', cssFile: 'pink.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  mint:      { label: '薄荷',   description: '清新薄荷绿，清爽自然',         emoji: '🌿', cssFile: 'mint.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  lavender:  { label: '薰衣草', description: '浪漫薰衣草紫，高雅气质',        emoji: '💜', cssFile: 'lavender.css',  fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  peach:     { label: '蜜桃',   description: '温暖蜜桃色，柔和亲切',         emoji: '🍑', cssFile: 'peach.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  ink:       { label: '墨绿',   description: '传统中国风，墨绿配金',         emoji: '🖤', cssFile: 'ink.css',        fontTitle: 'bold 1.6em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.92em "PingFang SC", "Microsoft YaHei", sans-serif' },
  flame:     { label: '烈焰',   description: '热情红黑配，力量感',           emoji: '🔥', cssFile: 'flame.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  sakura:    { label: '樱花',   description: '粉嫩樱花色，日系甜美',         emoji: '🌸', cssFile: 'sakura.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  nordic:    { label: '北欧',   description: '冷淡北欧风，克制留白',         emoji: '❄️', cssFile: 'nordic.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  forest:    { label: '森林',   description: '清新森林绿，自然氧吧',         emoji: '🌲', cssFile: 'forest.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  magazine:  { label: '杂志',   description: '全宽封面标题、装饰分隔线',     emoji: '📰', cssFile: 'magazine.css',   fontTitle: '900 1.9em Georgia, "PingFang SC", serif',                  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  scrapbook: { label: '手账',   description: '彩色标题条、贴纸标签',         emoji: '📌', cssFile: 'scrapbook.css', fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  gallery:   { label: '画廊',   description: '暗黑背景，大量留白',           emoji: '🖼️', cssFile: 'gallery.css',   fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  wechat:    { label: '公众号', description: '大标题加粗、绿色竖线',          emoji: '💚', cssFile: 'wechat.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  notebook:  { label: '网格',   description: '手账网格纹理、印章标题',       emoji: '📓', cssFile: 'notebook.css',   fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  retro:     { label: '复古',   description: '牛皮纸纹理、圆形印章',         emoji: '🏺', cssFile: 'retro.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  tape:      { label: '胶带',   description: '胶带装饰、便签卡片',           emoji: '📎', cssFile: 'tape.css',       fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  postcard:  { label: '明信片', description: '装饰边框、邮票元素',           emoji: '🖼️', cssFile: 'postcard.css',   fontTitle: '800 1.7em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.92em "PingFang SC", "Microsoft YaHei", sans-serif' },
  // ===== 新增模板 =====
  sunset:    { label: '日落',   description: '橙红渐变、温暖夕阳',           emoji: '🌅', cssFile: 'sunset.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  ocean:     { label: '海洋',   description: '深邃蓝色、海浪元素',           emoji: '🌊', cssFile: 'ocean.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  aurora:    { label: '极光',   description: '绿紫渐变、梦幻极光',           emoji: '✨', cssFile: 'aurora.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  honey:     { label: '蜂蜜',   description: '金黄琥珀、甜蜜温暖',           emoji: '🍯', cssFile: 'honey.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  wine:      { label: '红酒',   description: '深红优雅、成熟韵味',           emoji: '🍷', cssFile: 'wine.css',       fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  lemon:     { label: '柠檬',   description: '清新柠檬黄、酸甜夏日',         emoji: '🍋', cssFile: 'lemon.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  matcha:    { label: '抹茶',   description: '日式抹茶绿、淡雅清新',         emoji: '🍵', cssFile: 'matcha.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  berry:     { label: '浆果',   description: '浆果紫红、酸甜浓郁',           emoji: '🫐', cssFile: 'berry.css',       fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  caramel:   { label: '焦糖',   description: '焦糖棕色、温暖甜蜜',           emoji: '🍮', cssFile: 'caramel.css',    fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  coral:     { label: '珊瑚',   description: '珊瑚粉橙、活力青春',           emoji: '🪸', cssFile: 'coral.css',      fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  sky:       { label: '天空',   description: '澄澈蓝天、云朵元素',           emoji: '☁️', cssFile: 'sky.css',        fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  autumn:    { label: '秋叶',   description: '秋叶橙褐、温暖复古',           emoji: '🍂', cssFile: 'autumn.css',     fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
  night:     { label: '夜空',   description: '深邃夜空、星星闪烁',           emoji: '🌙', cssFile: 'night.css',       fontTitle: 'bold 1.8em "PingFang SC", "Microsoft YaHei", sans-serif',  fontBody: '0.95em "PingFang SC", "Microsoft YaHei", sans-serif' },
}

/** 导出标签映射 */
export const TEMPLATE_LABELS = Object.fromEntries(
  Object.entries(XHS_TEMPLATE_META).map(([k, v]) => [k, v.label])
) as Record<XHSTemplate, string>

/** 模板下拉选项 */
export function getTemplateOptions() {
  return Object.entries(XHS_TEMPLATE_META).map(([key, meta]) => ({
    value: key as XHSTemplate,
    ...meta,
  }))
}

/** CSS 加载状态追踪 */
const loadedCSS = new Set<string>()
const loadedBase = new Set<string>()

/** 动态加载基础 CSS（仅加载一次） */
export async function loadBaseCSS(): Promise<void> {
  if (loadedBase.has('base')) return
  loadedBase.add('base')
  await import('../styles/base.css')
}

/** 动态加载模板 CSS */
export async function loadTemplateCSS(template: XHSTemplate): Promise<void> {
  const meta = XHS_TEMPLATE_META[template]
  if (!meta?.cssFile) return
  if (loadedCSS.has(meta.cssFile)) return
  loadedCSS.add(meta.cssFile)
  await import(`../styles/templates/${meta.cssFile}`)
}

/** 加载模板完整样式（base + template CSS） */
export async function loadTemplateFullCSS(template: XHSTemplate): Promise<void> {
  await loadBaseCSS()
  await loadTemplateCSS(template)
}
