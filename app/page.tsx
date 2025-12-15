'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import PropertyForm, { PropertyInfo } from '@/components/PropertyForm'
import ResultPanel from '@/components/ResultPanel'
import PhotoTips from '@/components/PhotoTips'
import LayoutUploader from '@/components/LayoutUploader'
import StyleSelector from '@/components/StyleSelector'
import LayoutResult from '@/components/LayoutResult'
import AuthModal from '@/components/AuthModal'
import UserInfo from '@/components/UserInfo'
import RedeemModal from '@/components/RedeemModal'
import { useUserStore } from '@/store/userStore'
import { supabase } from '@/lib/supabase'

type TabType = 'photo' | 'layout'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('photo')

  // Photo-to-Listing state
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [status, setStatus] = useState<string>('')

  // Layout Analysis state
  const [layoutImage, setLayoutImage] = useState<File | null>(null)
  const [layoutPreview, setLayoutPreview] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState('cream')
  const [selectedScene, setSelectedScene] = useState('single')
  const [layoutResult, setLayoutResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [layoutStatus, setLayoutStatus] = useState('')
  const [layoutError, setLayoutError] = useState('')

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showRedeemModal, setShowRedeemModal] = useState(false)
  const { user, updatePoints } = useUserStore()

  // Photo-to-Listing handler
  const handleGenerate = async (propertyInfo: PropertyInfo) => {
    // Check login
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Check points
    if (user.points < 10) {
      setError('积分不足！图片生文案需要10积分')
      setShowRedeemModal(true)
      return
    }

    if (selectedImages.length === 0) {
      setError('请至少上传1张图片')
      return
    }

    setIsGenerating(true)
    setError('')
    setResult(null)

    try {
      setStatus('📤 正在上传图片...')
      const imageUrls: string[] = []
      for (const file of selectedImages) {
        const fileName = `${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName)

        imageUrls.push(publicUrl)
      }

      setStatus('🔍 AI正在分析图片...')
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: imageUrls })
      })

      const { imageFeatures } = await analyzeRes.json()

      setStatus('✍️ AI正在生成文案...')
      const generateRes = await fetch('/api/generate/listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          propertyInfo,
          imageUrls
        })
      })

      const data = await generateRes.json()

      if (!generateRes.ok) {
        throw new Error(data.error || '生成失败')
      }

      setResult(data)

      // 更新本地积分
      if (data.newPoints !== undefined) {
        updatePoints(data.newPoints)
      }
      setStatus('')
    } catch (err: any) {
      console.error(err)
      // 显示具体的错误信息
      const errorMsg = err?.message || '生成失败，请稍后重试'
      setError(errorMsg)
      // 如果是积分不足，打开充值弹窗
      if (errorMsg.includes('积分不足')) {
        setShowRedeemModal(true)
      }
      setStatus('')
    } finally {
      setIsGenerating(false)
    }
  }

  // Layout Analysis handler
  const handleLayoutAnalyze = async () => {
    // Check login
    if (!user) {
      setShowAuthModal(true)
      return
    }

    // Check points
    if (user.points < 15) {
      setLayoutError('积分不足！户型分析需要15积分')
      setShowRedeemModal(true)
      return
    }

    if (!layoutImage) {
      setLayoutError('请上传户型图')
      return
    }

    setIsAnalyzing(true)
    setLayoutError('')
    setLayoutResult(null)

    // 步骤轮换动画
    const steps = [
      '📐 Step 1/3：AI正在分析户型图...',
      '✍️ Step 2/3：AI正在生成软装建议...',
      '🎨 Step 3/3：AI正在生成效果图...'
    ]
    let stepIndex = 0
    const statusInterval = setInterval(() => {
      stepIndex = Math.min(stepIndex + 1, steps.length - 1)
      setLayoutStatus(steps[stepIndex])
    }, 8000) // 每8秒切换一次状态

    try {
      setLayoutStatus('📤 正在上传户型图...')
      const fileName = `layout_${Date.now()}_${layoutImage.name}`
      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, layoutImage)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName)

      setLayoutStatus(steps[0])

      const analyzeRes = await fetch('/api/analyze/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          imageUrl: publicUrl,
          style: selectedStyle,
          scene: selectedScene
        })
      })

      clearInterval(statusInterval)

      const data = await analyzeRes.json()

      if (!analyzeRes.ok) {
        throw new Error(data.error || '分析失败')
      }

      setLayoutResult(data)

      // 更新本地积分
      if (data.newPoints !== undefined) {
        updatePoints(data.newPoints)
      }

      setLayoutStatus('')
    } catch (err: any) {
      clearInterval(statusInterval)
      console.error(err)
      // 显示具体的错误信息
      const errorMsg = err?.message || '分析失败，请稍后重试'
      setLayoutError(errorMsg)
      // 如果是积分不足，打开充值弹窗
      if (errorMsg.includes('积分不足')) {
        setShowRedeemModal(true)
      }
      setLayoutStatus('')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleLayoutImageChange = (file: File | null, preview: string | null) => {
    setLayoutImage(file)
    setLayoutPreview(preview)
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
            {activeTab === 'photo' && <PhotoTips />}
            {user ? (
              <UserInfo onRedeemClick={() => setShowRedeemModal(true)} />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                登录 / 注册
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Tab Buttons */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setActiveTab('photo')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
                ${activeTab === 'photo'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              📸 图片生文案
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2
                ${activeTab === 'layout'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
            >
              🏗️ 户型分析
            </button>
          </div>

          {/* Tab Content: Photo-to-Listing */}
          {activeTab === 'photo' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">📸 图片生爆款文案</h2>
                <p className="text-white/60">上传房源照片，AI 自动生成多平台文案</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">上传房源照片 (1-9张)</h3>
                  <ImageUploader onImagesChange={setSelectedImages} />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">填写房源信息</h3>
                  <PropertyForm onSubmit={handleGenerate} />
                </div>

                {isGenerating && (
                  <div className="mt-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    <p className="text-white/60 mt-2">{status || 'AI 正在生成文案...'}</p>
                  </div>
                )}

                {error && (
                  <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                    {error}
                  </div>
                )}
              </div>

              {result && <ResultPanel result={result} />}
            </>
          )}

          {/* Tab Content: Layout Analysis */}
          {activeTab === 'layout' && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">🏗️ 户型图分析与软装叙事</h2>
                <p className="text-white/60">上传户型图，AI 分析空间潜力并生成效果图</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-6">
                {/* Layout Uploader */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">上传户型图</h3>
                  <LayoutUploader onImageChange={handleLayoutImageChange} />
                </div>

                {/* Style Selector */}
                <div className="mb-8">
                  <StyleSelector
                    onStyleChange={setSelectedStyle}
                    onSceneChange={setSelectedScene}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleLayoutAnalyze}
                  disabled={!layoutImage || isAnalyzing}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2
                    ${layoutImage && !isAnalyzing
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 hover:from-amber-500 hover:to-yellow-600'
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                    }`}
                >
                  ✨ 开始分析 (消耗15积分)
                </button>

                {isAnalyzing && (
                  <div className="mt-6 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
                    <p className="text-white/60 mt-2">{layoutStatus || 'AI 正在分析户型...'}</p>
                  </div>
                )}

                {layoutError && (
                  <div className="mt-6 bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
                    {layoutError}
                  </div>
                )}
              </div>

              {layoutResult && (
                <LayoutResult result={layoutResult} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Redeem Modal */}
      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
      />
    </div>
  )
}
