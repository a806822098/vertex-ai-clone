/**
 * Variable Parser Service
 * Handles variable substitution, validation, and dynamic functions
 */

import { DYNAMIC_FUNCTIONS } from '../types'

class VariableParser {
  /**
   * Parse and extract variables from a template string
   * @param {string} template - The template string
   * @returns {Array} Array of variable names found
   */
  extractVariables(template) {
    if (!template) return []
    
    // Match {variableName} or {variableName:type} or {variableName|default}
    const regex = /\{([^{}]+)\}/g
    const variables = new Set()
    let match
    
    while ((match = regex.exec(template)) !== null) {
      const varDefinition = match[1]
      const [varName] = varDefinition.split(/[:|]/)
      variables.add(varName.trim())
    }
    
    return Array.from(variables)
  }
  
  /**
   * Replace variables in template with actual values
   * @param {string} template - The template string
   * @param {Object} values - Key-value pairs of variable values
   * @param {Object} options - Parser options
   * @returns {Object} { result: string, missing: Array, errors: Array }
   */
  parseTemplate(template, values = {}, options = {}) {
    const {
      throwOnMissing = false,
      highlightMissing = true,
      defaultValue = '',
      processMarkdown = false
    } = options
    
    const missing = []
    const errors = []
    
    if (!template) return { result: '', missing: [], errors: [] }
    
    let result = template
    
    // Replace variables
    result = result.replace(/\{([^{}]+)\}/g, (match, varDefinition) => {
      try {
        const parts = varDefinition.split('|')
        const [varSpec, defaultVal] = parts
        const [varName, varType] = varSpec.split(':').map(s => s.trim())
        
        // Check if it's a dynamic function
        if (varType === 'dynamic' || DYNAMIC_FUNCTIONS[varName]) {
          return this.executeDynamicFunction(varName, values[varName])
        }
        
        // Get value
        let value = values[varName]
        
        if (value === undefined || value === null || value === '') {
          if (defaultVal !== undefined) {
            value = defaultVal
          } else if (defaultValue !== undefined) {
            value = defaultValue
          } else {
            missing.push(varName)
            if (throwOnMissing) {
              throw new Error(`Missing required variable: ${varName}`)
            }
            return highlightMissing ? `{{${varName}}}` : match
          }
        }
        
        // Type conversion and formatting
        if (varType) {
          value = this.formatValue(value, varType)
        }
        
        return String(value)
      } catch (err) {
        errors.push({ variable: varDefinition, error: err.message })
        return match
      }
    })
    
    // Process markdown if requested
    if (processMarkdown) {
      result = this.processMarkdownVariables(result, values)
    }
    
    return { result, missing, errors }
  }
  
  /**
   * Format value based on type
   */
  formatValue(value, type) {
    switch (type) {
      case 'upper':
        return String(value).toUpperCase()
      case 'lower':
        return String(value).toLowerCase()
      case 'capitalize':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1)
      case 'number':
        return Number(value)
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(value))
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'time':
        return new Date(value).toLocaleTimeString()
      case 'json':
        return JSON.stringify(value)
      default:
        return value
    }
  }
  
  /**
   * Execute dynamic functions
   */
  executeDynamicFunction(functionName, args) {
    if (!DYNAMIC_FUNCTIONS[functionName]) {
      throw new Error(`Unknown dynamic function: ${functionName}`)
    }
    
    try {
      if (typeof args === 'string') {
        args = args.split(',').map(arg => arg.trim())
      }
      
      return DYNAMIC_FUNCTIONS[functionName](...(args || []))
    } catch (err) {
      throw new Error(`Error executing ${functionName}: ${err.message}`)
    }
  }
  
  /**
   * Process markdown-style variables (e.g., [[variable]])
   */
  processMarkdownVariables(template, values) {
    return template.replace(/\[\[([^\]]+)\]\]/g, (match, varName) => {
      const value = values[varName.trim()]
      return value !== undefined ? String(value) : match
    })
  }
  
  /**
   * Validate variables against their definitions
   */
  validateVariables(variables, values) {
    const validationResults = []
    
    for (const variable of variables) {
      const value = values[variable.name]
      const result = {
        name: variable.name,
        valid: true,
        errors: []
      }
      
      // Check required
      if (variable.required && (value === undefined || value === null || value === '')) {
        result.valid = false
        result.errors.push('This field is required')
      }
      
      // Type-specific validation
      if (value !== undefined && value !== null && value !== '') {
        switch (variable.type) {
          case 'text':
            if (variable.validation?.maxLength && value.length > variable.validation.maxLength) {
              result.valid = false
              result.errors.push(`Maximum length is ${variable.validation.maxLength}`)
            }
            if (variable.validation?.pattern) {
              const regex = new RegExp(variable.validation.pattern)
              if (!regex.test(value)) {
                result.valid = false
                result.errors.push('Invalid format')
              }
            }
            break
            
          case 'number': {
            const num = Number(value)
            if (isNaN(num)) {
              result.valid = false
              result.errors.push('Must be a valid number')
            } else {
              if (variable.validation?.min !== undefined && num < variable.validation.min) {
                result.valid = false
                result.errors.push(`Minimum value is ${variable.validation.min}`)
              }
              if (variable.validation?.max !== undefined && num > variable.validation.max) {
                result.valid = false
                result.errors.push(`Maximum value is ${variable.validation.max}`)
              }
            }
            break
          }
            
          case 'select':
            if (variable.options && !variable.options.includes(value)) {
              result.valid = false
              result.errors.push('Invalid selection')
            }
            break
            
          case 'date': {
            const date = new Date(value)
            if (isNaN(date.getTime())) {
              result.valid = false
              result.errors.push('Invalid date')
            }
            break
          }
        }
      }
      
      validationResults.push(result)
    }
    
    return validationResults
  }
  
  /**
   * Generate sample values for variables
   */
  generateSampleValues(variables) {
    const samples = {}
    
    for (const variable of variables) {
      switch (variable.type) {
        case 'text':
          samples[variable.name] = variable.defaultValue || `Sample ${variable.label}`
          break
        case 'number':
          samples[variable.name] = variable.defaultValue || 
            (variable.validation?.min || 0)
          break
        case 'boolean':
          samples[variable.name] = variable.defaultValue || false
          break
        case 'select':
          samples[variable.name] = variable.defaultValue || 
            (variable.options?.[0] || '')
          break
        case 'date':
          samples[variable.name] = variable.defaultValue || 
            new Date().toISOString().split('T')[0]
          break
        case 'dynamic':
          samples[variable.name] = DYNAMIC_FUNCTIONS.timestamp()
          break
        default:
          samples[variable.name] = variable.defaultValue || ''
      }
    }
    
    return samples
  }
  
  /**
   * Build a variable map from template and definitions
   */
  buildVariableMap(template, definitions = []) {
    const extractedVars = this.extractVariables(template)
    const definedVarNames = definitions.map(d => d.name)
    
    const variableMap = {}
    
    // Add defined variables
    definitions.forEach(def => {
      variableMap[def.name] = {
        ...def,
        isUsed: extractedVars.includes(def.name)
      }
    })
    
    // Add undefined variables found in template
    extractedVars.forEach(varName => {
      if (!definedVarNames.includes(varName)) {
        variableMap[varName] = {
          name: varName,
          type: 'text',
          label: varName,
          isUsed: true,
          isDynamic: !!DYNAMIC_FUNCTIONS[varName]
        }
      }
    })
    
    return variableMap
  }
}

// Singleton instance
const variableParser = new VariableParser()

export default variableParser