/**
 * 渲染器工厂
 * 组合渲染器结构 + 模板配色 = 完整渲染
 */
import type { Renderer, RendererType } from './renderers/types'
export type { RendererType } from './renderers/types'
import {
  cardRenderer,
  bareRenderer,
  magazineRenderer,
  sideRenderer,
  classicRenderer,
  scrapbookRenderer,
  fullpageRenderer,
  editorialRenderer,
  quoteRenderer,
  timelineRenderer,
  splitRenderer,
  bannerRenderer,
} from './renderers'

/** 渲染器映射 */
const RENDERER_MAP: Record<RendererType, Renderer> = {
  card: cardRenderer,
  bare: bareRenderer,
  magazine: magazineRenderer,
  side: sideRenderer,
  classic: classicRenderer,
  scrapbook: scrapbookRenderer,
  fullpage: fullpageRenderer,
  editorial: editorialRenderer,
  quote: quoteRenderer,
  timeline: timelineRenderer,
  split: splitRenderer,
  banner: bannerRenderer,
}

/**
 * 获取指定类型的渲染器
 */
export function getRenderer(type: RendererType): Renderer {
  return RENDERER_MAP[type] ?? cardRenderer
}

/**
 * 模板到渲染器类型的映射
 */
export type XHSTemplateType =
  | 'cream' | 'minimal' | 'gradient' | 'pink' | 'mint' | 'lavender' | 'peach'
  | 'ink' | 'flame' | 'sakura' | 'nordic' | 'forest'
  | 'magazine' | 'scrapbook' | 'gallery' | 'wechat' | 'notebook'
  | 'retro' | 'tape' | 'postcard'
  | 'sunset' | 'ocean' | 'aurora' | 'honey' | 'wine' | 'lemon' | 'matcha' | 'berry' | 'caramel' | 'coral' | 'sky' | 'autumn' | 'night'

/** 模板渲染器配置映射 */
export const TEMPLATE_RENDERERS: Record<XHSTemplateType, RendererType> = {
  cream: 'card',
  gradient: 'card',
  minimal: 'bare',
  gallery: 'bare',
  magazine: 'magazine',
  wechat: 'side',
  ink: 'classic',
  retro: 'classic',
  postcard: 'split',
  scrapbook: 'scrapbook',
  notebook: 'timeline',
  tape: 'scrapbook',
  sakura: 'editorial',
  pink: 'fullpage',
  mint: 'card',
  lavender: 'bare',
  peach: 'card',
  flame: 'banner',
  forest: 'card',
  nordic: 'bare',
  // 新增模板
  sunset: 'banner',
  ocean: 'card',
  aurora: 'bare',
  honey: 'card',
  wine: 'classic',
  lemon: 'card',
  matcha: 'card',
  berry: 'editorial',
  caramel: 'card',
  coral: 'card',
  sky: 'bare',
  autumn: 'card',
  night: 'bare',
}
