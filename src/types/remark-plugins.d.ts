// Type declarations for remark plugins without types

declare module 'remark-directive' {
  const remarkDirective: import('mdast').RemarkPlugin
  export default remarkDirective
}

declare module 'remark-deflist' {
  const remarkDeflist: import('mdast').RemarkPlugin
  export default remarkDeflist
}

declare module 'remark-abbr' {
  const remarkAbbr: import('mdast').RemarkPlugin
  export default remarkAbbr
}

declare module 'remark-emoji' {
  const remarkEmoji: import('mdast').RemarkPlugin
  export default remarkEmoji
}
