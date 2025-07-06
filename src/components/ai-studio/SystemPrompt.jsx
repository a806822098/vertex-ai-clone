import { useState, useEffect } from 'react'
import { 
  CodeBracketIcon, 
  EyeIcon, 
  EyeSlashIcon,
  DocumentDuplicateIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const PROMPT_TEMPLATES = {
  helpful: {
    name: 'Helpful Assistant',
    content: 'You are a helpful, harmless, and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content.'
  },
  coder: {
    name: 'Code Expert',
    content: 'You are an expert programmer who helps with code-related questions. Provide clear, well-commented code examples. Follow best practices and explain your reasoning.'
  },
  analyst: {
    name: 'Data Analyst',
    content: 'You are a data analyst who helps interpret data and provide insights. Be precise with numbers, cite your sources, and explain your analytical approach clearly.'
  },
  creative: {
    name: 'Creative Writer',
    content: 'You are a creative writer who helps with storytelling, content creation, and creative projects. Be imaginative, engaging, and adapt your style to the user\'s needs.'
  }
}

function SystemPrompt({ value, onChange, className }) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [localValue, setLocalValue] = useState(value || '')
  const [showTemplates, setShowTemplates] = useState(false)
  
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value)
    }
  }, [value])
  
  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange?.(newValue)
  }
  
  const applyTemplate = (template) => {
    setLocalValue(template.content)
    onChange?.(template.content)
    setShowTemplates(false)
  }
  
  const characterCount = localValue.length
  const tokenEstimate = Math.ceil(characterCount / 4)
  
  return (
    <div className={clsx('bg-vertex-bg-secondary rounded-lg shadow-sm border border-vertex-border', className)}>
      <div className="border-b border-vertex-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-vertex-text-secondary" />
            <h3 className="text-sm font-semibold text-vertex-text-primary">System Instructions</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                'hover:bg-vertex-bg-tertiary text-vertex-text-secondary hover:text-vertex-text-primary'
              )}
            >
              <DocumentDuplicateIcon className="w-4 h-4 inline mr-1" />
              Templates
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                isPreviewMode 
                  ? 'bg-vertex-accent/20 text-vertex-accent' 
                  : 'hover:bg-vertex-bg-tertiary text-vertex-text-secondary hover:text-vertex-text-primary'
              )}
            >
              {isPreviewMode ? (
                <>
                  <EyeSlashIcon className="w-4 h-4 inline mr-1" />
                  Edit
                </>
              ) : (
                <>
                  <EyeIcon className="w-4 h-4 inline mr-1" />
                  Preview
                </>
              )}
            </button>
          </div>
        </div>
        
        {showTemplates && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {Object.entries(PROMPT_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => applyTemplate(template)}
                className="text-left p-3 rounded-md border border-vertex-border hover:border-vertex-accent hover:bg-vertex-accent/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-4 h-4 text-vertex-accent" />
                  <span className="text-sm font-medium text-vertex-text-primary">{template.name}</span>
                </div>
                <p className="text-xs text-vertex-text-secondary line-clamp-2">{template.content}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4">
        {isPreviewMode ? (
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-vertex-bg-tertiary rounded-md min-h-[200px]">
              {localValue ? (
                <p className="whitespace-pre-wrap text-vertex-text-primary">{localValue}</p>
              ) : (
                <p className="text-vertex-text-tertiary italic">No system instructions set</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={localValue}
              onChange={handleChange}
              placeholder="Enter system instructions to define the AI's behavior, personality, and constraints..."
              className={clsx(
                'w-full min-h-[200px] p-3 text-sm font-mono',
                'border border-vertex-border rounded-md bg-vertex-bg-tertiary text-vertex-text-primary',
                'focus:ring-2 focus:ring-vertex-accent focus:border-vertex-accent',
                'resize-y'
              )}
            />
            
            <div className="flex items-center justify-between text-xs text-vertex-text-secondary">
              <div className="flex items-center gap-3">
                <span>{characterCount} characters</span>
                <span>≈ {tokenEstimate} tokens</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setLocalValue('')
                    onChange?.('')
                  }}
                  className="text-vertex-text-secondary hover:text-vertex-text-primary"
                >
                  Clear
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(localValue)
                  }}
                  className="text-vertex-text-secondary hover:text-vertex-text-primary"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="px-4 pb-4">
        <div className="bg-vertex-accent/10 border border-vertex-accent/20 rounded-md p-3">
          <p className="text-xs text-vertex-accent">
            <strong>Tip:</strong> System instructions are prepended to every conversation and help define consistent behavior across all interactions.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SystemPrompt