import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import storageService from '../services/storageService'
import variableParser from '../services/variableParser'

const PromptContext = createContext()

export function PromptProvider({ children }) {
  const [prompts, setPrompts] = useState([])
  const [chains, setChains] = useState([])
  const [environments, setEnvironments] = useState({ default: {} })
  const [activeEnvironment, setActiveEnvironment] = useState('default')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Initialize storage and load data
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setLoading(true)
      await storageService.init()
      
      const [promptsData, chainsData, environmentsData] = await Promise.all([
        storageService.getAll('prompts'),
        storageService.getAll('chains'),
        storageService.getAll('environments')
      ])
      
      setPrompts(promptsData)
      setChains(chainsData)
      
      if (environmentsData.length > 0) {
        const envMap = {}
        environmentsData.forEach(env => {
          envMap[env.name] = env.variables
        })
        setEnvironments(envMap)
      }
      
      setError(null)
    } catch (err) {
      console.error('Failed to load prompt library data:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }
  
  // Prompt operations
  const createPrompt = useCallback(async (promptData) => {
    try {
      const newPrompt = await storageService.createPrompt(promptData)
      setPrompts(prev => [...prev, newPrompt])
      return newPrompt
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const updatePrompt = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.updatePrompt(id, updates)
      setPrompts(prev => prev.map(p => p.id === id ? updated : p))
      return updated
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const deletePrompt = useCallback(async (id) => {
    try {
      await storageService.delete('prompts', id)
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const duplicatePrompt = useCallback(async (id) => {
    try {
      const original = prompts.find(p => p.id === id)
      if (!original) throw new Error('Prompt not found')
      
      const duplicate = {
        ...original,
        id: crypto.randomUUID(),
        name: `${original.name} (Copy)`,
        metadata: {
          ...original.metadata,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          version: 1,
          history: []
        }
      }
      
      return await createPrompt(duplicate)
    } catch (err) {
      setError(err)
      throw err
    }
  }, [prompts, createPrompt])
  
  // Chain operations
  const createChain = useCallback(async (chainData) => {
    try {
      const newChain = await storageService.create('chains', chainData)
      setChains(prev => [...prev, newChain])
      return newChain
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const updateChain = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.update('chains', id, updates)
      setChains(prev => prev.map(c => c.id === id ? updated : c))
      return updated
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const deleteChain = useCallback(async (id) => {
    try {
      await storageService.delete('chains', id)
      setChains(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  // Environment operations
  const createEnvironment = useCallback(async (name, variables = {}) => {
    try {
      const env = { id: crypto.randomUUID(), name, variables }
      await storageService.create('environments', env)
      setEnvironments(prev => ({ ...prev, [name]: variables }))
      return env
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const updateEnvironment = useCallback(async (name, variables) => {
    try {
      setEnvironments(prev => ({ ...prev, [name]: variables }))
      // Update in storage
      const existing = await storageService.getAll('environments')
      const env = existing.find(e => e.name === name)
      if (env) {
        await storageService.update('environments', env.id, { variables })
      }
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const deleteEnvironment = useCallback(async (name) => {
    try {
      const existing = await storageService.getAll('environments')
      const env = existing.find(e => e.name === name)
      if (env) {
        await storageService.delete('environments', env.id)
      }
      setEnvironments(prev => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  // Variable operations
  const parseTemplate = useCallback((template, values = {}, options = {}) => {
    const envValues = environments[activeEnvironment] || {}
    const mergedValues = { ...envValues, ...values }
    return variableParser.parseTemplate(template, mergedValues, options)
  }, [environments, activeEnvironment])
  
  const extractVariables = useCallback((template) => {
    return variableParser.extractVariables(template)
  }, [])
  
  const validateVariables = useCallback((variables, values) => {
    return variableParser.validateVariables(variables, values)
  }, [])
  
  // Search and filter
  const searchPrompts = useCallback(async (query) => {
    try {
      return await storageService.searchPrompts(query)
    } catch (err) {
      setError(err)
      return []
    }
  }, [])
  
  // Import/Export
  const exportData = useCallback(async (options = {}) => {
    try {
      return await storageService.exportData(options.includeHistory)
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  const importData = useCallback(async (data) => {
    try {
      const results = await storageService.importData(data)
      await loadData() // Reload all data
      return results
    } catch (err) {
      setError(err)
      throw err
    }
  }, [])
  
  // Stats
  const getStats = useCallback(async () => {
    try {
      return await storageService.getStats()
    } catch (err) {
      setError(err)
      return null
    }
  }, [])
  
  const value = {
    // State
    prompts,
    chains,
    environments,
    activeEnvironment,
    loading,
    error,
    
    // Actions
    setActiveEnvironment,
    
    // Prompt operations
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    
    // Chain operations
    createChain,
    updateChain,
    deleteChain,
    
    // Environment operations
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    
    // Variable operations
    parseTemplate,
    extractVariables,
    validateVariables,
    
    // Utility
    searchPrompts,
    exportData,
    importData,
    getStats,
    refresh: loadData
  }
  
  return (
    <PromptContext.Provider value={value}>
      {children}
    </PromptContext.Provider>
  )
}

export function usePromptContext() {
  const context = useContext(PromptContext)
  if (!context) {
    throw new Error('usePromptContext must be used within a PromptProvider')
  }
  return context
}