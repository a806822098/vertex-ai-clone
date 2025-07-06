import { useState } from 'react'
import { useI18n } from '../hooks/useI18n.jsx'

function PasswordModal({ isOpen, onClose, onSubmit, mode, error }) {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setLocalError('')

    if (mode === 'create' && password !== confirmPassword) {
      setLocalError(t('password.mismatch'))
      return
    }

    onSubmit(password)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 模态框主体 */}
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* 发光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 blur-2xl" />
        
        <div className="relative bg-[#141414] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* 顶部渐变条 */}
          <div className="h-1 bg-gradient-to-r from-red-600 to-red-500" />
          
          {/* 内容区 */}
          <div className="p-8">
            {/* 图标和标题 */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-600 to-red-700 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={mode === 'create' 
                      ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    }
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">
                {mode === 'create' ? t('password.setTitle') : t('password.enterTitle')}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 密码输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('password.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('password.passwordPlaceholder')}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 确认密码（仅创建模式） */}
              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('password.confirmPassword')}
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('password.confirmPlaceholder')}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    required
                  />
                </div>
              )}

              {/* 错误提示 */}
              {(error || localError) && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error || localError}</p>
                </div>
              )}

              {/* 重要提示 */}
              {mode === 'create' && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <p className="text-sm font-medium text-gray-300 mb-2">{t('password.important')}</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {t('password.tip1')}
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {t('password.tip2')}
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {t('password.tip3')}
                    </li>
                  </ul>
                </div>
              )}

              {/* 按钮组 */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {mode === 'create' ? t('password.setPassword') : t('password.unlock')}
                </button>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-gray-800 text-gray-300 font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600/50 transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordModal