import { usePromptContext } from '../context/PromptContext'

/**
 * Hook for managing prompts
 */
export function usePrompts() {
  const {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    searchPrompts
  } = usePromptContext()
  
  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    searchPrompts
  }
}