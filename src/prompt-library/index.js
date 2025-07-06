/**
 * Prompt Library Module Exports
 * 
 * Usage in your app:
 * 
 * import { PromptLibrary, PromptProvider } from './prompt-library'
 * 
 * function App() {
 *   return (
 *     <PromptProvider>
 *       <PromptLibrary onSelectPrompt={handlePromptSelect} />
 *     </PromptProvider>
 *   )
 * }
 */

// Components
export { default as PromptLibrary } from './components/PromptLibrary'
export { default as PromptEditor } from './components/PromptEditor'
export { default as PromptCard } from './components/PromptCard'
export { default as VariablePanel } from './components/VariablePanel'
export { default as PromptChainEditor } from './components/PromptChainEditor'

// Context & Hooks
export { PromptProvider, usePromptContext } from './context/PromptContext'
export { usePrompts } from './hooks/usePrompts'
export { useVariables } from './hooks/useVariables'
export { useDebounce } from './hooks/useDebounce'

// Services
export { default as storageService } from './services/storageService'
export { default as variableParser } from './services/variableParser'

// Types & Constants
export * from './types'