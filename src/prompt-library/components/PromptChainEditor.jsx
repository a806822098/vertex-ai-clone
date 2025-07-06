import { useState, useRef } from 'react'
import { 
  PlusIcon,
  TrashIcon,
  PlayIcon,
  ArrowPathIcon,
  CpuChipIcon,
  DocumentTextIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'

const NODE_TYPES = {
  prompt: { icon: DocumentTextIcon, color: 'blue', label: 'Prompt' },
  condition: { icon: AdjustmentsHorizontalIcon, color: 'yellow', label: 'Condition' },
  loop: { icon: ArrowPathIcon, color: 'purple', label: 'Loop' },
  transform: { icon: CpuChipIcon, color: 'green', label: 'Transform' },
  output: { icon: BeakerIcon, color: 'gray', label: 'Output' }
}

function PromptChainEditor({ chain, onChange, prompts, onRun, className }) {
  const canvasRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectingFrom, setConnectingFrom] = useState(null)
  const [draggedNode, setDraggedNode] = useState(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
  
  // Initialize with empty chain if not provided
  const currentChain = chain || {
    id: crypto.randomUUID(),
    name: 'New Chain',
    nodes: [],
    globalVariables: {}
  }
  
  const handleAddNode = (type, position) => {
    const newNode = {
      id: crypto.randomUUID(),
      type,
      name: `${NODE_TYPES[type].label} ${currentChain.nodes.length + 1}`,
      data: getDefaultNodeData(type),
      position: position || { x: 100, y: 100 },
      inputs: [],
      outputs: []
    }
    
    onChange({
      ...currentChain,
      nodes: [...currentChain.nodes, newNode]
    })
    
    setShowNodeMenu(false)
  }
  
  const getDefaultNodeData = (type) => {
    switch (type) {
      case 'prompt':
        return { promptId: '', variables: {} }
      case 'condition':
        return { condition: '', trueBranch: null, falseBranch: null }
      case 'loop':
        return { loopOver: '', itemVar: 'item', maxIterations: 10 }
      case 'transform':
        return { transform: 'return input;' }
      case 'output':
        return { format: 'text' }
      default:
        return {}
    }
  }
  
  const handleDeleteNode = (nodeId) => {
    const updatedNodes = currentChain.nodes.filter(n => n.id !== nodeId)
    
    // Remove connections
    updatedNodes.forEach(node => {
      node.inputs = node.inputs.filter(id => id !== nodeId)
      node.outputs = node.outputs.filter(id => id !== nodeId)
    })
    
    onChange({
      ...currentChain,
      nodes: updatedNodes
    })
    
    setSelectedNode(null)
  }
  
  const handleNodeDragStart = (e, node) => {
    const rect = e.target.getBoundingClientRect()
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggedNode(node)
  }
  
  const handleNodeDrag = (e) => {
    if (!draggedNode || !canvasRef.current) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - offset.x
    const y = e.clientY - rect.top - offset.y
    
    const updatedNodes = currentChain.nodes.map(node =>
      node.id === draggedNode.id
        ? { ...node, position: { x: Math.max(0, x), y: Math.max(0, y) } }
        : node
    )
    
    onChange({
      ...currentChain,
      nodes: updatedNodes
    })
  }
  
  const handleNodeDragEnd = () => {
    setDraggedNode(null)
  }
  
  const handleStartConnection = (nodeId) => {
    setIsConnecting(true)
    setConnectingFrom(nodeId)
  }
  
  const handleCompleteConnection = (toNodeId) => {
    if (!connectingFrom || connectingFrom === toNodeId) {
      setIsConnecting(false)
      setConnectingFrom(null)
      return
    }
    
    const updatedNodes = currentChain.nodes.map(node => {
      if (node.id === connectingFrom) {
        return {
          ...node,
          outputs: [...new Set([...node.outputs, toNodeId])]
        }
      }
      if (node.id === toNodeId) {
        return {
          ...node,
          inputs: [...new Set([...node.inputs, connectingFrom])]
        }
      }
      return node
    })
    
    onChange({
      ...currentChain,
      nodes: updatedNodes
    })
    
    setIsConnecting(false)
    setConnectingFrom(null)
  }
  
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null)
    }
  }
  
  const handleCanvasRightClick = (e) => {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    setMenuPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setShowNodeMenu(true)
  }
  
  const renderConnection = (fromNode, toNodeId) => {
    const toNode = currentChain.nodes.find(n => n.id === toNodeId)
    if (!toNode) return null
    
    const x1 = fromNode.position.x + 120 // node width / 2
    const y1 = fromNode.position.y + 40  // node height / 2
    const x2 = toNode.position.x + 120
    const y2 = toNode.position.y + 40
    
    // Create curved path
    const dx = x2 - x1
    // const dy = y2 - y1
    // const dr = Math.sqrt(dx * dx + dy * dy)
    
    return (
      <path
        key={`${fromNode.id}-${toNodeId}`}
        d={`M ${x1} ${y1} Q ${x1 + dx/2} ${y1} ${x2} ${y2}`}
        stroke="#94a3b8"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    )
  }
  
  const renderNode = (node) => {
    const NodeIcon = NODE_TYPES[node.type].icon
    const isSelected = selectedNode?.id === node.id
    const isConnectingTo = isConnecting && connectingFrom !== node.id
    
    return (
      <div
        key={node.id}
        className={clsx(
          'absolute w-60 bg-white rounded-lg shadow-lg border-2 cursor-move select-none',
          'transition-all duration-200',
          isSelected && 'ring-2 ring-blue-500',
          isConnectingTo && 'hover:ring-2 hover:ring-green-500',
          `border-${NODE_TYPES[node.type].color}-400`
        )}
        style={{
          left: node.position.x,
          top: node.position.y,
          borderColor: isSelected ? '#3B82F6' : undefined
        }}
        onMouseDown={(e) => handleNodeDragStart(e, node)}
        onClick={() => {
          if (isConnecting) {
            handleCompleteConnection(node.id)
          } else {
            setSelectedNode(node)
          }
        }}
      >
        <div className={`bg-${NODE_TYPES[node.type].color}-50 px-3 py-2 rounded-t-md border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NodeIcon className="w-5 h-5 text-gray-700" />
              <span className="font-medium text-sm text-gray-900">{node.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteNode(node.id)
              }}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-3 text-sm">
          {node.type === 'prompt' && (
            <div>
              {node.data.promptId ? (
                <p className="text-gray-700">
                  {prompts?.find(p => p.id === node.data.promptId)?.name || 'Unknown prompt'}
                </p>
              ) : (
                <p className="text-gray-400 italic">No prompt selected</p>
              )}
            </div>
          )}
          
          {node.type === 'condition' && (
            <code className="text-xs text-gray-600 font-mono">
              {node.data.condition || 'if (condition) { ... }'}
            </code>
          )}
          
          {node.type === 'loop' && (
            <div className="text-gray-600">
              <p>Loop over: <code className="text-xs">{node.data.loopOver || 'items'}</code></p>
              <p>Max: {node.data.maxIterations} iterations</p>
            </div>
          )}
          
          {node.type === 'transform' && (
            <code className="text-xs text-gray-600 font-mono block">
              {node.data.transform?.substring(0, 50) || 'transform(input)'}...
            </code>
          )}
          
          {node.type === 'output' && (
            <p className="text-gray-600">Format: {node.data.format}</p>
          )}
        </div>
        
        {/* Connection Points */}
        {node.inputs.length > 0 && (
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleStartConnection(node.id)
          }}
          className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white hover:scale-125 transition-transform"
        />
      </div>
    )
  }
  
  return (
    <div className={clsx('flex flex-col h-full bg-gray-50', className)}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-5 h-5 text-gray-600" />
            <input
              type="text"
              value={currentChain.name}
              onChange={(e) => onChange({ ...currentChain, name: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNodeMenu(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <PlusIcon className="w-4 h-4" />
              Add Node
            </button>
            
            {onRun && (
              <button
                onClick={() => onRun(currentChain)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <PlayIcon className="w-4 h-4" />
                Run Chain
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-auto">
        <div
          ref={canvasRef}
          className="absolute inset-0 min-w-[2000px] min-h-[2000px]"
          onClick={handleCanvasClick}
          onContextMenu={handleCanvasRightClick}
          onMouseMove={draggedNode ? handleNodeDrag : undefined}
          onMouseUp={draggedNode ? handleNodeDragEnd : undefined}
          style={{
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 pointer-events-none">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#94a3b8"
                />
              </marker>
            </defs>
            
            {/* Render connections */}
            {currentChain.nodes.map(node =>
              node.outputs.map(outputId => renderConnection(node, outputId))
            )}
          </svg>
          
          {/* Render nodes */}
          {currentChain.nodes.map(renderNode)}
          
          {/* Node Menu */}
          {showNodeMenu && (
            <div
              className="absolute bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
              style={{ left: menuPosition.x, top: menuPosition.y }}
            >
              {Object.entries(NODE_TYPES).map(([type, config]) => {
                const Icon = config.icon
                return (
                  <button
                    key={type}
                    onClick={() => handleAddNode(type, menuPosition)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                    <span>{config.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Node Properties Panel */}
      {selectedNode && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-semibold text-lg mb-4">Node Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={selectedNode.name}
                onChange={(e) => {
                  const updated = currentChain.nodes.map(n =>
                    n.id === selectedNode.id
                      ? { ...n, name: e.target.value }
                      : n
                  )
                  onChange({ ...currentChain, nodes: updated })
                  setSelectedNode({ ...selectedNode, name: e.target.value })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {selectedNode.type === 'prompt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Prompt
                </label>
                <select
                  value={selectedNode.data.promptId || ''}
                  onChange={(e) => {
                    const updated = currentChain.nodes.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, promptId: e.target.value } }
                        : n
                    )
                    onChange({ ...currentChain, nodes: updated })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a prompt...</option>
                  {prompts?.map(prompt => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {selectedNode.type === 'condition' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition Expression
                </label>
                <textarea
                  value={selectedNode.data.condition || ''}
                  onChange={(e) => {
                    const updated = currentChain.nodes.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, condition: e.target.value } }
                        : n
                    )
                    onChange({ ...currentChain, nodes: updated })
                  }}
                  placeholder="input.length > 0"
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            )}
            
            {selectedNode.type === 'loop' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loop Over Variable
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.loopOver || ''}
                    onChange={(e) => {
                      const updated = currentChain.nodes.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, loopOver: e.target.value } }
                          : n
                      )
                      onChange({ ...currentChain, nodes: updated })
                    }}
                    placeholder="items"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Iterations
                  </label>
                  <input
                    type="number"
                    value={selectedNode.data.maxIterations || 10}
                    onChange={(e) => {
                      const updated = currentChain.nodes.map(n =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, maxIterations: parseInt(e.target.value) } }
                          : n
                      )
                      onChange({ ...currentChain, nodes: updated })
                    }}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            
            {selectedNode.type === 'transform' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transform Function
                </label>
                <textarea
                  value={selectedNode.data.transform || ''}
                  onChange={(e) => {
                    const updated = currentChain.nodes.map(n =>
                      n.id === selectedNode.id
                        ? { ...n, data: { ...n.data, transform: e.target.value } }
                        : n
                    )
                    onChange({ ...currentChain, nodes: updated })
                  }}
                  placeholder="// Transform the input\nreturn input.toUpperCase();"
                  className="w-full px-3 py-2 font-mono text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PromptChainEditor