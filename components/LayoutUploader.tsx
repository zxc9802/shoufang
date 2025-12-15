'use client'

import { useState } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface LayoutUploaderProps {
    onImageChange: (file: File | null) => void
}

export default function LayoutUploader({ onImageChange }: LayoutUploaderProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>('')

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            onImageChange(file)

            // Generate preview
            const previewUrl = URL.createObjectURL(file)
            setPreview(previewUrl)
        }
    }

    const removeImage = () => {
        setSelectedFile(null)
        setPreview('')
        onImageChange(null)
    }

    return (
        <div className="space-y-4">
            {preview ? (
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-white/5 border border-white/10">
                    <Image
                        src={preview}
                        alt="户型图预览"
                        fill
                        className="object-contain"
                    />
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <label className="aspect-[4/3] rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col items-center justify-center">
                    <Upload className="w-12 h-12 text-white/50 mb-4" />
                    <span className="text-lg text-white/70 mb-2">上传户型图</span>
                    <span className="text-sm text-white/40">
                        支持 JPG、PNG 格式
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </label>
            )}

            {selectedFile && (
                <p className="text-sm text-white/60 text-center">
                    已选择：{selectedFile.name}
                </p>
            )}
        </div>
    )
}
