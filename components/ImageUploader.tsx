'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
    onImagesChange: (files: File[]) => void
}

export default function ImageUploader({ onImagesChange }: ImageUploaderProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previews, setPreviews] = useState<string[]>([])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const newFiles = [...selectedFiles, ...files]

        setSelectedFiles(newFiles)
        onImagesChange(newFiles)

        // Generate previews
        const newPreviews = newFiles.map(file => URL.createObjectURL(file))
        setPreviews(newPreviews)
    }

    const removeImage = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index)
        const newPreviews = previews.filter((_, i) => i !== index)

        setSelectedFiles(newFiles)
        setPreviews(newPreviews)
        onImagesChange(newFiles)
    }

    return (
        <div className="space-y-4">
            {/* Image Grid - Larger layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-h-[280px]">
                {previews.map((preview, index) => (
                    <div key={index} className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 shadow-lg transition-transform hover:scale-105 hover:border-white/30">
                        <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover transition-transform group-hover:scale-110"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1.5 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 text-[10px] font-medium text-white/80 bg-black/60 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            #{index + 1}
                        </div>
                    </div>
                ))}

                {/* Add Button - Larger and more prominent */}
                <label className={`rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-400/50 bg-white/5 hover:bg-indigo-500/10 cursor-pointer transition-all flex flex-col items-center justify-center group relative overflow-hidden ${previews.length === 0 ? 'col-span-2 sm:col-span-3 min-h-[220px]' : 'aspect-square'}`}>
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="bg-white/10 p-4 rounded-full mb-3 group-hover:scale-110 group-hover:bg-indigo-500/30 transition-all">
                        <Upload className="w-8 h-8 text-white/70 group-hover:text-indigo-300" />
                    </div>
                    <span className="text-base font-medium text-white/70 group-hover:text-white transition-colors">添加图片</span>
                    <span className="text-xs text-white/30 mt-1 group-hover:text-white/50 transition-colors">
                        {selectedFiles.length > 0 ? `已选${selectedFiles.length}张` : '支持多选'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    )
}
