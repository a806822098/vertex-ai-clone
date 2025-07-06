import { useState, useEffect } from 'react'
import ChatInterface from './components/ChatInterface'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import PasswordModal from './components/PasswordModal'
import { secureStorage } from './utils/crypto'
import { Toaster } from 'react-hot-toast'
import { PromptProvider } from './prompt-library/context/PromptContext'
// import { updateCustomModels } from './utils/modelConfig' // 已移除，由modelStore管理
import { I18nProvider } from './hooks/useI18n.jsx'
import SplashScreen from './components/SplashScreen'
import { useModelStore } from './stores/modelStore'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [apiEndpoint, setApiEndpoint] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [advancedApiConfig, setAdvancedApiConfig] = useState({})
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  
  const [isLocked, setIsLocked] = useState(true)
  const [masterPassword, setMasterPassword] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordMode, setPasswordMode] = useState('verify')
  const [passwordError, setPasswordError] = useState('')
  
  const { initialize: initializeModelStore } = useModelStore()

  useEffect(() => {
    const initializeApp = async () => {
      // Initialize model store
      initializeModelStore()
      
      const hasMasterPassword = secureStorage.hasMasterPassword()
      
      if (!hasMasterPassword) {
        setPasswordMode('create')
        setShowPasswordModal(true)
      } else {
        setPasswordMode('verify')
        setShowPasswordModal(true)
      }
      
      const savedEndpoint = localStorage.getItem('apiEndpoint')
      if (savedEndpoint) {
        setApiEndpoint(savedEndpoint)
      }
      
      const savedAdvancedConfig = localStorage.getItem('advancedApiConfig')
      if (savedAdvancedConfig) {
        try {
          const config = JSON.parse(savedAdvancedConfig)
          setAdvancedApiConfig(config)
          
          // Update custom models in model selector
          // if (config.customModels) {
          //   updateCustomModels(config.customModels) // 已由modelStore管理
          // }
        } catch (e) {
          console.error('Failed to parse advanced config:', e)
        }
      }
      
      // Load saved conversations
      const savedConversations = localStorage.getItem('conversations')
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations))
      }
    }
    
    initializeApp()
  }, [initializeModelStore])

  // Save conversations when they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  const handlePasswordSubmit = async (password) => {
    setPasswordError('')
    
    try {
      if (passwordMode === 'create') {
        await secureStorage.setMasterPassword(password)
        setMasterPassword(password)
        setIsLocked(false)
        setShowPasswordModal(false)
      } else {
        const isValid = await secureStorage.verifyMasterPassword(password)
        if (isValid) {
          setMasterPassword(password)
          setIsLocked(false)
          setShowPasswordModal(false)
          
          const encryptedApiKey = await secureStorage.getItem('apiKey', password)
          if (encryptedApiKey) {
            setApiKey(encryptedApiKey)
          }
        } else {
          setPasswordError('Incorrect password. Please try again.')
        }
      }
    } catch {
      setPasswordError('An error occurred. Please try again.')
    }
  }

  const handleApiEndpointChange = (value) => {
    setApiEndpoint(value)
    localStorage.setItem('apiEndpoint', value)
  }
  
  const handleAdvancedConfigChange = (config) => {
    setAdvancedApiConfig(config)
    localStorage.setItem('advancedApiConfig', JSON.stringify(config))
    
    // Update custom models in model selector
    // if (config.customModels) {
    //   updateCustomModels(config.customModels) // 已由modelStore管理
    // }
  }

  const handleSaveSettings = async () => {
    if (!isLocked && masterPassword && apiKey) {
      try {
        await secureStorage.setItem('apiKey', apiKey, masterPassword)
      } catch (error) {
        console.error('Failed to save API key:', error)
      }
    }
  }

  const handleNewConversation = () => {
    const newConversation = {
      id: Date.now(),
      title: 'New Conversation',
      lastMessage: 'No messages yet',
      timestamp: new Date().toISOString()
    }
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newConversation.id)
  }

  const handleUpdateConversation = (conversationId, updates) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId 
        ? { ...conv, ...updates }
        : conv
    ))
  }

  const handleDeleteConversation = (conversationId) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId))
    localStorage.removeItem(`conversation_${conversationId}`)
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null)
    }
  }

  return (
    <I18nProvider>
      {showSplash ? (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      ) : (
        <PromptProvider>
          <>
          <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#252525',
            color: '#e5e5e5',
            border: '1px solid #404040',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#252525',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#252525',
            },
          },
        }}
      />
      
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        mode={passwordMode}
        error={passwordError}
      />
      
      <div className="flex h-screen bg-vertex-bg-primary">
        <Sidebar 
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={setCurrentConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
        <div className="flex-1 flex flex-col">
          <Header 
            apiEndpoint={apiEndpoint}
            apiKey={apiKey}
            advancedApiConfig={advancedApiConfig}
            onApiEndpointChange={handleApiEndpointChange}
            onApiKeyChange={setApiKey}
            onAdvancedConfigChange={handleAdvancedConfigChange}
            isLocked={!isLocked}
            onSaveSettings={handleSaveSettings}
          />
          <ChatInterface 
            apiEndpoint={apiEndpoint}
            apiKey={apiKey}
            advancedApiConfig={advancedApiConfig}
            conversationId={currentConversationId}
            onUpdateConversation={handleUpdateConversation}
          />
        </div>
      </div>
      </>
      </PromptProvider>
      )}
    </I18nProvider>
  )
}

export default App