import { 
  DocumentDuplicateIcon, 
  PencilIcon, 
  TrashIcon,
  StarIcon,
  ClockIcon,
  UserIcon,
  HashtagIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { DEFAULT_CATEGORIES } from '../types'
import clsx from 'clsx'

function PromptCard({ prompt, viewMode, onSelect, onEdit, onDelete, onDuplicate }) {
  const category = DEFAULT_CATEGORIES.find(c => c.id === prompt.category)
  const isGrid = viewMode === 'grid'
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }
  
  return (
    <div
      className={clsx(
        'bg-vertex-bg-secondary rounded-lg shadow-sm border border-vertex-border',
        'hover:shadow-md transition-all duration-200 cursor-pointer',
        'group relative',
        isGrid ? 'p-4' : 'px-4 py-3'
      )}
      onClick={onSelect}
    >
      {/* Actions */}
      <div className={clsx(
        'absolute top-2 right-2 flex items-center gap-1',
        'opacity-0 group-hover:opacity-100 transition-opacity'
      )}>
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1.5 text-vertex-text-tertiary hover:text-vertex-text-secondary hover:bg-vertex-bg-tertiary rounded"
            title="Duplicate"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
          title="Edit"
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 text-vertex-text-tertiary hover:text-red-600 hover:bg-red-50 rounded"
          title="Delete"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Content */}
      <div className={isGrid ? 'space-y-3' : 'flex items-start gap-4'}>
        {/* Header */}
        <div className={isGrid ? '' : 'flex-1'}>
          <div className="flex items-start gap-2 mb-2">
            <span className="text-2xl">{category?.icon || '📝'}</span>
            <div className="flex-1">
              <h3 className="font-medium text-vertex-text-primary line-clamp-1">
                {prompt.name}
              </h3>
              {isGrid && (
                <p className="text-sm text-vertex-text-tertiary mt-1 line-clamp-2">
                  {prompt.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Preview */}
          {isGrid && (
            <div className="bg-vertex-bg-primary rounded-md p-3 text-sm text-vertex-text-secondary font-mono line-clamp-3">
              {prompt.content}
            </div>
          )}
          
          {/* Metadata */}
          <div className={clsx(
            'flex items-center gap-3 text-xs text-vertex-text-tertiary',
            isGrid ? 'mt-3' : ''
          )}>
            <div className="flex items-center gap-1">
              <UserIcon className="w-3 h-3" />
              <span>{prompt.metadata?.author || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(prompt.metadata?.updated || prompt.updated)}</span>
            </div>
            {prompt.metadata?.usageCount > 0 && (
              <div className="flex items-center gap-1">
                <span>Used {prompt.metadata.usageCount}x</span>
              </div>
            )}
          </div>
          
          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <div className={clsx(
              'flex items-center gap-1 flex-wrap',
              isGrid ? 'mt-3' : 'mt-2'
            )}>
              <HashtagIcon className="w-3 h-3 text-vertex-text-tertiary" />
              {prompt.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-vertex-bg-tertiary text-vertex-text-secondary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Rating (List view) */}
        {!isGrid && prompt.metadata?.rating !== undefined && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle rating update
                }}
                className="text-yellow-400"
              >
                {star <= prompt.metadata.rating ? (
                  <StarSolidIcon className="w-4 h-4" />
                ) : (
                  <StarIcon className="w-4 h-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Variable count badge */}
      {prompt.variables && prompt.variables.length > 0 && (
        <div className={clsx(
          'absolute bottom-2 left-2',
          'px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full'
        )}>
          {prompt.variables.length} variables
        </div>
      )}
    </div>
  )
}

export default PromptCard