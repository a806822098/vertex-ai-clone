/**
 * Prompt Library Type Definitions
 * 
 * This file defines the core data structures for the professional prompt engineering platform
 */

/**
 * Variable Types
 * @typedef {'text' | 'select' | 'number' | 'boolean' | 'date' | 'dynamic'} VariableType
 */

/**
 * Variable Definition
 * @typedef {Object} Variable
 * @property {string} name - Variable name (e.g., "userName")
 * @property {VariableType} type - Type of the variable
 * @property {string} label - Display label
 * @property {string} [description] - Help text
 * @property {*} [defaultValue] - Default value
 * @property {boolean} [required] - Is this variable required?
 * @property {Object} [validation] - Validation rules
 * @property {string[]} [options] - Options for select type
 * @property {number} [min] - Minimum value for number type
 * @property {number} [max] - Maximum value for number type
 * @property {string} [pattern] - Regex pattern for text validation
 * @property {string} [dynamicFunction] - Function name for dynamic variables
 */

/**
 * Prompt Template
 * @typedef {Object} PromptTemplate
 * @property {string} id - Unique identifier
 * @property {string} name - Template name
 * @property {string} content - Template content with variables
 * @property {string} description - Template description
 * @property {string} category - Category (e.g., "writing", "coding", "analysis")
 * @property {string[]} tags - Searchable tags
 * @property {Variable[]} variables - Variable definitions
 * @property {Object} metadata
 * @property {string} metadata.author - Author name
 * @property {Date} metadata.created - Creation date
 * @property {Date} metadata.updated - Last update date
 * @property {number} metadata.version - Version number
 * @property {string[]} metadata.history - Version history IDs
 * @property {number} metadata.usageCount - Usage statistics
 * @property {number} metadata.rating - Community rating
 * @property {boolean} isPublic - Can be shared
 * @property {string} [parentId] - Parent template ID for variations
 */

/**
 * Environment Variable Set
 * @typedef {Object} EnvironmentSet
 * @property {string} id - Unique identifier
 * @property {string} name - Environment name (e.g., "development", "production")
 * @property {Object.<string, *>} variables - Key-value pairs
 * @property {boolean} isActive - Currently active environment
 * @property {Date} created - Creation date
 * @property {Date} updated - Last update date
 */

/**
 * Prompt Chain Node Types
 * @typedef {'prompt' | 'condition' | 'loop' | 'transform' | 'output'} NodeType
 */

/**
 * Chain Node
 * @typedef {Object} ChainNode
 * @property {string} id - Node ID
 * @property {NodeType} type - Node type
 * @property {string} name - Node name
 * @property {Object} data - Node-specific data
 * @property {string} data.promptId - For prompt nodes
 * @property {string} data.condition - For condition nodes
 * @property {string} data.loopOver - For loop nodes
 * @property {string} data.transform - For transform nodes
 * @property {Object} position - Visual position
 * @property {number} position.x
 * @property {number} position.y
 * @property {string[]} inputs - Input node IDs
 * @property {string[]} outputs - Output node IDs
 */

/**
 * Prompt Chain
 * @typedef {Object} PromptChain
 * @property {string} id - Chain ID
 * @property {string} name - Chain name
 * @property {string} description - Chain description
 * @property {ChainNode[]} nodes - Chain nodes
 * @property {Object.<string, *>} globalVariables - Shared variables
 * @property {Date} created - Creation date
 * @property {Date} updated - Last update date
 */

/**
 * Category Definition
 * @typedef {Object} Category
 * @property {string} id - Category ID
 * @property {string} name - Category name
 * @property {string} icon - Category icon/emoji
 * @property {string} description - Category description
 * @property {string} [parentId] - Parent category for subcategories
 * @property {number} order - Display order
 */

/**
 * Search Filters
 * @typedef {Object} SearchFilters
 * @property {string} query - Search query
 * @property {string[]} categories - Selected categories
 * @property {string[]} tags - Selected tags
 * @property {string} author - Author filter
 * @property {'name' | 'date' | 'usage' | 'rating'} sortBy - Sort field
 * @property {'asc' | 'desc'} sortOrder - Sort direction
 * @property {boolean} includePublic - Include public templates
 */

/**
 * Dynamic Variable Functions
 */
export const DYNAMIC_FUNCTIONS = {
  timestamp: () => new Date().toISOString(),
  date: () => new Date().toLocaleDateString(),
  time: () => new Date().toLocaleTimeString(),
  uuid: () => crypto.randomUUID(),
  random: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  lorem: (words = 10) => {
    const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 
                       'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor'];
    return Array.from({ length: words }, () => 
      loremWords[Math.floor(Math.random() * loremWords.length)]
    ).join(' ');
  }
}

/**
 * Default Categories
 */
export const DEFAULT_CATEGORIES = [
  { id: 'writing', name: 'Writing', icon: '✍️', description: 'Content creation and copywriting' },
  { id: 'coding', name: 'Coding', icon: '💻', description: 'Programming and development' },
  { id: 'analysis', name: 'Analysis', icon: '📊', description: 'Data analysis and research' },
  { id: 'creative', name: 'Creative', icon: '🎨', description: 'Creative and artistic tasks' },
  { id: 'business', name: 'Business', icon: '💼', description: 'Business and professional' },
  { id: 'education', name: 'Education', icon: '🎓', description: 'Teaching and learning' },
  { id: 'personal', name: 'Personal', icon: '👤', description: 'Personal productivity' },
  { id: 'custom', name: 'Custom', icon: '⚙️', description: 'Custom templates' }
]

/**
 * Variable Type Configurations
 */
export const VARIABLE_CONFIGS = {
  text: {
    icon: '📝',
    defaultValidation: { maxLength: 1000 }
  },
  select: {
    icon: '📋',
    requiresOptions: true
  },
  number: {
    icon: '🔢',
    defaultValidation: { min: 0, max: 999999 }
  },
  boolean: {
    icon: '✓',
    defaultValue: false
  },
  date: {
    icon: '📅',
    defaultValue: () => new Date().toISOString().split('T')[0]
  },
  dynamic: {
    icon: '⚡',
    functions: Object.keys(DYNAMIC_FUNCTIONS)
  }
}