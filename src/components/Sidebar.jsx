import { useState } from 'react'
import { useI18n } from '../hooks/useI18n.jsx'

function Sidebar({ conversations, currentConversationId, onSelectConversation, onNewConversation, onDeleteConversation }) {
  const { t } = useI18n()
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDelete = (id) => {
    if (deleteConfirmId === id) {
      onDeleteConversation(id)
      setDeleteConfirmId(null)
    } else {
      setDeleteConfirmId(id)
      // 3秒后自动取消确认状态
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  // 过滤对话（预留搜索功能）
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const title = conv.title || t('sidebar.newConversation')
    const lastMessage = conv.lastMessage || ''
    return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className="w-64 bg-vertex-bg-secondary text-vertex-text-primary flex flex-col border-r border-vertex-border relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-red-600 to-red-800 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-red-600 to-red-800 rounded-full blur-3xl"></div>
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 flex flex-col h-full">
        {/* 新建对话按钮 */}
        <div className="p-4">
          <button
            onClick={onNewConversation}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] group"
          >
            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('sidebar.newChat')}
          </button>
        </div>

        {/* 搜索框（预留） */}
        {conversations.length > 5 && (
          <div className="px-4 pb-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('sidebar.search')}
                className="w-full px-3 py-2 pl-9 bg-vertex-bg-tertiary rounded-lg text-sm text-vertex-text-primary placeholder-vertex-text-tertiary focus:outline-none focus:ring-2 focus:ring-red-600/30 transition-all duration-200"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vertex-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}
        
        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-vertex-text-tertiary text-sm">{t('sidebar.noConversations')}</div>
              <svg className="w-16 h-16 mx-auto mt-4 text-vertex-text-tertiary/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-xs uppercase text-vertex-text-tertiary font-medium tracking-wider">{t('sidebar.recent')}</div>
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative transition-all duration-200 ${
                    currentConversationId === conv.id ? 'bg-gradient-to-r from-red-600/10 to-transparent' : ''
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-vertex-bg-tertiary/50 transition-all duration-200 ${
                      currentConversationId === conv.id ? 'border-l-2 border-red-600' : 'hover:border-l-2 hover:border-vertex-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 transition-all duration-200 ${
                        currentConversationId === conv.id ? 'bg-red-600 shadow-lg shadow-red-600/50' : 'bg-vertex-text-tertiary'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate text-vertex-text-primary font-medium">
                          {conv.title || t('sidebar.newConversation')}
                        </div>
                        <div className="text-xs text-vertex-text-secondary mt-1 truncate">{conv.lastMessage}</div>
                      </div>
                    </div>
                  </button>
                  {onDeleteConversation && (
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                        deleteConfirmId === conv.id 
                          ? 'opacity-100 bg-red-600 hover:bg-red-700' 
                          : 'opacity-0 group-hover:opacity-100 hover:bg-vertex-bg-elevated'
                      }`}
                    >
                      {deleteConfirmId === conv.id ? (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-vertex-text-tertiary hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
        
        {/* 用户信息 */}
        <div className="p-4 border-t border-vertex-border bg-vertex-bg-secondary/50 backdrop-blur-sm">
          <div className="flex items-center gap-3 group cursor-pointer hover:bg-vertex-bg-tertiary/30 rounded-lg p-2 -m-2 transition-all duration-200">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm text-vertex-text-primary font-medium">{t('sidebar.user')}</div>
              <div className="text-xs text-vertex-text-secondary">{t('sidebar.userStatus')}</div>
            </div>
            <svg className="w-4 h-4 text-vertex-text-tertiary group-hover:text-vertex-text-secondary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}

export default Sidebar