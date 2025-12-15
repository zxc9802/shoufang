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

    const handleDownload = () => {
        if (result.birdviewImage) {
            const link = document.createElement('a')
            link.href = result.birdviewImage
            link.download = '全屋软装效果图.png'
            link.click()
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
        <div className="space-y-6">
            {/* 3D鸟瞰效果图 */}
            {result.birdviewImage && !imageError && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-xl font-semibold text-white">🏠 全屋3D效果图</h3>
                            <div className="flex gap-3 mt-1">
                                {result.styleName && (
                                    <span className="text-white/60 text-sm">风格：{result.styleName}</span>
                                )}
                                {result.sceneName && (
                                    <span className="text-purple-300 text-sm">场景：{result.sceneName}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            下载效果图
                        </button>
                    </div>
                    <img
                        src={result.birdviewImage}
                        alt="全屋3D效果图"
                        className="w-full rounded-xl border border-white/20"
                        onError={() => setImageError(true)}
                    />
                    <p className="text-white/40 text-xs mt-3 text-center">
                        * 效果图为AI生成的风格参考，展示软装设计整体效果
                    </p>
                </div>
            )}

            {/* 图片加载失败提示 */}
            {imageError && (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center">
                    <p className="text-white/60">效果图加载失败，请重新生成</p>
                </div>
            )}

            {/* 软装建议 - 分房间板块 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">
                        🛋️ 软装建议
                        <span className="text-sm font-normal text-white/60 ml-2">
                            ({result.roomSuggestions.length}个房间)
                        </span>
                    </h3>
                    <button
                        onClick={() => handleCopy(formatRoomSuggestions(), 'suggestions')}
                        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
                    >
                        {copiedSection === 'suggestions' ? (
                            <><Check className="w-4 h-4" /> 已复制</>
                        ) : (
                            <><Copy className="w-4 h-4" /> 全部复制</>
                        )}
                    </button>
                </div>

                {/* 房间卡片网格 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.roomSuggestions.map((room, index) => {
                        const Icon = ROOM_ICONS[room.name] || Sofa
                        const colorClass = ROOM_COLORS[room.name] || 'from-gray-500 to-gray-600'

                        return (
                            <div
                                key={index}
                                className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all"
                            >
                                {/* 房间标题 */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-white">{room.name}</h4>
                                </div>

                                {/* 建议列表 */}
                                <div className="space-y-3">
                                    {Object.entries(room.suggestions).map(([key, value]) => (
                                        <div key={key} className="text-sm">
                                            <span className="text-amber-400 font-medium">{key}：</span>
                                            <span className="text-white/70">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 生活场景描述 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">🎭 生活场景描述</h3>
                    <button
                        onClick={() => handleCopy(result.storyScript, 'script')}
                        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
                    >
                        {copiedSection === 'script' ? (
                            <><Check className="w-4 h-4" /> 已复制</>
                        ) : (
                            <><Copy className="w-4 h-4" /> 复制</>
                        )}
                    </button>
                </div>
                <pre className="text-white/80 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {result.storyScript}
                </pre>
            </div>
        </div>
    )
}
