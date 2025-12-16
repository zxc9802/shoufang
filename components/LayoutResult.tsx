'use client'

import { useState } from 'react'
import { Copy, Check, Download, Sofa, Bed, ChefHat, Bath, BookOpen, Sun, UtensilsCrossed, DoorOpen, Shirt } from 'lucide-react'

interface RoomSuggestion {
    name: string
    suggestions: {
        [key: string]: string
    }
}

interface LayoutResultProps {
    result: {
        analysis: string
        roomSuggestions: RoomSuggestion[]
        storyScript: string
        birdviewImage?: string
        styleName?: string
        sceneName?: string
    }
}

// 房间图标映射
const ROOM_ICONS: Record<string, any> = {
    '客厅': Sofa,
    '主卧': Bed,
    '主卧室': Bed,
    '次卧': Bed,
    '次卧室': Bed,
    '儿童房': Bed,
    '厨房': ChefHat,
    '餐厅': UtensilsCrossed,
    '卫生间': Bath,
    '主卫': Bath,
    '客卫': Bath,
    '书房': BookOpen,
    '阳台': Sun,
    '玄关': DoorOpen,
    '衣帽间': Shirt
}

// 房间颜色映射
const ROOM_COLORS: Record<string, string> = {
    '客厅': 'from-amber-500 to-orange-500',
    '主卧': 'from-purple-500 to-pink-500',
    '主卧室': 'from-purple-500 to-pink-500',
    '次卧': 'from-blue-500 to-cyan-500',
    '次卧室': 'from-blue-500 to-cyan-500',
    '儿童房': 'from-pink-400 to-rose-400',
    '厨房': 'from-green-500 to-emerald-500',
    '餐厅': 'from-orange-500 to-red-500',
    '卫生间': 'from-cyan-500 to-teal-500',
    '主卫': 'from-cyan-500 to-teal-500',
    '客卫': 'from-teal-500 to-green-500',
    '书房': 'from-indigo-500 to-purple-500',
    '阳台': 'from-yellow-500 to-amber-500',
    '玄关': 'from-gray-500 to-slate-500',
    '衣帽间': 'from-rose-500 to-pink-500'
}

export default function LayoutResult({ result }: LayoutResultProps) {
    const [copiedSection, setCopiedSection] = useState<string | null>(null)
    const [imageError, setImageError] = useState(false)

    const handleCopy = async (text: string, section: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedSection(section)
        setTimeout(() => setCopiedSection(null), 2000)
    }

    const handleDownload = async () => {
        if (!result.birdviewImage) return

        try {
            // Method 1: Canvas approach for proper PNG conversion
            const img = new window.Image()
            img.crossOrigin = 'anonymous'

            img.onload = () => {
                const canvas = document.createElement('canvas')
                canvas.width = img.naturalWidth
                canvas.height = img.naturalHeight
                const ctx = canvas.getContext('2d')
                if (ctx) {
                    ctx.drawImage(img, 0, 0)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob)
                            const link = document.createElement('a')
                            link.href = url
                            link.download = '全屋软装效果图.png'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                            URL.revokeObjectURL(url)
                        }
                    }, 'image/png')
                }
            }

            img.onerror = () => {
                // Fallback: Open in new tab for manual save
                window.open(result.birdviewImage, '_blank')
                alert('由于跨域限制，请在新标签页中右键保存图片为PNG格式')
            }

            img.src = result.birdviewImage
        } catch (e) {
            // Final fallback
            window.open(result.birdviewImage, '_blank')
        }
    }

    // 格式化房间建议为文本
    const formatRoomSuggestions = () => {
        return result.roomSuggestions.map(room => {
            const lines = [`【${room.name}】`]
            Object.entries(room.suggestions).forEach(([key, value]) => {
                lines.push(`${key}：${value}`)
            })
            return lines.join('\n')
        }).join('\n\n')
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* 3D鸟瞰效果图 */}
            {result.birdviewImage && !imageError && (
                <div className="glass-panel rounded-2xl p-1 overflow-hidden group">
                    {/* Header Overlay */}
                    <div className="bg-black/40 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <span className="text-xl font-bold bg-gradient-to-r from-amber-200 to-white bg-clip-text text-transparent">
                                🏠 全屋3D漫游
                            </span>
                            <div className="flex gap-2">
                                {result.styleName && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-white/10 text-white/80 border border-white/10 uppercase tracking-wider">{result.styleName}</span>
                                )}
                                {result.sceneName && (
                                    <span className="px-2 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">{result.sceneName}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all text-sm font-medium border border-white/10 hover:border-white/30"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">下载高清图</span>
                        </button>
                    </div>

                    {/* Image Container - Full display with contain */}
                    <div className="relative w-full bg-slate-900/50">
                        <img
                            src={result.birdviewImage}
                            alt="全屋3D效果图"
                            className="w-full h-auto object-contain max-h-[75vh] mx-auto transition-transform duration-700 group-hover:scale-[1.02]"
                            onError={() => setImageError(true)}
                        />
                        {/* Vignette Overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        <p className="absolute bottom-4 left-0 right-0 text-center text-white/60 text-xs tracking-widest uppercase">
                            AI Generated Concept Visualization
                        </p>
                    </div>
                </div>
            )}

            {/* 图片加载失败提示 */}
            {imageError && (
                <div className="glass-panel rounded-2xl p-12 text-center border-l-4 border-l-red-500">
                    <p className="text-white/60">效果图生成出现网络波动，请稍后重试</p>
                </div>
            )}

            {/* 软装建议 - 分房间板块 */}
            <div className="glass-panel rounded-2xl p-6 md:p-8">
                <div className="flex justify-between items-end mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-1">
                            🛋️ 空间软装方案
                        </h3>
                        <p className="text-indigo-200/60 text-sm">
                            针对 <span className="text-white font-medium">{result.roomSuggestions.length}</span> 个独立空间的设计建议
                        </p>
                    </div>

                    <button
                        onClick={() => handleCopy(formatRoomSuggestions(), 'suggestions')}
                        className="group flex items-center gap-2 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-lg transition-all text-sm border border-indigo-500/20"
                    >
                        {copiedSection === 'suggestions' ? (
                            <><Check className="w-4 h-4" /> 已复制</>
                        ) : (
                            <><Copy className="w-4 h-4 opacity-70 group-hover:opacity-100" /> 复制全部方案</>
                        )}
                    </button>
                </div>

                {/* 房间卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                    {result.roomSuggestions.map((room, index) => {
                        const Icon = ROOM_ICONS[room.name] || Sofa
                        const colorClass = ROOM_COLORS[room.name] || 'from-gray-500 to-gray-600'

                        return (
                            <div
                                key={index}
                                className="group relative bg-white/5 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.07]"
                            >
                                {/* Room Badge */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white tracking-wide">{room.name}</h4>
                                </div>

                                {/* Suggestions List */}
                                <div className="space-y-3 pl-1">
                                    {Object.entries(room.suggestions).map(([key, value]) => (
                                        <div key={key} className="text-sm border-l-2 border-white/10 pl-3 py-0.5 hover:border-white/30 transition-colors">
                                            <span className="text-indigo-300/80 font-medium block text-xs mb-0.5 uppercase tracking-wider">{key}</span>
                                            <span className="text-slate-300 leading-relaxed">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 生活场景描述 */}
            <div className="glass-panel rounded-2xl p-8 border-l-4 border-l-purple-500 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        🎭 沉浸式场景叙事
                    </h3>
                    <button
                        onClick={() => handleCopy(result.storyScript, 'script')}
                        className="p-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all"
                        title="复制脚本"
                    >
                        {copiedSection === 'script' ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                    </button>
                </div>

                <div className="relative z-10 bg-black/30 rounded-xl p-6 border border-white/5">
                    <pre className="text-indigo-100/90 whitespace-pre-wrap font-sans text-sm leading-8 tracking-wide">
                        {result.storyScript}
                    </pre>
                </div>
            </div>
        </div>
    )
}
