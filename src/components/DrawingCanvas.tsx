import React, { useRef, useEffect, useState } from 'react'
import { Palette, Eraser, RotateCcw, Check, X } from 'lucide-react'

interface DrawingCanvasProps {
  onSave: (dataUrl: string) => void
  onCancel: () => void
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(3)
  const [isEraser, setIsEraser] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
    '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080'
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 300

    // Set white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Set drawing properties
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = clientX - rect.left
    const y = clientY - rect.top

    ctx.lineWidth = brushSize
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
    ctx.strokeStyle = currentColor

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const stopDrawing = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.beginPath()
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg text-neutral-900">Create Drawing</h3>
        <button
          onClick={onCancel}
          className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Canvas */}
      <div className="flex justify-center mb-6">
        <div className="border-2 border-neutral-200 rounded-2xl overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="block cursor-crosshair touch-none"
            style={{ width: '300px', height: '300px' }}
          />
        </div>
      </div>

      {/* Tools */}
      <div className="space-y-4">
        {/* Color and Eraser */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center space-x-2 px-3 py-2 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              <div 
                className="w-6 h-6 rounded-full border-2 border-neutral-300"
                style={{ backgroundColor: currentColor }}
              />
              <Palette className="w-4 h-4 text-neutral-600" />
            </button>

            <button
              onClick={() => setIsEraser(!isEraser)}
              className={`p-2 rounded-xl transition-colors ${
                isEraser 
                  ? 'bg-rose-100 text-rose-600' 
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              <Eraser className="w-5 h-5" />
            </button>

            <button
              onClick={clearCanvas}
              className="p-2 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-600">Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-neutral-600 w-6">{brushSize}</span>
          </div>
        </div>

        {/* Color Picker */}
        {showColorPicker && (
          <div className="grid grid-cols-6 gap-2 p-3 bg-neutral-50 rounded-xl">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setCurrentColor(color)
                  setIsEraser(false)
                  setShowColorPicker(false)
                }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  currentColor === color 
                    ? 'border-neutral-400 scale-110' 
                    : 'border-neutral-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-neutral-100 text-neutral-700 rounded-2xl hover:bg-neutral-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={saveDrawing}
            className="flex-1 py-3 px-4 bg-rose-500 text-white rounded-2xl hover:bg-rose-600 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Save Drawing</span>
          </button>
        </div>
      </div>
    </div>
  )
}