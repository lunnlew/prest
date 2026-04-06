import { useBoundStore } from '../stores'

// Convert HTML to Markdown (basic conversion)
export function htmlToMarkdown(html: string): string {
  if (!html) return ''

  let markdown = html
    // Headers - process from highest to lowest level
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Strikethrough
    .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Links
    .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
    .replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![$1]($2)')
    .replace(/<img[^>]*src=["']([^"']*)["'][^>]*\/?>/gi, '![]($1)')
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, content) => {
      const lines = content.trim().split('\n').map((line: string) => '> ' + line)
      return lines.join('\n') + '\n'
    })
    // Lists
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    // Horizontal rule
    .replace(/<hr[^>]*\/?>/gi, '\n---\n')
    // Paragraphs and line breaks
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br[^>]*\/?>/gi, '\n')
    // Remove remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')

  return markdown.trim()
}

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
