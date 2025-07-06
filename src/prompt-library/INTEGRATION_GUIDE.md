# Prompt Library Integration Guide

## Quick Start

### 1. Wrap your app with PromptProvider

```jsx
// App.jsx
import { PromptProvider } from './prompt-library'

function App() {
  return (
    <PromptProvider>
      {/* Your existing app components */}
    </PromptProvider>
  )
}
```

### 2. Add Prompt Library to your UI

```jsx
// In your chat interface or main component
import { PromptLibrary } from './prompt-library'
import { useState } from 'react'

function ChatInterface() {
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  
  const handlePromptSelect = (prompt) => {
    setSelectedPrompt(prompt)
    setShowPromptLibrary(false)
    // Apply prompt to your chat input
  }
  
  return (
    <>
      <button onClick={() => setShowPromptLibrary(true)}>
        Open Prompt Library
      </button>
      
      {showPromptLibrary && (
        <PromptLibrary 
          onSelectPrompt={handlePromptSelect}
          className="fixed inset-0 z-50"
        />
      )}
    </>
  )
}
```

### 3. Use Variables in Prompts

```jsx
import { useVariables } from './prompt-library'

function PromptPreview({ prompt }) {
  const { 
    values, 
    updateValue, 
    parsedResult,
    validation,
    isValid 
  } = useVariables(prompt.content, prompt.variables)
  
  return (
    <div>
      {/* Variable inputs */}
      {prompt.variables.map(variable => (
        <input
          key={variable.name}
          value={values[variable.name] || ''}
          onChange={(e) => updateValue(variable.name, e.target.value)}
          placeholder={variable.label}
        />
      ))}
      
      {/* Parsed result */}
      <div>{parsedResult.result}</div>
      
      {/* Validation errors */}
      {validation.filter(v => !v.valid).map(v => (
        <div key={v.name} className="text-red-500">
          {v.name}: {v.errors.join(', ')}
        </div>
      ))}
    </div>
  )
}
```

## Advanced Features

### Variable Types

```javascript
// Text variable
{
  name: 'userName',
  type: 'text',
  label: 'User Name',
  required: true,
  validation: { maxLength: 50 }
}

// Select variable
{
  name: 'tone',
  type: 'select',
  label: 'Writing Tone',
  options: ['formal', 'casual', 'friendly'],
  defaultValue: 'friendly'
}

// Number variable
{
  name: 'wordCount',
  type: 'number',
  label: 'Word Count',
  validation: { min: 100, max: 1000 }
}

// Dynamic variable
{
  name: 'currentDate',
  type: 'dynamic',
  dynamicFunction: 'date'
}
```

### Template Syntax

```
Basic variable: {userName}
With default: {userName|Anonymous}
With type: {price:currency}
Dynamic function: {timestamp:dynamic}
```

### Environment Variables

```jsx
import { usePromptContext } from './prompt-library'

function EnvironmentManager() {
  const { 
    environments, 
    activeEnvironment, 
    setActiveEnvironment,
    createEnvironment,
    updateEnvironment 
  } = usePromptContext()
  
  // Create environments for different contexts
  await createEnvironment('development', {
    apiUrl: 'https://dev.api.com',
    debugMode: true
  })
  
  await createEnvironment('production', {
    apiUrl: 'https://api.com',
    debugMode: false
  })
}
```

### Prompt Chains

```jsx
import { PromptChainEditor } from './prompt-library'

function ChainBuilder() {
  const [chain, setChain] = useState(null)
  
  const handleRunChain = async (chain) => {
    // Execute chain logic
    for (const node of chain.nodes) {
      switch (node.type) {
        case 'prompt':
          // Run prompt
          break
        case 'condition':
          // Evaluate condition
          break
        case 'loop':
          // Execute loop
          break
      }
    }
  }
  
  return (
    <PromptChainEditor
      chain={chain}
      onChange={setChain}
      onRun={handleRunChain}
    />
  )
}
```

### Import/Export

```jsx
import { usePromptContext } from './prompt-library'

function ImportExport() {
  const { exportData, importData } = usePromptContext()
  
  const handleExport = async () => {
    const data = await exportData({ includeHistory: true })
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    // Download blob
  }
  
  const handleImport = async (file) => {
    const text = await file.text()
    const data = JSON.parse(text)
    const results = await importData(data)
    console.log(`Imported: ${results.prompts} prompts`)
  }
}
```

## Storage & Performance

The Prompt Library uses:
- **IndexedDB** for large-scale storage (thousands of prompts)
- **Optimized search** with indexed fields
- **Lazy loading** for better performance
- **Virtual scrolling** for large lists

## Security

- Prompts are stored locally in the browser
- Supports encryption via the existing crypto utilities
- Variables are validated before substitution
- XSS protection for dynamic content

## Customization

### Custom Categories

```javascript
const CUSTOM_CATEGORIES = [
  { id: 'legal', name: 'Legal', icon: '⚖️' },
  { id: 'medical', name: 'Medical', icon: '🏥' },
  { id: 'finance', name: 'Finance', icon: '💰' }
]
```

### Custom Variable Types

```javascript
// Add to VARIABLE_CONFIGS
customDate: {
  icon: '📅',
  validator: (value) => {
    // Custom validation logic
    return isValidCustomDate(value)
  }
}
```

### Styling

All components use Tailwind CSS and accept className props for customization:

```jsx
<PromptLibrary 
  className="custom-wrapper"
  cardClassName="custom-card"
  headerClassName="custom-header"
/>
```