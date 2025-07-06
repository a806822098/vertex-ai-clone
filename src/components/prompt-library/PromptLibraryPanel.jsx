import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import PromptLibrary from '../../prompt-library/components/PromptLibrary'

function PromptLibraryPanel({ isOpen, onClose, onSelectPrompt }) {
  const [selectedPrompt, setSelectedPrompt] = useState(null) // eslint-disable-line no-unused-vars

  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt)
    if (onSelectPrompt) {
      onSelectPrompt(prompt)
    }
  }

  return (
    <div className={clsx(
      'fixed right-0 top-0 h-full z-50 transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="h-full w-[600px] bg-vertex-bg-secondary shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-vertex-border">
          <h2 className="text-lg font-semibold text-vertex-text-primary">Prompt Library</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-vertex-bg-tertiary transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-vertex-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <PromptLibrary 
            onSelectPrompt={handlePromptSelect}
            isPanel={true}
          />
        </div>
      </div>
    </div>
  )
}

export default PromptLibraryPanel