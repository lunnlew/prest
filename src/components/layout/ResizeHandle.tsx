interface ResizeHandleProps {
  direction: 'vertical' | 'horizontal'
}

export function ResizeHandle({ direction }: ResizeHandleProps) {
  return (
    <div
      className={`
        flex items-center justify-center
        h-full w-full
        bg-[var(--resize-handle-bg)]
        hover:bg-[var(--resize-handle-hover-bg)]
        active:bg-[var(--resize-handle-active-bg)]
        transition-colors duration-150
        ${direction === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize'}
        group
      `}
      role="separator"
      aria-valuetext="Adjust panel size"
    >
      <div
        className={`
          rounded-full
          ${direction === 'vertical' ? 'w-0.5 h-8' : 'w-8 h-0.5'}
          bg-[var(--border-color)]
          group-hover:bg-[var(--accent-color)]
          transition-colors duration-150
        `}
      />
    </div>
  )
}