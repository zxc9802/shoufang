'use client'

import { useState, useRef } from 'react'
import { Upload, X, Home } from 'lucide-react'

interface LayoutUploaderProps {
    onImageChange: (file: File | null, preview: string | null) => void
}

export default function LayoutUploader({ onImageChange }: LayoutUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const previewUrl = e.target?.result as string
            setPreview(previewUrl)
            onImageChange(file, previewUrl)
        }
        reader.readAsDataURL(file)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleFile(file)
    }

    const removeImage = () => {
        setPreview(null)
        onImageChange(null, null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="space-y-4">
            {!preview ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
            ${isDragging
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-white/30 hover:border-white/50 bg-white/5'
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />
                    <Home className="w-16 h-16 mx-auto text-white/40 mb-4" />
                    <p className="text-white/60 text-lg mb-2">点击或拖拽上传户型图</p>
                    <p className="text-white/40 text-sm">支持 JPG、PNG 格式，建议清晰拍摄的户型图</p>
                </div>
            ) : (
                <div className="relative">
                    <img
                        src={preview}
                        alt="户型图预览"
                        className="w-full max-h-96 object-contain rounded-xl border border-white/20"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                        🏠 户型图已上传
                    </div>
                </div>
            )}
        </div>
    )
}
