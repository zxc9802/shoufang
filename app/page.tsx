'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import PropertyForm, { PropertyInfo } from '@/components/PropertyForm'
import ResultPanel from '@/components/ResultPanel'
import UsageGuide from '@/components/UsageGuide'
import PhotoTips from '@/components/PhotoTips'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  const handleGenerate = async (propertyInfo: PropertyInfo) => {
    if (selectedImages.length === 0) {
      setError('请至少上传1张图片')
      return
    }

    setIsGenerating(true)
    setError('')
    setResult(null)

    try {
      // Step 1: Upload images to Supabase Storage
      setStatus('📤 正在上传图片...')
      const imageUrls: string[] = []
      for (const file of selectedImages) {
        const fileName = `${Date.now()}_${file.name}`
        const { data, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      // Step 2: Analyze images (first API call)
      setStatus('🔍 AI正在分析图片...')
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageUrls })
      })

      const { imageFeatures } = await analyzeRes.json()
      console.log('图片分析结果:', imageFeatures)

      // Step 3: Generate content (second API call)
      setStatus('✍️ AI正在生成文案...')
      const generateRes = await fetch('/api/generate/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyInfo, imageFeatures })
      })

      if (!generateRes.ok) {
        throw new Error('生成失败')
      }

      const data = await generateRes.json()
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
      setStatus('')
    } catch (err) {
      console.error(err)
      setError('生成失败，请稍后重试')
      setStatus('')
    } finally {
      setIsGenerating(false)
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-lg bg-white/5">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            🏠 RealState AI
          </h1>
          <div className="flex items-center gap-3">
            <PhotoTips />
            <UsageGuide />
            <div className="text-white/60 text-sm">
              💰 积分: <span className="text-amber-400 font-semibold">150</span>
            </div>
          </div>
        </div>
      </header>


      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              📸 图片生爆款文案
            </h2>
            <p className="text-white/60">
              上传房源照片，AI 自动生成多平台文案
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
            {/* Image Uploader */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">
                上传房源照片 (1-9张)
              </h3>
              <ImageUploader onImagesChange={setSelectedImages} />
            </div>

            {/* Property Form */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                填写房源信息
              </h3>
              <PropertyForm onSubmit={handleGenerate} />
            </div>

            {/* Loading State */}
            {isGenerating && (
              <div className="mt-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                <p className="text-white/60 mt-2">{status || 'AI 正在生成文案...'}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <ResultPanel result={result} />
          )}
        </div>
      </main>
    </div>
  )
}
