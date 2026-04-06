/**
 * 渲染器类型接口
 * 定义每种渲染器的 JSX 结构
 */
import type { ReactNode } from 'react'

export interface Renderer {
  h1: (children: ReactNode, fontTitle?: string) => JSX.Element
  h2: (children: ReactNode) => JSX.Element
  h3: (children: ReactNode) => JSX.Element
  h4: (children: ReactNode) => JSX.Element
  h5: (children: ReactNode) => JSX.Element
  h6: (children: ReactNode) => JSX.Element
  p: (children: ReactNode, fontBody?: string) => JSX.Element
  blockquote: (children: ReactNode) => JSX.Element
  ul: (children: ReactNode) => JSX.Element
  ol: (children: ReactNode) => JSX.Element
}

export type RendererType =
  | 'card'
  | 'bare'
  | 'magazine'
  | 'side'
  | 'classic'
  | 'scrapbook'
  | 'fullpage'
  | 'editorial'
  | 'quote'
  | 'timeline'
  | 'split'
  | 'banner'
