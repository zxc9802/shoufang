'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import PropertyForm, { PropertyInfo } from '@/components/PropertyForm'
import ResultPanel from '@/components/ResultPanel'
import LayoutUploader from '@/components/LayoutUploader'
import StyleSelector from '@/components/StyleSelector'
import LayoutResult from '@/components/LayoutResult'
import AuthModal from '@/components/AuthModal'
import RedeemModal from '@/components/RedeemModal'
import HistoryPanel, { HistoryRecord } from '@/components/HistoryPanel'
import HistoryPreview from '@/components/HistoryPreview'
import Navbar from '@/components/Navbar'
import DashboardHero from '@/components/DashboardHero'
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
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<HistoryRecord | null>(null)
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

      // Step 1: 先显示文字分析结果
      setLayoutResult(data)
      setLayoutStatus('')

      // 更新本地积分（文字分析扣分）
      if (data.newPoints !== undefined) {
        updatePoints(data.newPoints)
      }

      // Step 2: 如果有返回 styleEn，则继续生成图片
      if (data.styleEn) {
        setLayoutStatus('正在生成3D效果图...')
        try {
          const renderRes = await fetch('/api/generate/render', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              imageUrl: publicUrl,
              styleEn: data.styleEn
            })
          })

          if (renderRes.ok) {
            const renderData = await renderRes.json()
            if (renderData.imageUrl) {
              // 更新 layoutResult，合并图片
              setLayoutResult((prev: any) => prev ? ({ ...prev, birdviewImage: renderData.imageUrl }) : prev)
            }
          } else {
            console.error('Render failed:', await renderRes.text())
            // 图片生成失败不影响文字结果
            setLayoutError('效果图生成暂不可用，但文字分析已完成')
            setTimeout(() => setLayoutError(''), 3000)
          }
        } catch (e) {
          console.error('Render request failed', e)
        } finally {
          setLayoutStatus('')
        }
      }

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

  // --- Render ---

  return (
    <div className="min-h-screen bg-deep-space text-white selection:bg-indigo-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      <Navbar
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onRedeemClick={() => setShowRedeemModal(true)}
        onHistoryClick={() => setShowHistoryPanel(true)}
        activeTab={activeTab}
      />

      <main className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

        {/* Hero & Tab Switcher */}
        <DashboardHero
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* History Preview Modal */}
        {selectedHistoryRecord && (
          <HistoryPreview
            record={selectedHistoryRecord}
            onClose={() => setSelectedHistoryRecord(null)}
          />
        )}

        {/* --- Content Area: Photo to Listing --- */}
        {activeTab === 'photo' && (
          <div className="animate-fade-in-up space-y-8">
            {/* Split Layout: Input Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Image Uploader (4 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="glass-panel p-6 rounded-3xl h-full border-t border-t-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl">🖼️</div>
                    <div>
                      <h2 className="text-lg font-bold">房源视觉素材</h2>
                      <p className="text-white/40 text-xs">支持上传 JPG/PNG 格式，建议上传1-9张</p>
                    </div>
                  </div>
                  <ImageUploader onImagesChange={setSelectedImages} />
                </div>
              </div>

              {/* Right Column: Form (8 cols) */}
              <div className="lg:col-span-7">
                <div className="glass-panel p-6 md:p-8 rounded-3xl border-t border-t-white/10 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />

                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl">📝</div>
                    <div>
                      <h2 className="text-lg font-bold">房源核心参数</h2>
                      <p className="text-white/40 text-xs">AI 将根据这些信息生成精准营销文案</p>
                    </div>
                  </div>

                  <PropertyForm onSubmit={handleGenerate} />

                  {/* Status / Error Overlays */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-3xl animate-in fade-in duration-300">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
                      </div>
                      <p className="mt-4 text-white font-medium animate-pulse">{status || 'AI 正在生成文案...'}</p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 flex items-center gap-3 animate-shake">
                      <span>⚠️</span> {error}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div id="result-section" className="scroll-mt-32">
                <ResultPanel result={result} />
              </div>
            )}
          </div>
        )}

        {/* --- Content Area: Layout Analysis --- */}
        {activeTab === 'layout' && (
          <div className="animate-fade-in-up space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* Left: Uploader */}
              <div className="glass-panel p-6 rounded-3xl border-t border-t-white/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-xl">📐</div>
                  <div>
                    <h2 className="text-lg font-bold">上传原始户型图</h2>
                    <p className="text-white/40 text-xs">支持黑白/彩色平面图，清晰度越高效果越好</p>
                  </div>
                </div>
                <LayoutUploader onImageChange={handleLayoutImageChange} />
              </div>

              {/* Right: Style & Config */}
              <div className="glass-panel p-6 rounded-3xl border-t border-t-white/10 flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-xl">🎨</div>
                  <div>
                    <h2 className="text-lg font-bold">定制设计风格</h2>
                    <p className="text-white/40 text-xs">选择理想的软装风格与生活场景</p>
                  </div>
                </div>

                <StyleSelector
                  onStyleChange={setSelectedStyle}
                  onSceneChange={setSelectedScene}
                />

                <div className="mt-auto">
                  <button
                    onClick={handleLayoutAnalyze}
                    disabled={!layoutImage || isAnalyzing}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 group relative overflow-hidden
                        ${layoutImage && !isAnalyzing
                        ? 'bg-white text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                        : isAnalyzing
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_40px_rgba(129,140,248,0.5)]'
                          : 'bg-white/5 text-white/20 cursor-not-allowed'
                      }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span className="text-white font-semibold animate-pulse">{layoutStatus || 'AI 正在思考...'}</span>
                      </>
                    ) : (
                      <>
                        <span className="relative z-10">🚀 开始空间分析</span>
                        {layoutImage && <span className="relative z-10 text-xs font-normal opacity-60 ml-1">(消耗15积分)</span>}
                        {layoutImage && <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity -z-0" />}
                      </>
                    )}
                  </button>
                  {layoutError && (
                    <p className="text-red-400 text-sm text-center mt-3 animate-shake">{layoutError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Results Section */}
            {layoutResult && (
              <div id="layout-result-section" className="scroll-mt-32">
                <LayoutResult result={layoutResult} />
              </div>
            )}
          </div>
        )}

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <RedeemModal
        isOpen={showRedeemModal}
        onClose={() => setShowRedeemModal(false)}
      />

      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => {
          setShowHistoryPanel(false)
          setSelectedHistoryRecord(null)
        }}
        onSelectRecord={setSelectedHistoryRecord}
      />
    </div>
  )
}
