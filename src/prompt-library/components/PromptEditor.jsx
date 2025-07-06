import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { DEFAULT_CATEGORIES } from '../types'
import VariablePanel from './VariablePanel'
import { useVariables } from '../hooks/useVariables'
import clsx from 'clsx'

function PromptEditor({ prompt, onSave, onClose }) {
  const isEditing = !!prompt
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: 'custom',
    tags: [],
    variables: [],
    isPublic: false
  })
  
  const [tagInput, setTagInput] = useState('')
  const [activeTab, setActiveTab] = useState('editor')
  
  const { parsedResult, values, updateValues } = useVariables(
    formData.content,
    formData.variables
  )
  
  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name || '',
        description: prompt.description || '',
        content: prompt.content || '',
        category: prompt.category || 'custom',
        tags: prompt.tags || [],
        variables: prompt.variables || [],
        isPublic: prompt.isPublic || false
      })
    }
  }, [prompt])
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.content) {
      alert('Please provide a name and content for the prompt')
      return
    }
    
    const promptData = {
      ...formData,
      metadata: {
        author: 'Current User', // TODO: Get from auth context
        ...(prompt?.metadata || {})
      }
    }
    
    onSave(promptData)
  }
  
  const handleAddTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.toLowerCase()]
      }))
      setTagInput('')
    }
  }
  
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }
  
  const handleVariablesChange = (variables) => {
    setFormData(prev => ({ ...prev, variables }))
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-vertex-bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-vertex-border">
          <h2 className="text-xl font-semibold text-vertex-text-primary">
            {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-vertex-text-tertiary hover:text-vertex-text-secondary rounded"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-vertex-text-primary mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 bg-vertex-bg-primary text-vertex-text-primary"
                    placeholder="My Awesome Prompt"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-vertex-text-primary mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 bg-vertex-bg-primary text-vertex-text-primary"
                  >
                    {DEFAULT_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 resize-none bg-vertex-bg-primary text-vertex-text-primary"
                  rows={2}
                  placeholder="Describe what this prompt does..."
                />
              </div>
              
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-vertex-bg-tertiary text-vertex-text-primary rounded-md hover:bg-vertex-bg-tertiary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-vertex-bg-tertiary text-vertex-text-primary rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-vertex-text-tertiary hover:text-vertex-text-secondary"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Tabs */}
              <div>
                <div className="flex gap-1 mb-4 border-b border-vertex-border">
                  <button
                    type="button"
                    onClick={() => setActiveTab('editor')}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                      activeTab === 'editor'
                        ? 'text-blue-600 border-blue-600'
                        : 'text-vertex-text-tertiary border-transparent hover:text-vertex-text-primary'
                    )}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('variables')}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                      activeTab === 'variables'
                        ? 'text-blue-600 border-blue-600'
                        : 'text-vertex-text-tertiary border-transparent hover:text-vertex-text-primary'
                    )}
                  >
                    Variables ({formData.variables.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className={clsx(
                      'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                      activeTab === 'preview'
                        ? 'text-blue-600 border-blue-600'
                        : 'text-vertex-text-tertiary border-transparent hover:text-vertex-text-primary'
                    )}
                  >
                    Preview
                  </button>
                </div>
                
                {/* Tab Content */}
                {activeTab === 'editor' && (
                  <div>
                    <label className="block text-sm font-medium text-vertex-text-primary mb-1">
                      Prompt Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full px-3 py-2 font-mono text-sm border border-vertex-border rounded-md focus:ring-2 focus:ring-blue-500 resize-none bg-vertex-bg-primary text-vertex-text-primary"
                      rows={12}
                      placeholder="Enter your prompt here. Use {variableName} for variables..."
                      required
                    />
                    <p className="mt-2 text-sm text-vertex-text-tertiary">
                      Use <code className="px-1 bg-vertex-bg-tertiary rounded">{'{variableName}'}</code> to insert variables.
                      Variables found: {parsedResult.missing.length > 0 && (
                        <span className="text-orange-600">
                          {parsedResult.missing.map(v => `{${v}}`).join(', ')}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {activeTab === 'variables' && (
                  <VariablePanel
                    variables={formData.variables}
                    onChange={handleVariablesChange}
                    values={values}
                    onValuesChange={updateValues}
                  />
                )}
                
                {activeTab === 'preview' && (
                  <div>
                    <div className="bg-vertex-bg-primary rounded-md p-4 min-h-[300px]">
                      <pre className="whitespace-pre-wrap text-sm text-vertex-text-primary font-mono">
                        {parsedResult.result || formData.content}
                      </pre>
                    </div>
                    {parsedResult.errors.length > 0 && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">Errors:</p>
                        <ul className="list-disc list-inside text-sm text-red-600">
                          {parsedResult.errors.map((err, i) => (
                            <li key={i}>{err.variable}: {err.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-vertex-border rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-vertex-text-primary">Make this prompt public</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-vertex-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-vertex-text-primary hover:text-vertex-text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEditing ? 'Save Changes' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PromptEditor