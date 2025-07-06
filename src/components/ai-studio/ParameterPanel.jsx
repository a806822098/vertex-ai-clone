import { useState } from 'react'
import Slider from '../shared/Slider'
import { ChevronDownIcon, ChevronUpIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

function ParameterPanel({ parameters, onChange, className }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleParameterChange = (key, value) => {
    onChange({
      ...parameters,
      [key]: value
    })
  }

  return (
    <div className={clsx('bg-vertex-bg-secondary rounded-lg shadow-sm border border-vertex-border', className)}>
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-vertex-bg-tertiary"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-sm font-semibold text-vertex-text-primary">Model Parameters</h3>
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5 text-vertex-text-secondary" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-vertex-text-secondary" />
        )}
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <Slider
            label="Temperature"
            value={parameters.temperature}
            onChange={(value) => handleParameterChange('temperature', value)}
            min={0}
            max={2}
            step={0.01}
            defaultValue={0.7}
            formatValue={(v) => v.toFixed(2)}
            description="Controls randomness. Lower values make output more focused and deterministic."
          />
          
          <Slider
            label="Max Tokens"
            value={parameters.maxTokens}
            onChange={(value) => handleParameterChange('maxTokens', value)}
            min={1}
            max={4096}
            step={1}
            defaultValue={1024}
            formatValue={(v) => v.toString()}
            description="Maximum number of tokens to generate. One token ≈ 4 characters."
          />
          
          <div className="pt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-vertex-accent hover:text-vertex-accent-hover font-medium"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Parameters
            </button>
          </div>
          
          {showAdvanced && (
            <div className="space-y-4 pt-2">
              <Slider
                label="Top P"
                value={parameters.topP}
                onChange={(value) => handleParameterChange('topP', value)}
                min={0}
                max={1}
                step={0.01}
                defaultValue={1}
                formatValue={(v) => v.toFixed(2)}
                description="Controls diversity via nucleus sampling. Lower values = less random."
              />
              
              <Slider
                label="Top K"
                value={parameters.topK}
                onChange={(value) => handleParameterChange('topK', value)}
                min={1}
                max={100}
                step={1}
                defaultValue={40}
                formatValue={(v) => v.toString()}
                description="Limits vocabulary to top K tokens. Lower values = less random."
              />
              
              <Slider
                label="Frequency Penalty"
                value={parameters.frequencyPenalty}
                onChange={(value) => handleParameterChange('frequencyPenalty', value)}
                min={-2}
                max={2}
                step={0.01}
                defaultValue={0}
                formatValue={(v) => v.toFixed(2)}
                description="Penalizes repeated tokens based on frequency."
              />
              
              <Slider
                label="Presence Penalty"
                value={parameters.presencePenalty}
                onChange={(value) => handleParameterChange('presencePenalty', value)}
                min={-2}
                max={2}
                step={0.01}
                defaultValue={0}
                formatValue={(v) => v.toFixed(2)}
                description="Penalizes repeated tokens based on presence."
              />
            </div>
          )}
          
          <div className="pt-4 flex gap-2">
            <button
              onClick={() => {
                onChange({
                  temperature: 0.7,
                  maxTokens: 1024,
                  topP: 1,
                  topK: 40,
                  frequencyPenalty: 0,
                  presencePenalty: 0
                })
              }}
              className="px-3 py-1 text-sm text-vertex-text-secondary hover:text-vertex-text-primary hover:bg-vertex-bg-tertiary rounded"
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={() => {
                const preset = window.prompt('Enter preset name:')
                if (preset) {
                  // Save preset logic here
                  console.log('Saving preset:', preset, parameters)
                }
              }}
              className="px-3 py-1 text-sm text-vertex-accent hover:text-vertex-accent-hover hover:bg-vertex-accent/10 rounded"
            >
              Save as Preset
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParameterPanel