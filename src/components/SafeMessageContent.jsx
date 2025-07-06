import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeHighlight from 'rehype-highlight'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import '../styles/code-highlight.css'

// 极度防御性的消息内容组件
function SafeMessageContent({ content, isStreaming = false }) {
  const [copiedCode, setCopiedCode] = useState(null)

  // 最强防御性处理
  const safeContent = (() => {
    try {
      // 1. 处理特殊值
      if (content === null || content === undefined) return ''
      if (typeof content === 'boolean') return ''
      
      // 2. 处理字符串
      if (typeof content === 'string') {
        // 清理可能的污染
        let cleaned = content
        
        // 移除可能的false污染
        if (cleaned.includes(',false')) {
          console.warn('Cleaning ",false" from content')
          cleaned = cleaned.replace(/,false/g, '')
        }
        
        // 移除可能的undefined/null字符串
        cleaned = cleaned
          .replace(/,undefined/g, '')
          .replace(/,null/g, '')
          .replace(/undefined/g, '')
          .replace(/null/g, '')
        
        return cleaned
      }
      
      // 3. 处理数字
      if (typeof content === 'number') {
        return String(content)
      }
      
      // 4. 处理数组
      if (Array.isArray(content)) {
        return content
          .filter(item => item != null && typeof item !== 'boolean')
          .map(item => {
            if (typeof item === 'string') return item
            if (typeof item === 'number') return String(item)
            return ''
          })
          .filter(Boolean)
          .join('\n')
      }
      
      // 5. 处理对象
      if (typeof content === 'object') {
        // 尝试所有可能的字段
        const possibleFields = [
          'text', 'message', 'content', 'result', 
          'output', 'response', 'data', 'body'
        ]
        
        for (const field of possibleFields) {
          if (content[field]) {
            const value = content[field]
            if (typeof value === 'string') return value
            if (typeof value === 'number') return String(value)
          }
        }
        
        // 如果没找到，返回空
        console.warn('Could not extract text from object:', content)
        return ''
      }
      
      // 6. 最后的兜底
      console.error('Unexpected content type:', typeof content, content)
      return ''
      
    } catch (error) {
      console.error('Error in safeContent processing:', error)
      return '内容处理出错'
    }
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

  // 简化的组件配置
  const components = {
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
    }
  }

  try {
    return (
      <div className="message-content-wrapper">
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-2 prose-headings:text-vertex-text-primary prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-h1:mb-3 prose-h2:mb-2 prose-h3:mb-2 prose-strong:text-vertex-text-primary prose-strong:font-semibold prose-em:text-vertex-text-primary prose-a:text-vertex-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-vertex-border prose-blockquote:pl-4 prose-blockquote:text-vertex-text-secondary prose-ul:my-2 prose-ol:my-2 prose-li:text-vertex-text-primary prose-li:marker:text-vertex-text-tertiary prose-code:text-vertex-accent prose-code:bg-vertex-bg-tertiary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-hr:border-vertex-border">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
          >
            {safeContent}
          </ReactMarkdown>
        </div>
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-vertex-accent animate-pulse ml-0.5" />
        )}
      </div>
    )
  } catch (error) {
    console.error('ReactMarkdown render error:', error)
    // 降级到纯文本显示
    return (
      <div className="message-content-wrapper">
        <pre className="whitespace-pre-wrap text-vertex-text-primary">
          {safeContent}
        </pre>
        {isStreaming && (
          <span className="inline-block w-1 h-4 bg-vertex-accent animate-pulse ml-0.5" />
        )}
      </div>
    )
  }
}

export default SafeMessageContent