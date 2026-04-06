import type { ToolbarButtonId } from '../../../types'
import { buttons as basic, groupId as basicGroupId, ButtonConfig } from './basic'
import { buttons as headings, groupId as headingsGroupId } from './headings'
import { buttons as lists, groupId as listsGroupId } from './lists'
import { buttons as insert, groupId as insertGroupId } from './insert'
import { buttons as blocks, groupId as blocksGroupId } from './blocks'
import { buttons as alignment, groupId as alignmentGroupId } from './alignment'
import { buttons as advanced, groupId as advancedGroupId } from './advanced'
import { buttons as file, groupId as fileGroupId } from './file'
import { buttons as tools, groupId as toolsGroupId } from './tools'
import { buttons as view, groupId as viewGroupId } from './view'

// Re-export types
export type { ButtonConfig } from './basic'

// Re-export group IDs
export {
  basicGroupId,
  headingsGroupId,
  listsGroupId,
  insertGroupId,
  blocksGroupId,
  alignmentGroupId,
  advancedGroupId,
  fileGroupId,
  toolsGroupId,
  viewGroupId,
}

// All buttons grouped by category
export const buttonGroups = {
  basic,
  headings,
  lists,
  insert,
  blocks,
  alignment,
  advanced,
  file,
  tools,
  view,
} as const

// All buttons as a flat record for easy lookup
export const buttonConfigs: Record<ToolbarButtonId, ButtonConfig> = {
  ...Object.fromEntries(basic.map(b => [b.id, b])),
  ...Object.fromEntries(headings.map(b => [b.id, b])),
  ...Object.fromEntries(lists.map(b => [b.id, b])),
  ...Object.fromEntries(insert.map(b => [b.id, b])),
  ...Object.fromEntries(blocks.map(b => [b.id, b])),
  ...Object.fromEntries(alignment.map(b => [b.id, b])),
  ...Object.fromEntries(advanced.map(b => [b.id, b])),
  ...Object.fromEntries(file.map(b => [b.id, b])),
  ...Object.fromEntries(tools.map(b => [b.id, b])),
  ...Object.fromEntries(view.map(b => [b.id, b])),
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
