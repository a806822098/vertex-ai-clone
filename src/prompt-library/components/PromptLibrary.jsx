import { useState, useMemo } from 'react'
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  BookOpenIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { DEFAULT_CATEGORIES } from '../types'
import PromptCard from './PromptCard'
import PromptEditor from './PromptEditor'
import { usePrompts } from '../hooks/usePrompts'
import { useDebounce } from '../hooks/useDebounce'
import clsx from 'clsx'

function PromptLibrary({ onSelectPrompt, className }) {
  const { prompts, loading, error, createPrompt, updatePrompt, deletePrompt } = usePrompts()
  
  // UI State
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [showEditor, setShowEditor] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [sortBy, setSortBy] = useState('updated')
  const [sortOrder, setSortOrder] = useState('desc')
  
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  // Filter and sort prompts
  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts]
    
    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      filtered = filtered.filter(prompt => 
        prompt.name.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.content.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory)
    }
    
    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(prompt =>
        selectedTags.every(tag => prompt.tags.includes(tag))
      )
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'updated':
          aVal = new Date(a.metadata.updated)
          bVal = new Date(b.metadata.updated)
          break
        case 'usage':
          aVal = a.metadata.usageCount
          bVal = b.metadata.usageCount
          break
        case 'rating':
          aVal = a.metadata.rating
          bVal = b.metadata.rating
          break
        default:
          aVal = a.name
          bVal = b.name
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
    
    return filtered
  }, [prompts, debouncedSearch, selectedCategory, selectedTags, sortBy, sortOrder])
  
  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set()
    prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [prompts])
  
  const handleCreatePrompt = () => {
    setEditingPrompt(null)
    setShowEditor(true)
  }
  
  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt)
    setShowEditor(true)
  }
  
  const handleSavePrompt = async (promptData) => {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, promptData)
      } else {
        await createPrompt(promptData)
      }
      setShowEditor(false)
      setEditingPrompt(null)
    } catch (err) {
      console.error('Error saving prompt:', err)
    }
  }
  
  const handleDeletePrompt = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(promptId)
      } catch (err) {
        console.error('Error deleting prompt:', err)
      }
    }
  }
  
  const handleExport = () => {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      prompts: filteredPrompts
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompts-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.prompts && Array.isArray(data.prompts)) {
          for (const prompt of data.prompts) {
            await createPrompt(prompt)
          }
        }
      } catch (err) {
        console.error('Error importing prompts:', err)
        alert('Error importing prompts. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }
  
  return (
    <div className={clsx('flex flex-col h-full bg-vertex-bg-primary', className)}>
      {/* Header */}
      <div className="bg-vertex-bg-secondary border-b border-vertex-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-6 h-6 text-vertex-text-primary" />
            <h1 className="text-xl font-semibold text-vertex-text-primary">Prompt Library</h1>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              {filteredPrompts.length} prompts
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-vertex-bg-tertiary rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'grid' 
                    ? 'bg-vertex-bg-secondary text-vertex-text-primary shadow-sm' 
                    : 'text-vertex-text-tertiary hover:text-vertex-text-primary'
                )}
              >
                <ViewColumnsIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  viewMode === 'list' 
                    ? 'bg-vertex-bg-secondary text-vertex-text-primary shadow-sm' 
                    : 'text-vertex-text-tertiary hover:text-vertex-text-primary'
                )}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
            </div>
            
            {/* Import/Export */}
            <input
              type="file"
              id="import-prompts"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <label
              htmlFor="import-prompts"
              className="p-2 text-vertex-text-secondary hover:text-vertex-text-primary hover:bg-vertex-bg-tertiary rounded-md cursor-pointer"
              title="Import prompts"
            >
              <ArrowUpTrayIcon className="w-5 h-5" />
            </label>
            
            <button
              onClick={handleExport}
              className="p-2 text-vertex-text-secondary hover:text-vertex-text-primary hover:bg-vertex-bg-tertiary rounded-md"
              title="Export prompts"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
            
            {/* Create New */}
            <button
              onClick={handleCreatePrompt}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span>New Prompt</span>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-vertex-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full pl-10 pr-4 py-2 border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-vertex-bg-primary text-vertex-text-primary"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'px-4 py-2 border rounded-md transition-colors',
              showFilters
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-vertex-border text-vertex-text-primary hover:bg-vertex-bg-tertiary'
            )}
          >
            <FunnelIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-3">
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-vertex-text-primary">Category:</span>
              <button
                onClick={() => setSelectedCategory('all')}
                className={clsx(
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-vertex-bg-tertiary text-vertex-text-secondary hover:bg-vertex-border'
                )}
              >
                All
              </button>
              {DEFAULT_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={clsx(
                    'px-3 py-1 text-sm rounded-full transition-colors',
                    selectedCategory === cat.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-vertex-bg-tertiary text-vertex-text-secondary hover:bg-vertex-border'
                  )}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
            
            {/* Tags */}
            {allTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-vertex-text-primary">Tags:</span>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                    className={clsx(
                      'px-2 py-0.5 text-xs rounded-full transition-colors',
                      selectedTags.includes(tag)
                        ? 'bg-green-100 text-green-700'
                        : 'bg-vertex-bg-tertiary text-vertex-text-secondary hover:bg-vertex-border'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            
            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-vertex-text-primary">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 text-sm border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 bg-vertex-bg-primary text-vertex-text-primary"
              >
                <option value="name">Name</option>
                <option value="updated">Last Updated</option>
                <option value="usage">Most Used</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 text-vertex-text-secondary hover:text-vertex-text-primary"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-vertex-text-tertiary">Loading prompts...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error loading prompts: {error.message}</div>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <SparklesIcon className="w-12 h-12 text-vertex-text-tertiary mb-4" />
            <p className="text-vertex-text-tertiary text-lg">No prompts found</p>
            <button
              onClick={handleCreatePrompt}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700"
            >
              Create your first prompt
            </button>
          </div>
        ) : (
          <div className={clsx(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-2'
          )}>
            {filteredPrompts.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                viewMode={viewMode}
                onSelect={() => onSelectPrompt && onSelectPrompt(prompt)}
                onEdit={() => handleEditPrompt(prompt)}
                onDelete={() => handleDeletePrompt(prompt.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Editor Modal */}
      {showEditor && (
        <PromptEditor
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onClose={() => {
            setShowEditor(false)
            setEditingPrompt(null)
          }}
        />
      )}
    </div>
  )
}

export default PromptLibrary