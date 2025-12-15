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
            <div className="grid grid-cols-3 gap-4">
                {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10">
                        <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-white/50 mb-2" />
                    <span className="text-sm text-white/50">上传图片</span>
                    <span className="text-xs text-white/30 mt-1">
                        {selectedFiles.length > 0 ? `已选${selectedFiles.length}张` : '点击添加'}
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

            {selectedFiles.length > 0 && (
                <p className="text-sm text-white/60">
                    已选择 {selectedFiles.length} 张图片
                </p>
            )}
        </div>
    )
}
