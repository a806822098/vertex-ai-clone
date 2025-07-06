/**
 * Storage Service for Prompt Library
 * Handles IndexedDB for large data and integrates with encrypted localStorage
 */

const DB_NAME = 'PromptLibraryDB'
const DB_VERSION = 1
const STORES = {
  prompts: 'prompts',
  chains: 'chains',
  environments: 'environments',
  history: 'history'
}

class StorageService {
  constructor() {
    this.db = null
    this.isInitialized = false
  }
  
  /**
   * Initialize IndexedDB
   */
  async init() {
    if (this.isInitialized) return
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error)
        reject(request.error)
      }
      
      request.onsuccess = () => {
        this.db = request.result
        this.isInitialized = true
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Create prompts store
        if (!db.objectStoreNames.contains(STORES.prompts)) {
          const promptStore = db.createObjectStore(STORES.prompts, { keyPath: 'id' })
          promptStore.createIndex('category', 'category', { unique: false })
          promptStore.createIndex('author', 'metadata.author', { unique: false })
          promptStore.createIndex('updated', 'metadata.updated', { unique: false })
          promptStore.createIndex('tags', 'tags', { unique: false, multiEntry: true })
        }
        
        // Create chains store
        if (!db.objectStoreNames.contains(STORES.chains)) {
          const chainStore = db.createObjectStore(STORES.chains, { keyPath: 'id' })
          chainStore.createIndex('name', 'name', { unique: false })
          chainStore.createIndex('updated', 'updated', { unique: false })
        }
        
        // Create environments store
        if (!db.objectStoreNames.contains(STORES.environments)) {
          db.createObjectStore(STORES.environments, { keyPath: 'id' })
        }
        
        // Create history store for version control
        if (!db.objectStoreNames.contains(STORES.history)) {
          const historyStore = db.createObjectStore(STORES.history, { keyPath: 'id' })
          historyStore.createIndex('promptId', 'promptId', { unique: false })
          historyStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }
  
  /**
   * Generic CRUD operations
   */
  async create(storeName, data) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      // Add timestamps
      const record = {
        ...data,
        id: data.id || crypto.randomUUID(),
        created: data.created || new Date().toISOString(),
        updated: new Date().toISOString()
      }
      
      const request = store.add(record)
      
      request.onsuccess = () => resolve(record)
      request.onerror = () => reject(request.error)
    })
  }
  
  async update(storeName, id, updates) {
    await this.ensureInitialized()
    
    const existing = await this.getById(storeName, id)
    if (!existing) throw new Error('Record not found')
    
    const updated = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updated: new Date().toISOString()
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(updated)
      
      request.onsuccess = () => resolve(updated)
      request.onerror = () => reject(request.error)
    })
  }
  
  async delete(storeName, id) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async getById(storeName, id) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  
  async getAll(storeName, filters = {}) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = () => {
        let results = request.result
        
        // Apply filters
        if (filters.category) {
          results = results.filter(r => r.category === filters.category)
        }
        if (filters.author) {
          results = results.filter(r => r.metadata?.author === filters.author)
        }
        if (filters.tags && filters.tags.length > 0) {
          results = results.filter(r => 
            filters.tags.every(tag => r.tags?.includes(tag))
          )
        }
        
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }
  
  /**
   * Prompt-specific operations
   */
  async createPrompt(promptData) {
    const prompt = {
      ...promptData,
      metadata: {
        ...promptData.metadata,
        usageCount: 0,
        rating: 0,
        version: 1,
        history: []
      }
    }
    
    const created = await this.create(STORES.prompts, prompt)
    
    // Save to history
    await this.savePromptHistory(created.id, created)
    
    return created
  }
  
  async updatePrompt(id, updates) {
    const existing = await this.getById(STORES.prompts, id)
    if (!existing) throw new Error('Prompt not found')
    
    // Increment version
    const newVersion = (existing.metadata?.version || 1) + 1
    
    const updated = await this.update(STORES.prompts, id, {
      ...updates,
      metadata: {
        ...existing.metadata,
        ...updates.metadata,
        version: newVersion
      }
    })
    
    // Save to history
    await this.savePromptHistory(id, updated)
    
    return updated
  }
  
  async savePromptHistory(promptId, promptData) {
    const historyEntry = {
      id: crypto.randomUUID(),
      promptId,
      timestamp: new Date().toISOString(),
      version: promptData.metadata.version,
      content: promptData.content,
      variables: promptData.variables
    }
    
    await this.create(STORES.history, historyEntry)
  }
  
  async getPromptHistory(promptId) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.history], 'readonly')
      const store = transaction.objectStore(STORES.history)
      const index = store.index('promptId')
      const request = index.getAll(promptId)
      
      request.onsuccess = () => {
        const results = request.result
        results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        resolve(results)
      }
      request.onerror = () => reject(request.error)
    })
  }
  
  /**
   * Search functionality
   */
  async searchPrompts(query) {
    const allPrompts = await this.getAll(STORES.prompts)
    
    if (!query) return allPrompts
    
    const searchTerms = query.toLowerCase().split(' ')
    
    return allPrompts.filter(prompt => {
      const searchableText = [
        prompt.name,
        prompt.description,
        prompt.content,
        ...(prompt.tags || [])
      ].join(' ').toLowerCase()
      
      return searchTerms.every(term => searchableText.includes(term))
    })
  }
  
  /**
   * Import/Export functionality
   */
  async exportData(includeHistory = false) {
    const prompts = await this.getAll(STORES.prompts)
    const chains = await this.getAll(STORES.chains)
    const environments = await this.getAll(STORES.environments)
    
    const exportData = {
      version: '1.0',
      exported: new Date().toISOString(),
      prompts,
      chains,
      environments
    }
    
    if (includeHistory) {
      exportData.history = await this.getAll(STORES.history)
    }
    
    return exportData
  }
  
  async importData(data) {
    if (!data.version || !data.prompts) {
      throw new Error('Invalid import data format')
    }
    
    const results = {
      prompts: 0,
      chains: 0,
      environments: 0
    }
    
    // Import prompts
    if (data.prompts && Array.isArray(data.prompts)) {
      for (const prompt of data.prompts) {
        try {
          await this.create(STORES.prompts, prompt)
          results.prompts++
        } catch (err) {
          console.error('Failed to import prompt:', err)
        }
      }
    }
    
    // Import chains
    if (data.chains && Array.isArray(data.chains)) {
      for (const chain of data.chains) {
        try {
          await this.create(STORES.chains, chain)
          results.chains++
        } catch (err) {
          console.error('Failed to import chain:', err)
        }
      }
    }
    
    // Import environments
    if (data.environments && Array.isArray(data.environments)) {
      for (const env of data.environments) {
        try {
          await this.create(STORES.environments, env)
          results.environments++
        } catch (err) {
          console.error('Failed to import environment:', err)
        }
      }
    }
    
    return results
  }
  
  /**
   * Utility methods
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init()
    }
  }
  
  async clear(storeName) {
    await this.ensureInitialized()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
  
  async getStats() {
    const prompts = await this.getAll(STORES.prompts)
    const chains = await this.getAll(STORES.chains)
    
    const categories = {}
    const tags = {}
    
    prompts.forEach(prompt => {
      // Count by category
      if (prompt.category) {
        categories[prompt.category] = (categories[prompt.category] || 0) + 1
      }
      
      // Count by tags
      if (prompt.tags) {
        prompt.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1
        })
      }
    })
    
    return {
      totalPrompts: prompts.length,
      totalChains: chains.length,
      categories,
      tags,
      mostUsed: prompts
        .sort((a, b) => (b.metadata?.usageCount || 0) - (a.metadata?.usageCount || 0))
        .slice(0, 10),
      recentlyUpdated: prompts
        .sort((a, b) => new Date(b.updated) - new Date(a.updated))
        .slice(0, 10)
    }
  }
}

// Singleton instance
const storageService = new StorageService()

export default storageService