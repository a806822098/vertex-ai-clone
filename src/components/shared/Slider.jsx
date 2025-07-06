import { useState, useEffect } from 'react'
import clsx from 'clsx'

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  defaultValue,
  description,
  showValue = true,
  formatValue = (v) => v,
  className
}) {
  const [localValue, setLocalValue] = useState(value ?? defaultValue ?? min)
  
  useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value)
    }
  }, [value])

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value)
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const percentage = ((localValue - min) / (max - min)) * 100

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {showValue && (
          <span className="text-sm font-mono text-gray-600">
            {formatValue(localValue)}
          </span>
        )}
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
          }}
        />
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        
        .slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
          transition: all 0.2s;
        }
        
        .slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  )
}

export default Slider