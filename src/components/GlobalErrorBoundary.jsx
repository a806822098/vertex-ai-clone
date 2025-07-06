import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('GlobalErrorBoundary caught:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-vertex-bg-primary flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-vertex-bg-secondary rounded-lg shadow-xl p-8 border border-vertex-border">
            <div className="flex items-center gap-3 mb-6">
              <ExclamationTriangleIcon className="w-8 h-8 text-vertex-error" />
              <h1 className="text-2xl font-bold text-vertex-text-primary">应用出错了</h1>
            </div>
            
            <p className="text-vertex-text-secondary mb-6">
              抱歉，应用遇到了一些问题。
            </p>

            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-vertex-text-primary mb-2">错误详情</h2>
                <pre className="bg-vertex-bg-tertiary p-4 rounded text-sm text-vertex-error overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {this.state.errorInfo && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-vertex-text-primary mb-2">组件堆栈</h2>
                <pre className="bg-vertex-bg-tertiary p-4 rounded text-xs text-vertex-text-tertiary overflow-x-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-vertex-accent text-white rounded-lg hover:bg-vertex-accent/90 transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
                className="px-6 py-2 bg-vertex-bg-tertiary text-vertex-text-secondary rounded-lg hover:bg-vertex-bg-tertiary/80 transition-colors"
              >
                清除数据并刷新
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-500">
                💡 提示：如果问题持续存在，请尝试清除浏览器缓存或使用隐私模式。
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary