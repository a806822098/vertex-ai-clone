import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import clsx from 'clsx'
import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import '../styles/code-highlight.css'

function MessageContent({ content, isStreaming = false }) {
  const [copiedCode, setCopiedCode] = useState(null)

  // 防御性处理：确保content是字符串
  const safeContent = (() => {
    // 处理null/undefined
    if (content === null || content === undefined) return ''
    
    // 处理布尔值 - 特别重要！
    if (typeof content === 'boolean') return ''
    
    // 处理字符串
    if (typeof content === 'string') {
      // 移除可能的false字符串
      if (content.includes(',false')) {
        console.warn('Detected ",false" in content, cleaning up:', content)
        return content.replace(/,false/g, '')
      }
      return content
    }
    
    // 处理数字
    if (typeof content === 'number') return String(content)
    
    // 处理数组
    if (Array.isArray(content)) {
      // 过滤掉非字符串元素
      return content
        .filter(item => typeof item === 'string' || typeof item === 'number')
        .map(String)
        .join('\n')
    }
    
    // 处理对象
    if (typeof content === 'object') {
      // 尝试提取对象中的文本内容
      const textValue = content.text || content.message || content.content || 
                       content.result || content.output || content.response
      if (textValue && typeof textValue === 'string') return textValue
      if (textValue && typeof textValue === 'number') return String(textValue)
      
      // 最后的防御：返回友好的错误消息
      console.warn('MessageContent received non-string content:', content)
      return '无法显示消息内容'
    }
    
    // 兜底处理
    console.error('Unexpected content type:', typeof content, content)
    return ''
  })()

  const copyToClipboard = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(index)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <div className={clsx(
          'prose prose-invert max-w-none',
          'prose-p:leading-relaxed prose-p:mb-2',
          'prose-headings:text-vertex-text-primary prose-headings:font-semibold',
          'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
          'prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2',
          'prose-strong:text-vertex-text-primary prose-strong:font-semibold',
          'prose-em:text-vertex-text-primary',
          'prose-a:text-vertex-accent prose-a:no-underline hover:prose-a:underline',
          'prose-blockquote:border-l-4 prose-blockquote:border-vertex-border prose-blockquote:pl-4 prose-blockquote:text-vertex-text-secondary',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:text-vertex-text-primary prose-li:marker:text-vertex-text-tertiary',
          'prose-code:text-vertex-accent prose-code:bg-vertex-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none',
          'prose-pre:bg-transparent prose-pre:p-0',
          'prose-hr:border-vertex-border'
        )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
          components={{
        pre({ children, ...props }) {
          const codeElement = children?.props
          const code = codeElement?.children || ''
          const language = codeElement?.className?.replace('language-', '') || 'text'
          const codeIndex = Math.random()

          return (
            <div className="relative group my-3">
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-vertex-bg-tertiary rounded-t-lg border border-vertex-border border-b-0">
                <span className="text-xs text-vertex-text-tertiary font-medium">
                  {language}
                </span>
                <button
                  onClick={() => copyToClipboard(code, codeIndex)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-vertex-text-secondary hover:text-vertex-text-primary transition-colors"
                >
                  {copiedCode === codeIndex ? (
                    <>
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre 
                {...props} 
                className="!mt-0 !rounded-t-none overflow-x-auto p-4 bg-[#0d1117] border border-vertex-border border-t-0 rounded-b-lg"
              >
                {children}
              </pre>
            </div>
          )
        },
        code({ inline, children, ...props }) {
          if (inline) {
            return (
              <code {...props} className="text-vertex-accent bg-vertex-bg-tertiary px-1 py-0.5 rounded text-sm">
                {children}
              </code>
            )
          }
          return <code {...props}>{children}</code>
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-vertex-border" {...props}>
                {children}
              </table>
            </div>
          )
        },
        thead({ children, ...props }) {
          return (
            <thead className="bg-vertex-bg-tertiary" {...props}>
              {children}
            </thead>
          )
        },
        th({ children, ...props }) {
          return (
            <th className="px-3 py-2 text-left text-xs font-medium text-vertex-text-primary uppercase tracking-wider" {...props}>
              {children}
            </th>
          )
        },
        td({ children, ...props }) {
          return (
            <td className="px-3 py-2 text-sm text-vertex-text-primary border-t border-vertex-border" {...props}>
              {children}
            </td>
          )
        }
          }}
          >
            {safeContent}
          </ReactMarkdown>
        </div>
        {isStreaming && <span className="inline-block w-1 h-4 bg-vertex-accent animate-pulse ml-0.5" />}
      </>
  )
}

export default MessageContent