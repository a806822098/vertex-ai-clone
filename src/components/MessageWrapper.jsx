import { useState } from 'react'
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import MessageContent from './MessageContent'

function MessageWrapper({ message, isStreaming }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString()
  }

  return (
    <div
      className={clsx(
        'flex animate-fade-in group',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={clsx(
          'max-w-3xl px-4 py-3 rounded-lg relative',
          message.role === 'user'
            ? 'bg-vertex-accent text-white ml-12'
            : message.isError
            ? 'bg-vertex-error/10 text-vertex-error border border-vertex-error/20 mr-12'
            : 'bg-vertex-bg-secondary text-vertex-text-primary border border-vertex-border mr-12'
        )}
      >
        {/* Header with timestamp and copy button */}
        <div className="flex items-center justify-between mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-vertex-text-tertiary">
            {formatTimestamp(message.timestamp)}
          </span>
          {message.role === 'assistant' && !message.isError && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2 py-0.5 text-xs text-vertex-text-tertiary hover:text-vertex-text-secondary transition-colors"
              title="Copy message"
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3 h-3" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Message content */}
        <MessageContent 
          content={message.content} 
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}

export default MessageWrapper