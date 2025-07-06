import { useState } from 'react'
import { 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  CogIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import { VARIABLE_CONFIGS, DYNAMIC_FUNCTIONS } from '../types'
import clsx from 'clsx'

function VariablePanel({ variables, onChange, values, onValuesChange, environments, className }) {
  const [editingVar, setEditingVar] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [activeEnvironment, setActiveEnvironment] = useState('default')
  const [testMode, setTestMode] = useState(false)
  
  // New variable form state
  const [newVar, setNewVar] = useState({
    name: '',
    type: 'text',
    label: '',
    description: '',
    defaultValue: '',
    required: false,
    options: [],
    validation: {}
  })
  
  // Get current values based on environment
  const currentValues = environments?.[activeEnvironment] || values || {}
  
  const handleAddVariable = () => {
    if (!newVar.name || !newVar.label) return
    
    const variable = {
      ...newVar,
      name: newVar.name.replace(/[^a-zA-Z0-9_]/g, '_'),
      validation: getDefaultValidation(newVar.type)
    }
    
    if (newVar.type === 'select' && variable.options.length === 0) {
      alert('Please add at least one option for select type')
      return
    }
    
    onChange([...variables, variable])
    setNewVar({
      name: '',
      type: 'text',
      label: '',
      description: '',
      defaultValue: '',
      required: false,
      options: [],
      validation: {}
    })
    setShowAddForm(false)
  }
  
  const handleUpdateVariable = (index, updates) => {
    const updated = [...variables]
    updated[index] = { ...updated[index], ...updates }
    onChange(updated)
    setEditingVar(null)
  }
  
  const handleDeleteVariable = (index) => {
    if (window.confirm('Delete this variable?')) {
      const updated = variables.filter((_, i) => i !== index)
      onChange(updated)
      
      // Also remove from values
      const varName = variables[index].name
      const newValues = { ...currentValues }
      delete newValues[varName]
      onValuesChange(newValues)
    }
  }
  
  const handleValueChange = (varName, value) => {
    const newValues = { ...currentValues, [varName]: value }
    onValuesChange(newValues)
  }
  
  const getDefaultValidation = (type) => {
    switch (type) {
      case 'text':
        return { maxLength: 1000 }
      case 'number':
        return { min: 0, max: 999999 }
      case 'date':
        return { min: '1900-01-01', max: '2100-12-31' }
      default:
        return {}
    }
  }
  
  const validateValue = (variable, value) => {
    if (variable.required && !value) {
      return 'This field is required'
    }
    
    switch (variable.type) {
      case 'text':
        if (variable.validation.maxLength && value.length > variable.validation.maxLength) {
          return `Maximum length is ${variable.validation.maxLength}`
        }
        if (variable.validation.pattern) {
          const regex = new RegExp(variable.validation.pattern)
          if (!regex.test(value)) {
            return 'Invalid format'
          }
        }
        break
        
      case 'number': {
        const num = Number(value)
        if (isNaN(num)) return 'Must be a number'
        if (variable.validation.min !== undefined && num < variable.validation.min) {
          return `Minimum value is ${variable.validation.min}`
        }
        if (variable.validation.max !== undefined && num > variable.validation.max) {
          return `Maximum value is ${variable.validation.max}`
        }
        break
      }
        
      case 'select':
        if (!variable.options.includes(value)) {
          return 'Invalid selection'
        }
        break
    }
    
    return null
  }
  
  const renderVariableInput = (variable, value) => {
    const error = validateValue(variable, value)
    
    switch (variable.type) {
      case 'text':
        return (
          <div>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleValueChange(variable.name, e.target.value)}
              placeholder={variable.defaultValue || `Enter ${variable.label.toLowerCase()}`}
              className={clsx(
                'w-full px-3 py-2 border rounded-md',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        )
        
      case 'number':
        return (
          <div>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => handleValueChange(variable.name, e.target.value)}
              min={variable.validation.min}
              max={variable.validation.max}
              placeholder={variable.defaultValue || '0'}
              className={clsx(
                'w-full px-3 py-2 border rounded-md',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        )
        
      case 'select':
        return (
          <div>
            <select
              value={value || ''}
              onChange={(e) => handleValueChange(variable.name, e.target.value)}
              className={clsx(
                'w-full px-3 py-2 border rounded-md',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            >
              <option value="">Select {variable.label}</option>
              {variable.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          </div>
        )
        
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleValueChange(variable.name, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable</span>
          </label>
        )
        
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleValueChange(variable.name, e.target.value)}
            min={variable.validation.min}
            max={variable.validation.max}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        )
        
      case 'dynamic':
        return (
          <div className="space-y-2">
            <select
              value={variable.dynamicFunction || 'timestamp'}
              onChange={(e) => {
                const func = e.target.value
                const value = DYNAMIC_FUNCTIONS[func]()
                handleValueChange(variable.name, value)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(DYNAMIC_FUNCTIONS).map(func => (
                <option key={func} value={func}>{func}</option>
              ))}
            </select>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono">
              {value || 'Click to generate'}
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  return (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CogIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Variables</h3>
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
              {variables.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTestMode(!testMode)}
              className={clsx(
                'px-3 py-1 text-sm rounded-md transition-colors',
                testMode
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <BeakerIcon className="w-4 h-4 inline mr-1" />
              Test
            </button>
            
            {environments && Object.keys(environments).length > 1 && (
              <select
                value={activeEnvironment}
                onChange={(e) => setActiveEnvironment(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md"
              >
                {Object.keys(environments).map(env => (
                  <option key={env} value={env}>{env}</option>
                ))}
              </select>
            )}
            
            <button
              onClick={() => setShowAddForm(true)}
              className="p-1 text-blue-600 hover:text-blue-700"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Variables List */}
      <div className="p-4 space-y-3">
        {variables.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No variables defined</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add your first variable
            </button>
          </div>
        )}
        
        {variables.map((variable, index) => (
          <div key={variable.name} className="border border-gray-200 rounded-md p-3">
            {editingVar === index ? (
              // Edit Mode
              <div className="space-y-2">
                <input
                  type="text"
                  value={variable.label}
                  onChange={(e) => handleUpdateVariable(index, { label: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                  placeholder="Variable label"
                />
                <textarea
                  value={variable.description || ''}
                  onChange={(e) => handleUpdateVariable(index, { description: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                  rows={2}
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingVar(null)}
                    className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <CheckIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingVar(null)}
                    className="px-2 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{VARIABLE_CONFIGS[variable.type]?.icon || '📝'}</span>
                      <h4 className="font-medium text-gray-900">
                        {variable.label}
                        {variable.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <code className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {`{${variable.name}}`}
                      </code>
                    </div>
                    {variable.description && (
                      <p className="text-sm text-gray-600 mt-1">{variable.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingVar(index)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVariable(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {testMode && (
                  <div className="mt-3">
                    {renderVariableInput(variable, currentValues[variable.name])}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {/* Add Variable Form */}
        {showAddForm && (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variable Name
                </label>
                <input
                  type="text"
                  value={newVar.name}
                  onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                  placeholder="userName"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newVar.type}
                  onChange={(e) => setNewVar({ ...newVar, type: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(VARIABLE_CONFIGS).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.icon} {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={newVar.label}
                onChange={(e) => setNewVar({ ...newVar, label: e.target.value })}
                placeholder="User Name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newVar.description}
                onChange={(e) => setNewVar({ ...newVar, description: e.target.value })}
                placeholder="Enter the user's full name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
              />
            </div>
            
            {newVar.type === 'select' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (one per line)
                </label>
                <textarea
                  value={newVar.options.join('\n')}
                  onChange={(e) => setNewVar({ 
                    ...newVar, 
                    options: e.target.value.split('\n').filter(o => o.trim()) 
                  })}
                  placeholder="Option 1\nOption 2\nOption 3"
                  className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                />
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newVar.required}
                  onChange={(e) => setNewVar({ ...newVar, required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Required</span>
              </label>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleAddVariable}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Variable
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewVar({
                    name: '',
                    type: 'text',
                    label: '',
                    description: '',
                    defaultValue: '',
                    required: false,
                    options: [],
                    validation: {}
                  })
                }}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Help */}
      {testMode && variables.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex gap-2">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Test your variables by entering values above. These values will be used to preview 
                how your prompt will look with actual data.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VariablePanel