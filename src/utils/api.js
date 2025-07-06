/**
 * Universal AI API Client
 * Supports OpenAI, Anthropic, Google, and custom API endpoints
 * with comprehensive parameter mapping and validation
 */

// API format constants
export const API_FORMATS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GOOGLE: 'google',
  CUSTOM: 'custom'
}

// Import China-friendly presets
import { CHINA_API_PRESETS } from './apiPresets.js'

// Re-export for backward compatibility
export const API_PRESETS = CHINA_API_PRESETS

// Parameter validation ranges
const PARAMETER_RANGES = {
  temperature: { min: 0, max: 2, default: 0.7 },
  maxTokens: { min: 1, max: 128000, default: 1024 },
  topP: { min: 0, max: 1, default: 1 },
  topK: { min: 1, max: 100, default: 40 },
  frequencyPenalty: { min: -2, max: 2, default: 0 },
  presencePenalty: { min: -2, max: 2, default: 0 }
}

/**
 * Validate URL format
 * @param {string} url - The URL to validate
 * @returns {{valid: boolean, error?: string}}
 */
export function validateURL(url) {
  if (!url) return { valid: false, error: 'URL is required' }
  
  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL must start with http:// or https://' }
    }
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Detect API format based on endpoint URL
 * @param {string} endpoint - The API endpoint URL
 * @returns {string} The detected API format
 */
export function detectAPIFormat(endpoint) {
  if (!endpoint) return API_FORMATS.CUSTOM
  
  if (endpoint.includes('anthropic.com')) return API_FORMATS.ANTHROPIC
  if (endpoint.includes('googleapis.com')) return API_FORMATS.GOOGLE
  if (endpoint.includes('/chat/completions')) return API_FORMATS.OPENAI
  if (endpoint.includes('/messages')) return API_FORMATS.ANTHROPIC
  
  return API_FORMATS.CUSTOM
}

/**
 * Validate and normalize parameters
 * @param {Object} params - Raw parameters
 * @returns {Object} Validated parameters
 */
function validateParameters(params) {
  const validated = {}
  
  // Validate temperature
  if (params.temperature !== undefined) {
    const temp = Number(params.temperature)
    if (!isNaN(temp)) {
      validated.temperature = Math.max(
        PARAMETER_RANGES.temperature.min,
        Math.min(PARAMETER_RANGES.temperature.max, temp)
      )
    }
  }
  
  // Validate maxTokens
  if (params.maxTokens !== undefined) {
    const tokens = Number(params.maxTokens)
    if (!isNaN(tokens) && tokens > 0) {
      validated.maxTokens = Math.round(tokens)
    }
  }
  
  // Validate topP
  if (params.topP !== undefined) {
    const topP = Number(params.topP)
    if (!isNaN(topP)) {
      validated.topP = Math.max(
        PARAMETER_RANGES.topP.min,
        Math.min(PARAMETER_RANGES.topP.max, topP)
      )
    }
  }
  
  // Validate topK (Google only)
  if (params.topK !== undefined) {
    const topK = Number(params.topK)
    if (!isNaN(topK) && topK > 0) {
      validated.topK = Math.round(Math.max(
        PARAMETER_RANGES.topK.min,
        Math.min(PARAMETER_RANGES.topK.max, topK)
      ))
    }
  }
  
  // Validate penalties (OpenAI only)
  if (params.frequencyPenalty !== undefined) {
    const penalty = Number(params.frequencyPenalty)
    if (!isNaN(penalty)) {
      validated.frequencyPenalty = Math.max(
        PARAMETER_RANGES.frequencyPenalty.min,
        Math.min(PARAMETER_RANGES.frequencyPenalty.max, penalty)
      )
    }
  }
  
  if (params.presencePenalty !== undefined) {
    const penalty = Number(params.presencePenalty)
    if (!isNaN(penalty)) {
      validated.presencePenalty = Math.max(
        PARAMETER_RANGES.presencePenalty.min,
        Math.min(PARAMETER_RANGES.presencePenalty.max, penalty)
      )
    }
  }
  
  // Validate seed (must be positive integer)
  if (params.seed !== undefined && params.seed !== null) {
    const seed = Number(params.seed)
    if (!isNaN(seed) && seed >= 0) {
      validated.seed = Math.round(seed)
    }
  }
  
  // String parameters
  if (params.systemPrompt) {
    validated.systemPrompt = String(params.systemPrompt)
  }
  
  if (params.model) {
    validated.model = String(params.model)
  }
  
  return validated
}

/**
 * Get default model for a given API format
 * @param {string} format - The API format
 * @param {string} endpoint - The API endpoint
 * @returns {string} The default model name
 */
function getDefaultModel(format, endpoint) {
  // Check if endpoint matches any preset
  for (const preset of Object.values(API_PRESETS)) {
    if (preset.endpoint === endpoint && preset.defaultModel) {
      return preset.defaultModel
    }
  }
  
  // Fallback defaults by format
  switch (format) {
    case API_FORMATS.OPENAI:
      return 'gpt-3.5-turbo'
    case API_FORMATS.ANTHROPIC:
      return 'claude-3-sonnet-20240229'
    case API_FORMATS.GOOGLE:
      return 'gemini-pro'
    default:
      return ''
  }
}

/**
 * Build API request with proper parameter mapping
 * @param {string} endpoint - The API endpoint
 * @param {string} apiKey - The API key
 * @param {Array} messages - The message history
 * @param {string} format - The API format
 * @param {Object} options - Configuration options
 * @returns {{endpoint: string, headers: Object, body: Object}}
 */
export function buildAPIRequest(endpoint, apiKey, messages, format, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    // Add custom headers if provided
    ...(options.customHeaders || {})
  }
  
  // Validate and normalize parameters
  const params = validateParameters(options)
  
  // Get default model if not specified
  if (!params.model) {
    params.model = getDefaultModel(format, endpoint)
  }
  
  let body = {}
  let processedMessages = [...messages]
  
  switch (format) {
    case API_FORMATS.OPENAI:
      // OpenAI format: system messages in the messages array
      headers['Authorization'] = `Bearer ${apiKey}`
      
      // Add system message if provided
      if (params.systemPrompt) {
        processedMessages = [
          { role: 'system', content: params.systemPrompt },
          ...messages
        ]
      }
      
      body = {
        model: params.model,
        messages: processedMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        stream: false,
        // Apply parameters with defaults
        temperature: params.temperature ?? PARAMETER_RANGES.temperature.default,
        max_tokens: params.maxTokens ?? PARAMETER_RANGES.maxTokens.default,
        top_p: params.topP ?? PARAMETER_RANGES.topP.default,
        frequency_penalty: params.frequencyPenalty ?? PARAMETER_RANGES.frequencyPenalty.default,
        presence_penalty: params.presencePenalty ?? PARAMETER_RANGES.presencePenalty.default,
        // Only include seed if specified
        ...(params.seed !== undefined && { seed: params.seed })
      }
      break

    case API_FORMATS.ANTHROPIC: {
      // Anthropic format: system prompt as separate field
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
      
      // Filter out any system messages from the array
      const anthropicMessages = messages.filter(m => m.role !== 'system')
      
      body = {
        model: params.model,
        messages: anthropicMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        })),
        max_tokens: params.maxTokens ?? PARAMETER_RANGES.maxTokens.default,
        temperature: params.temperature ?? PARAMETER_RANGES.temperature.default,
        top_p: params.topP ?? PARAMETER_RANGES.topP.default,
        // Add system prompt if provided
        ...(params.systemPrompt && { system: params.systemPrompt })
      }
      
      // Note: Anthropic doesn't support seed, frequency_penalty, or presence_penalty
      break
    }

    case API_FORMATS.GOOGLE: {
      // Google format: uses generationConfig and systemInstruction
      endpoint = `${endpoint}?key=${apiKey}`
      
      // Filter out system messages
      const googleMessages = messages.filter(m => m.role !== 'system')
      
      body = {
        contents: googleMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        generationConfig: {
          temperature: params.temperature ?? PARAMETER_RANGES.temperature.default,
          maxOutputTokens: params.maxTokens ?? PARAMETER_RANGES.maxTokens.default,
          topP: params.topP ?? PARAMETER_RANGES.topP.default,
          topK: params.topK ?? PARAMETER_RANGES.topK.default,
          // Google supports candidateCount but we'll keep it at 1
          candidateCount: 1
        }
      }
      
      // Add system instruction if provided
      if (params.systemPrompt) {
        body.systemInstruction = {
          parts: [{ text: params.systemPrompt }]
        }
      }
      
      // Note: Google doesn't support seed, frequency_penalty, or presence_penalty
      break
    }

    default: {
      // Custom format: attempt OpenAI-compatible format
      headers['Authorization'] = `Bearer ${apiKey}`
      
      // Add system message if provided
      if (params.systemPrompt) {
        processedMessages = [
          { role: 'system', content: params.systemPrompt },
          ...messages
        ]
      }
      
      body = {
        messages: processedMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        // Include any parameters that were specified
        ...(params.model && { model: params.model }),
        ...(params.temperature !== undefined && { temperature: params.temperature }),
        ...(params.maxTokens !== undefined && { max_tokens: params.maxTokens }),
        ...(params.topP !== undefined && { top_p: params.topP }),
        ...(params.topK !== undefined && { top_k: params.topK }),
        ...(params.frequencyPenalty !== undefined && { frequency_penalty: params.frequencyPenalty }),
        ...(params.presencePenalty !== undefined && { presence_penalty: params.presencePenalty }),
        ...(params.seed !== undefined && { seed: params.seed })
      }
      break
    }
  }

  return { endpoint, headers, body }
}

/**
 * Parse API response based on format
 * @param {Object} data - The API response data
 * @param {string} format - The API format
 * @returns {string} The extracted message content
 */
export function parseAPIResponse(data, format) {
  try {
    switch (format) {
      case API_FORMATS.OPENAI:
        return data.choices?.[0]?.message?.content || 'No response'
      
      case API_FORMATS.ANTHROPIC:
        return data.content?.[0]?.text || 'No response'
      
      case API_FORMATS.GOOGLE:
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
      
      default: {
        // Try common response patterns
        const content = data.content || 
                       data.message || 
                       data.text || 
                       data.choices?.[0]?.message?.content || 
                       data.result
        
        if (content) {
          return String(content) // 确保返回字符串
        }
        
        // 防御性处理：安全地提取文本内容
        if (typeof data === 'string') {
          return data
        }
        
        // 尝试从对象中找到可能的文本内容
        const possibleTextFields = ['answer', 'response', 'reply', 'output', 'completion']
        for (const field of possibleTextFields) {
          if (data[field] && typeof data[field] === 'string') {
            return data[field]
          }
        }
        
        // 如果是数组，尝试提取第一个元素
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
          return data[0]
        }
        
        // 最后的防御：返回友好的错误消息而不是JSON
        console.warn('Unexpected API response format:', data)
        return '抱歉，无法解析API响应。请检查API配置是否正确。'
      }
    }
  } catch (error) {
    console.error('Error parsing response:', error)
    return 'Error parsing response'
  }
}

/**
 * Main API call function with comprehensive options support
 * @param {string} endpoint - The API endpoint URL
 * @param {string} apiKey - The API key
 * @param {Array} messages - The message history
 * @param {Object} options - Configuration options
 * @param {string} options.model - Model to use
 * @param {number} options.temperature - Temperature (0-2)
 * @param {number} options.maxTokens - Maximum tokens to generate
 * @param {number} options.topP - Top-P sampling
 * @param {number} options.topK - Top-K sampling (Google only)
 * @param {number} options.seed - Random seed for reproducibility
 * @param {string} options.systemPrompt - System instructions
 * @param {number} options.frequencyPenalty - Frequency penalty (OpenAI only)
 * @param {number} options.presencePenalty - Presence penalty (OpenAI only)
 * @returns {Promise<string>} The API response content
 */
/**
 * Get preset endpoints for quick configuration
 * @returns {Array} Array of preset endpoint configurations
 */
export function getPresetEndpoints() {
  return Object.entries(API_PRESETS).map(([, preset]) => ({
    name: preset.name,
    url: preset.endpoint,
    headers: preset.headers || {},
    defaultModel: preset.defaultModel
  }))
}

export async function callAPI(endpoint, apiKey, messages, options = {}) {
  // Validate inputs
  const urlValidation = validateURL(endpoint)
  if (!urlValidation.valid) {
    throw new Error(`Invalid API endpoint: ${urlValidation.error}`)
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required')
  }

  if (!messages || messages.length === 0) {
    throw new Error('No messages to send')
  }

  // Detect API format
  const format = detectAPIFormat(endpoint)
  
  // Build request with proper parameter mapping
  const { endpoint: finalEndpoint, headers, body } = buildAPIRequest(
    endpoint,
    apiKey,
    messages,
    format,
    options
  )

  // Use proxy URL if provided
  const fetchUrl = options.proxyUrl ? 
    `${options.proxyUrl}?url=${encodeURIComponent(finalEndpoint)}` : 
    finalEndpoint

  // Setup fetch options with timeout
  const timeout = options.timeout || 30000
  const retryAttempts = options.retryAttempts || 0
  
  async function fetchWithRetry(attempt = 0) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(fetchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.text()
        let errorMessage = `API error (${response.status})`
        
        try {
          const errorJson = JSON.parse(errorData)
          errorMessage = errorJson.error?.message || 
                        errorJson.message || 
                        errorJson.detail ||
                        errorMessage
        } catch {
          errorMessage = errorData || errorMessage
        }
        
        // Retry on 5xx errors if attempts remaining
        if (response.status >= 500 && attempt < retryAttempts) {
          console.log(`Retrying API call (attempt ${attempt + 1}/${retryAttempts})...`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          return fetchWithRetry(attempt + 1)
        }
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return parseAPIResponse(data, format)
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`)
      }
      
      if (error.message.includes('Failed to fetch') && attempt < retryAttempts) {
        console.log(`Retrying API call (attempt ${attempt + 1}/${retryAttempts})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        return fetchWithRetry(attempt + 1)
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Unable to connect to API. Check your internet connection and CORS settings.')
      }
      throw error
    }
  }
  
  return fetchWithRetry()
}

/**
 * Call API with streaming support
 * @param {string} endpoint - The API endpoint
 * @param {string} apiKey - The API key
 * @param {Array} messages - The message history
 * @param {Object} options - Configuration options
 * @param {Function} onChunk - Callback for each streamed chunk
 * @returns {Promise<void>}
 */
export async function callAPIStream(endpoint, apiKey, messages, options = {}, onChunk) {
  // Validate inputs
  const urlValidation = validateURL(endpoint)
  if (!urlValidation.valid) {
    throw new Error(`Invalid API endpoint: ${urlValidation.error}`)
  }

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('API key is required')
  }

  if (!messages || messages.length === 0) {
    throw new Error('No messages to send')
  }

  // Detect API format
  const format = detectAPIFormat(endpoint)
  
  // Build request with proper parameter mapping and force streaming
  const { endpoint: finalEndpoint, headers, body } = buildAPIRequest(
    endpoint,
    apiKey,
    messages,
    format,
    { ...options, stream: true }
  )
  
  // Enable streaming in the request body
  body.stream = true

  // Use proxy URL if provided
  const fetchUrl = options.proxyUrl ? 
    `${options.proxyUrl}?url=${encodeURIComponent(finalEndpoint)}` : 
    finalEndpoint

  const controller = new AbortController()
  const timeout = options.timeout || 60000 // Longer timeout for streaming
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.text()
      let errorMessage = `API error (${response.status})`
      
      try {
        const errorJson = JSON.parse(errorData)
        errorMessage = errorJson.error?.message || 
                      errorJson.message || 
                      errorJson.detail ||
                      errorMessage
      } catch {
        errorMessage = errorData || errorMessage
      }
      
      throw new Error(errorMessage)
    }

    // Process streaming response
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            return
          }
          
          try {
            const chunk = JSON.parse(data)
            const content = parseStreamChunk(chunk, format)
            if (content !== '') {
              onChunk(content)
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e, data)
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Unable to connect to API. Check your internet connection and CORS settings.')
    }
    throw error
  }
}

/**
 * Parse a streaming chunk based on API format
 * @param {Object} chunk - The chunk data
 * @param {string} format - The API format
 * @returns {string} The parsed content or empty string
 */
function parseStreamChunk(chunk, format) {
  switch (format) {
    case API_FORMATS.OPENAI:
      return chunk.choices?.[0]?.delta?.content || ''
      
    case API_FORMATS.ANTHROPIC:
      if (chunk.type === 'content_block_delta') {
        return chunk.delta?.text || ''
      }
      return ''
      
    case API_FORMATS.GOOGLE:
      return chunk.candidates?.[0]?.content?.parts?.[0]?.text || ''
      
    default:
      // Try common patterns
      return chunk.choices?.[0]?.delta?.content || 
             chunk.delta?.text || 
             chunk.text || 
             ''
  }
}