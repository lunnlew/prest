import { useBoundStore } from '../stores'

// Convert markdown to WeChat public account format
export function copyWechat() {
  const { content } = useBoundStore.getState()

  // WeChat uses a specific HTML format
  let html = content
    // Headers - WeChat uses different header tags
    .replace(/^###### (.+)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Code blocks - WeChat code blocks
    .replace(/```(\w+)?\n([\s\S]+?)\n```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Images - WeChat requires specific format
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<p><img src="$2" alt="$1" /></p>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Lists
    .replace(/^- (.+)$/gm, '<p>• $1</p>')
    .replace(/^\d+\. (.+)$/gm, '<p>$1</p>')
    // Task lists
    .replace(/- \[ \] (.+)/g, '☐ $1')
    .replace(/- \[x\] (.+)/g, '☑ $1')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')

  // Wrap in WeChat-compatible HTML
  const wechatHtml = `<p>${html}</p>`

  navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([wechatHtml], { type: 'text/html' }),
      'text/plain': new Blob([content], { type: 'text/plain' })
    })
  ]).then(() => {
    console.log('Copied to clipboard (WeChat format)')
  }).catch(err => {
    console.error('Failed to copy:', err)
    // Fallback to plain text
    navigator.clipboard.writeText(content)
  })
}

// Convert markdown to Weibo format (simplified)
export function copyWeibo() {
  const { content } = useBoundStore.getState()

  // Weibo has character limit and simplified formatting
  let weibo = content
    // Headers to text
    .replace(/^#{1,6} (.+)$/gm, '【$1】')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '**$1**')
    // Italic
    .replace(/\*(.+?)\*/g, '*$1*')
    // Code blocks - Weibo doesn't support, convert to inline
    .replace(/```(\w+)?\n([\s\S]+?)\n```/g, '$2')
    // Inline code
    .replace(/`(.+?)`/g, '"$1"')
    // Links - keep text, remove URL
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)')
    // Images - just show alt text
    .replace(/!\[(.+?)\]\((.+?)\)/g, '[$1]')
    // Blockquotes
    .replace(/^> (.+)$/gm, '"$1"')
    // Lists
    .replace(/^- (.+)$/gm, '• $1')
    // Horizontal rule
    .replace(/^---$/gm, '────────')

  // Truncate if too long (Weibo limit is 2000 chars for regular posts)
  if (weibo.length > 2000) {
    weibo = weibo.substring(0, 1997) + '...'
  }

  navigator.clipboard.writeText(weibo).then(() => {
    console.log('Copied to clipboard (Weibo format)')
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}
