import type { ToolbarButtonId } from '../../../types'
import { buttons as headings, groupId as headingsGroupId, ButtonConfig } from './headings'
import { buttons as textFormatting, groupId as textFormattingGroupId } from './textFormatting'
import { buttons as codeLinks, groupId as codeLinksGroupId } from './codeLinks'
import { buttons as lists, groupId as listsGroupId } from './lists'
import { buttons as blocks, groupId as blocksGroupId } from './blocks'
import { buttons as alignment, groupId as alignmentGroupId } from './alignment'
import { buttons as tools, groupId as toolsGroupId } from './tools'

// Re-export types
export type { ButtonConfig } from './headings'

// Re-export group IDs
export {
  headingsGroupId,
  textFormattingGroupId,
  codeLinksGroupId,
  listsGroupId,
  blocksGroupId,
  alignmentGroupId,
  toolsGroupId,
}

// All buttons grouped by category
export const buttonGroups = {
  headings,
  textFormatting,
  codeLinks,
  lists,
  blocks,
  alignment,
  tools,
} as const

// All buttons as a flat record for easy lookup
export const buttonConfigs: Record<ToolbarButtonId, ButtonConfig> = {
  // Headings
  ...Object.fromEntries(headings.map(b => [b.id, b])),
  // Text formatting
  ...Object.fromEntries(textFormatting.map(b => [b.id, b])),
  // Code & Links
  ...Object.fromEntries(codeLinks.map(b => [b.id, b])),
  // Lists
  ...Object.fromEntries(lists.map(b => [b.id, b])),
  // Blocks
  ...Object.fromEntries(blocks.map(b => [b.id, b])),
  // Alignment
  ...Object.fromEntries(alignment.map(b => [b.id, b])),
  // Tools
  ...Object.fromEntries(tools.map(b => [b.id, b])),
} as Record<ToolbarButtonId, ButtonConfig>

// All button IDs
export const allButtonIds: ToolbarButtonId[] = Object.keys(buttonConfigs) as ToolbarButtonId[]

// Get button config by ID
export function getButtonConfig(id: ToolbarButtonId): ButtonConfig | undefined {
  return buttonConfigs[id]
}

// Get buttons by group
export function getButtonsByGroup(groupId: string): ButtonConfig[] {
  return buttonGroups[groupId as keyof typeof buttonGroups] || []
}