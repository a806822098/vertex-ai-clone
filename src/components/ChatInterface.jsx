import { useState, useRef, useEffect } from 'react'
import { callAPI, callAPIStream } from '../utils/api'
import { useModelStore } from '../stores/modelStore'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import AIStudioPanel from './ai-studio/AIStudioPanel.jsx'
import PromptLibraryPanel from './prompt-library/PromptLibraryPanel.jsx'
import MessageWrapper from './MessageWrapper'
import LoadingDots from './LoadingDots'
import { AdjustmentsHorizontalIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useI18n } from '../hooks/useI18n.jsx'

function ChatInterface({ apiEndpoint, apiKey, advancedApiConfig, conversationId, onUpdateConversation }) {
  const { t } = useI18n()
  const { getActiveModel, activeModelId } = useModelStore()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState(null)
  const [showAIStudio, setShowAIStudio] = useState(false)
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [aiConfig, setAIConfig] = useState({
    model: activeModelId || 'gpt-3.5-turbo',
    parameters: {
      temperature: 0.7,
      maxTokens: 1024,
      topP: 1,
      topK: 40,
      frequencyPenalty: 0,
      presencePenalty: 0
    },
    systemPrompt: '',
    seed: null,
    responseFormat: 'text',
    enableStreaming: true
  })
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Update aiConfig when activeModelId changes
  useEffect(() => {
    if (activeModelId) {
      setAIConfig(prev => ({ ...prev, model: activeModelId }))
    }
  }, [activeModelId])

  // Load messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      const savedMessages = localStorage.getItem(`conversation_${conversationId}`)
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages))
      } else {
        setMessages([])
      }
    }
  }, [conversationId])

  // Save messages when they change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      localStorage.setItem(`conversation_${conversationId}`, JSON.stringify(messages))
      if (onUpdateConversation) {
        const lastMessage = messages[messages.length - 1]
        onUpdateConversation(conversationId, {
          lastMessage: lastMessage.content.substring(0, 50) + '...',
          timestamp: lastMessage.timestamp
        })
      }
    }
  }, [messages, conversationId, onUpdateConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputMessage])

  const sendMessage = async () => {
    const activeModel = getActiveModel()
    if (!inputMessage.trim() || !conversationId) return
    
    // 使用自定义模型的配置
    const currentApiEndpoint = activeModel?.apiEndpoint || apiEndpoint
    const currentApiKey = activeModel?.apiKey || apiKey
    const modelName = activeModel?.name || 'default-model'
    
    if (!activeModel && (!currentApiEndpoint || !currentApiKey)) {
      toast.error(t('chat.configureFirst'))
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    const assistantMessageId = Date.now() + 1
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInputMessage('')
    setIsLoading(true)
    setStreamingMessageId(assistantMessageId)

    try {
      const apiOptions = {
        model: modelName,
        ...aiConfig.parameters,
        systemPrompt: aiConfig.systemPrompt,
        seed: aiConfig.seed,
        ...advancedApiConfig,
        // 添加自定义模型的路径
        apiPath: activeModel?.apiPath || '/chat/completions'
      }

      if (aiConfig.enableStreaming) {
        await callAPIStream(
          currentApiEndpoint + (activeModel?.apiPath || ''),
          currentApiKey,
          [...messages, userMessage],
          apiOptions,
          (chunk) => {
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + chunk }
                : msg
            ))
          }
        )
      } else {
        const responseContent = await callAPI(
          currentApiEndpoint + (activeModel?.apiPath || ''),
          currentApiKey,
          [...messages, userMessage],
          apiOptions
        )
        
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: responseContent }
            : msg
        ))
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error(error.message || t('chat.sendFailed'))
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              content: `${t('common.error')}: ${error.message}\n\n${t('chat.checkConfig')}`,
              isError: true 
            }
          : msg
      ))
    } finally {
      setIsLoading(false)
      setStreamingMessageId(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-vertex-bg-primary relative">
      {/* Action Buttons - 重新设计位置避免遮挡 */}
      <div className="absolute top-20 right-6 z-30 flex flex-col gap-3">
        {/* Prompt Library Button */}
        <button
          onClick={() => setShowPromptLibrary(!showPromptLibrary)}
          className={clsx(
            'group relative p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105',
            showPromptLibrary 
              ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-purple-500/25' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-purple-600 hover:shadow-xl border border-gray-100'
          )}
          title={t('chat.openPromptLibrary')}
        >
          <BookOpenIcon className="w-5 h-5" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            提示词库
          </span>
        </button>

        {/* AI Studio Toggle Button */}
        <button
          onClick={() => setShowAIStudio(!showAIStudio)}
          className={clsx(
            'group relative p-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105',
            showAIStudio 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-500/25' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 hover:shadow-xl border border-gray-100'
          )}
          title={t('studio.title')}
        >
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI工作室
          </span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {!conversationId ? (
          <div className="text-center text-vertex-text-secondary mt-12 animate-fade-in">
            <svg className="w-16 h-16 mx-auto mb-4 text-vertex-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg text-vertex-text-primary">{t('chat.selectOrCreate')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-vertex-text-secondary mt-12 animate-fade-in">
            <svg className="w-16 h-16 mx-auto mb-4 text-vertex-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-lg text-vertex-text-primary">{t('chat.startConversation')}</p>
            <p className="text-sm mt-2">{t('chat.typeBelow')}</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageWrapper
                key={message.id}
                message={message}
                isStreaming={streamingMessageId === message.id}
              />
            ))}

            {isLoading && !streamingMessageId && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-vertex-bg-secondary px-4 py-3 rounded-lg border border-vertex-border mr-12">
                  <LoadingDots />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-vertex-border p-4 bg-vertex-bg-secondary">
        {(!getActiveModel() && (!apiEndpoint || !apiKey)) && (
          <div className="mb-4 p-3 bg-vertex-warning/10 border border-vertex-warning/20 rounded-lg text-sm text-vertex-warning">
            {t('chat.configureFirst')}
          </div>
        )}

        {!conversationId && (getActiveModel() || (apiEndpoint && apiKey)) && (
          <div className="mb-4 p-3 bg-vertex-accent/10 border border-vertex-accent/20 rounded-lg text-sm text-vertex-accent">
            {t('chat.createChatFirst')}
          </div>
        )}

        <div className="flex gap-4 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.messagePlaceholder')}
            disabled={(!getActiveModel() && (!apiEndpoint || !apiKey)) || !conversationId || isLoading}
            className="flex-1 input-primary min-h-[48px] max-h-32 resize-none"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={(!getActiveModel() && (!apiEndpoint || !apiKey)) || !conversationId || !inputMessage.trim() || isLoading}
            className={clsx(
              'px-6 py-3 rounded-lg font-medium transition-all duration-200',
              ((!getActiveModel() && (!apiEndpoint || !apiKey)) || !conversationId || !inputMessage.trim() || isLoading)
                ? 'bg-vertex-bg-tertiary text-vertex-text-tertiary cursor-not-allowed'
                : 'btn-primary'
            )}
          >
            {t('chat.send')}
          </button>
        </div>
      </div>
      
      {/* AI Studio Panel */}
      <AIStudioPanel
        isOpen={showAIStudio}
        onClose={() => setShowAIStudio(false)}
        config={aiConfig}
        onConfigChange={setAIConfig}
      />
      
      {/* Prompt Library Panel */}
      <PromptLibraryPanel
        isOpen={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
        onSelectPrompt={(prompt) => {
          setInputMessage(prompt.content)
          setShowPromptLibrary(false)
        }}
      />
    </div>
  )
}

export default ChatInterface

