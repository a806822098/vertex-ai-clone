import { useState, useCallback, useEffect } from 'react'
import { usePromptContext } from '../context/PromptContext'

/**
 * Hook for managing variables in a prompt
 */
export function useVariables(template, variableDefinitions = []) {
  const { parseTemplate, extractVariables, validateVariables, environments, activeEnvironment } = usePromptContext()
  
  const [values, setValues] = useState({})
  const [parsedResult, setParsedResult] = useState({ result: '', missing: [], errors: [] })
  const [validation, setValidation] = useState([])
  
  // Initialize values from environment
  useEffect(() => {
    const envValues = environments[activeEnvironment] || {}
    setValues(prev => ({ ...envValues, ...prev }))
  }, [environments, activeEnvironment])
  
  // Parse template whenever template or values change
  useEffect(() => {
    const result = parseTemplate(template, values)
    setParsedResult(result)
  }, [template, values, parseTemplate])
  
  // Validate variables whenever values change
  useEffect(() => {
    if (variableDefinitions.length > 0) {
      const results = validateVariables(variableDefinitions, values)
      setValidation(results)
    }
  }, [values, variableDefinitions, validateVariables])
  
  const updateValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])
  
  const updateValues = useCallback((newValues) => {
    setValues(prev => ({ ...prev, ...newValues }))
  }, [])
  
  const resetValues = useCallback(() => {
    const envValues = environments[activeEnvironment] || {}
    setValues(envValues)
  }, [environments, activeEnvironment])
  
  const getExtractedVariables = useCallback(() => {
    return extractVariables(template)
  }, [template, extractVariables])
  
  const isValid = validation.every(v => v.valid)
  
  return {
    values,
    updateValue,
    updateValues,
    resetValues,
    parsedResult,
    validation,
    isValid,
    extractedVariables: getExtractedVariables()
  }
}