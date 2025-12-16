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

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPreview(null)
        onImageChange(null, null)
        if (inputRef.current) inputRef.current.value = ''
    }

    return (
        <div className="group relative">
            {/* Portal Glow Effect */}
            <div className={`absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full transition-opacity duration-700 pointer-events-none ${preview ? 'opacity-10' : 'opacity-40 group-hover:opacity-60'}`} />

            {!preview ? (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                    onDragLeave={() => setIsDragging(false)}
                    className={`
                        relative portal-border min-h-[300px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                        ${isDragging ? 'bg-indigo-500/10 scale-[0.98]' : 'hover:scale-[1.02]'}
                    `}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />

                    {/* Floating Portal Icon */}
                    <div className="relative mb-6 animate-[float_4s_ease-in-out_infinite]">
                        <div className="absolute inset-0 bg-indigo-400 blur-xl opacity-30 rounded-full" />
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <p className="text-xl font-medium text-white mb-2 tracking-wide">
                        点击或拖拽上传户型图
                    </p>
                    <p className="text-indigo-200/60 text-sm">
                        开启空间传送门 | 支持 JPG, PNG
                    </p>
                </div>
            ) : (
                <div className="relative group/preview cursor-pointer" onClick={() => inputRef.current?.click()}>
                    <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                    />

                    {/* Polaroid Style Preview */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl transition-all hover:border-white/20">
                        <div className="relative overflow-hidden rounded-xl aspect-[4/3] bg-black/50">
                            <img
                                src={preview}
                                alt="户型图预览"
                                className="w-full h-full object-contain"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <span className="text-white font-medium flex items-center gap-2">
                                    <Upload className="w-5 h-5" /> 更换图片
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={removeImage}
                        className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-6 left-6 bg-emerald-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center gap-2 pointer-events-none">
                        <Home className="w-4 h-4" /> 户型图已就绪
                    </div>
                </div>
            )}
        </div>
    )
}
