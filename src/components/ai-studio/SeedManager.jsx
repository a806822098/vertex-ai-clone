import { useState } from 'react'
import { 
  ArrowPathIcon, 
  LockClosedIcon,
  LockOpenIcon,
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

function SeedManager({ seed, onChange, className }) {
  const [isLocked, setIsLocked] = useState(false)
  const [copiedSeed, setCopiedSeed] = useState(null)
  const [recentSeeds, setRecentSeeds] = useState([])
  
  const generateRandomSeed = () => {
    if (!isLocked) {
      const newSeed = Math.floor(Math.random() * 2147483647)
      onChange(newSeed)
      
      // Add to recent seeds
      setRecentSeeds(prev => {
        const updated = [newSeed, ...prev.filter(s => s !== newSeed)].slice(0, 5)
        return updated
      })
    }
  }
  
  const handleSeedChange = (e) => {
    const value = e.target.value
    if (value === '') {
      onChange(null)
    } else {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue >= 0 && numValue <= 2147483647) {
        onChange(numValue)
      }
    }
  }
  
  const copySeed = (seedValue) => {
    navigator.clipboard.writeText(seedValue.toString())
    setCopiedSeed(seedValue)
    setTimeout(() => setCopiedSeed(null), 2000)
  }
  
  return (
    <div className={clsx('bg-vertex-bg-secondary rounded-lg shadow-sm border border-vertex-border', className)}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-vertex-text-primary flex items-center gap-2">
            <ArrowPathIcon className="w-4 h-4" />
            Seed Control
          </h3>
          
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={clsx(
              'p-1.5 rounded-md transition-colors',
              isLocked 
                ? 'bg-vertex-accent/20 text-vertex-accent hover:bg-vertex-accent/30' 
                : 'hover:bg-vertex-bg-tertiary text-vertex-text-secondary'
            )}
            title={isLocked ? 'Unlock seed' : 'Lock seed'}
          >
            {isLocked ? (
              <LockClosedIcon className="w-4 h-4" />
            ) : (
              <LockOpenIcon className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={seed || ''}
              onChange={handleSeedChange}
              disabled={isLocked}
              placeholder="Random"
              min="0"
              max="2147483647"
              className={clsx(
                'flex-1 px-3 py-2 text-sm font-mono',
                'border border-vertex-border rounded-md bg-vertex-bg-tertiary text-vertex-text-primary',
                'focus:ring-2 focus:ring-vertex-accent focus:border-vertex-accent',
                isLocked && 'bg-vertex-bg-primary text-vertex-text-tertiary cursor-not-allowed'
              )}
            />
            
            <button
              onClick={generateRandomSeed}
              disabled={isLocked}
              className={clsx(
                'px-3 py-2 rounded-md transition-colors',
                isLocked 
                  ? 'bg-vertex-bg-tertiary text-vertex-text-tertiary cursor-not-allowed'
                  : 'bg-vertex-accent text-white hover:bg-vertex-accent-hover'
              )}
              title="Generate random seed"
            >
              <ArrowPathIcon className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => copySeed(seed)}
              disabled={!seed}
              className={clsx(
                'px-3 py-2 rounded-md transition-colors',
                !seed
                  ? 'bg-vertex-bg-tertiary text-vertex-text-tertiary cursor-not-allowed'
                  : 'hover:bg-vertex-bg-tertiary text-vertex-text-secondary'
              )}
              title="Copy seed"
            >
              {copiedSeed === seed ? (
                <CheckIcon className="w-4 h-4 text-vertex-success" />
              ) : (
                <ClipboardIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          
          <div className="text-xs text-vertex-text-secondary space-y-1">
            <p>
              {seed ? (
                <>Using seed: <span className="font-mono font-medium">{seed}</span></>
              ) : (
                'Using random seed (non-deterministic)'
              )}
            </p>
            <p>
              Seeds ensure reproducible outputs when using the same prompt and parameters.
            </p>
          </div>
          
          {recentSeeds.length > 0 && (
            <div className="pt-2 border-t border-vertex-border">
              <p className="text-xs font-medium text-vertex-text-secondary mb-2">Recent seeds:</p>
              <div className="flex flex-wrap gap-1">
                {recentSeeds.map((recentSeed) => (
                  <button
                    key={recentSeed}
                    onClick={() => {
                      onChange(recentSeed)
                      if (!isLocked) {
                        setIsLocked(true)
                      }
                    }}
                    className={clsx(
                      'px-2 py-1 text-xs font-mono rounded',
                      'bg-vertex-bg-tertiary hover:bg-vertex-bg-primary text-vertex-text-secondary',
                      'transition-colors',
                      seed === recentSeed && 'ring-2 ring-vertex-accent'
                    )}
                  >
                    {recentSeed}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SeedManager