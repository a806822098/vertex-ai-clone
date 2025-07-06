import clsx from 'clsx'

function LoadingDots({ className }) {
  return (
    <div className={clsx("flex items-center space-x-1", className)}>
      <div className="w-2 h-2 bg-vertex-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-vertex-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-vertex-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  )
}

export default LoadingDots