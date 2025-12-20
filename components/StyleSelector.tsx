'use client'

import { useState } from 'react'

interface StyleSelectorProps {
    onStyleChange: (style: string) => void
    onSceneChange: (scene: string) => void
    onCustomRequirementChange?: (requirement: string) => void
}

const STYLES = [
    {
        id: 'japandi',
        name: '日式侘寂',
        nameEn: 'Japandi',
        keywords: '极简、自然木色、禅意、留白',
        color: 'from-amber-600 to-stone-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30'
    },
    {
        id: 'cream',
        name: '奶油风',
        nameEn: 'Cream Style',
        keywords: '温柔、米白色调、软糯、甜美',
        color: 'from-orange-300 to-yellow-200',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
    },
    {
        id: 'minimalist',
        name: '现代极简',
        nameEn: 'Modern Minimalist',
        keywords: '简洁、黑白灰、线条感、高级',
        color: 'from-gray-500 to-slate-600',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/30'
    },
    {
        id: 'nordic',
        name: '北欧风',
        nameEn: 'Scandinavian',
        keywords: '清新、白色、原木、几何',
        color: 'from-sky-400 to-blue-500',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/30'
    },
    {
        id: 'french',
        name: '法式轻奢',
        nameEn: 'French Luxury',
        keywords: '浪漫、石膏线、金色点缀、优雅',
        color: 'from-purple-400 to-pink-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30'
    },
    {
        id: 'industrial',
        name: '工业风',
        nameEn: 'Industrial',
        keywords: '粗犷、水泥、金属、复古',
        color: 'from-zinc-500 to-neutral-600',
        bgColor: 'bg-zinc-500/10',
        borderColor: 'border-zinc-500/30'
    },
    {
        id: 'chinese',
        name: '新中式',
        nameEn: 'New Chinese',
        keywords: '传统元素、木质、水墨、禅意',
        color: 'from-red-700 to-amber-700',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
    },
    {
        id: 'american',
        name: '美式乡村',
        nameEn: 'American Country',
        keywords: '温馨、做旧、布艺、复古',
        color: 'from-green-600 to-emerald-600',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30'
    }
]

const SCENES = [
    {
        id: 'single',
        name: '独居青年',
        icon: '🧑‍💻',
        keywords: 'Chill、自由、开放厨房、阅读角、绿植'
    },
    {
        id: 'couple',
        name: '新婚夫妻',
        icon: '💑',
        keywords: '浪漫、双人空间、温馨、现代简约'
    },
    {
        id: 'family',
        name: '三口之家',
        icon: '👨‍👩‍👧',
        keywords: '安全、儿童友好、储物空间、学习区'
    }
]

export default function StyleSelector({ onStyleChange, onSceneChange, onCustomRequirementChange }: StyleSelectorProps) {
    const [selectedStyle, setSelectedStyle] = useState<string>('cream')
    const [selectedScene, setSelectedScene] = useState<string>('single')
    const [customRequirement, setCustomRequirement] = useState<string>('')

    const handleStyleSelect = (styleId: string) => {
        setSelectedStyle(styleId)
        onStyleChange(styleId)
    }

    const handleSceneSelect = (sceneId: string) => {
        setSelectedScene(sceneId)
        onSceneChange(sceneId)
    }

    const handleCustomRequirementChange = (value: string) => {
        setCustomRequirement(value)
        onCustomRequirementChange?.(value)
    }

    return (
        <div className="space-y-8">
            {/* 装修风格选择 - Glass Gallery */}
            <div>
                <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-xl font-bold text-white tracking-wide">🎨 选择软装风格</h3>
                    <span className="text-xs text-white/40 uppercase tracking-widest">Swipe to Explore</span>
                </div>

                <div className="relative group/gallery">
                    {/* Fade Edges for Scroll Hint */}
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                    <div className="flex overflow-x-auto gap-4 pb-6 px-1 snap-x snap-mandatory scrollbar-hide">
                        {STYLES.map((style) => {
                            const isSelected = selectedStyle === style.id
                            return (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleSelect(style.id)}
                                    className={`relative flex-none w-48 snap-center group transition-all duration-300 ${isSelected ? 'scale-105 z-10' : 'hover:scale-105 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`
                                        h-64 w-full rounded-2xl p-5 flex flex-col justify-end text-left relative overflow-hidden backdrop-blur-xl transition-all duration-500
                                        ${isSelected
                                            ? `bg-gradient-to-b ${style.color} bg-opacity-20 border-2 border-white/40 shadow-2xl shadow-${style.color.split('-')[1]}-500/30`
                                            : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                                        }
                                    `}>
                                        {/* Ambient Background Gradient for Card */}
                                        <div className={`absolute inset-0 bg-gradient-to-tr ${style.color} opacity-20`} />

                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg animate-bounce">
                                                <span className="text-xs font-bold">✓</span>
                                            </div>
                                        )}

                                        <div className="relative z-10">
                                            <div className="text-xs font-medium text-white/60 mb-1 tracking-widest uppercase">{style.nameEn}</div>
                                            <h4 className="text-2xl font-bold text-white mb-2">{style.name}</h4>
                                            <div className="h-px w-8 bg-white/30 mb-3" />
                                            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                                                {style.keywords.split('、').join(' · ')}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 生活场景选择 - Neon Pills */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 px-1">🎭 选择生活场景</h3>
                <div className="flex flex-wrap gap-3">
                    {SCENES.map((scene) => {
                        const isSelected = selectedScene === scene.id
                        return (
                            <button
                                key={scene.id}
                                onClick={() => handleSceneSelect(scene.id)}
                                className={`
                                    relative px-5 py-3 rounded-full border transition-all duration-300 flex items-center gap-3 group
                                    ${isSelected
                                        ? 'bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                    }
                                `}
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">{scene.icon}</span>
                                <div className="text-left">
                                    <h4 className={`text-sm font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                        {scene.name}
                                    </h4>
                                    {isSelected && <p className="text-[10px] text-indigo-200/60 hidden sm:block -mb-1">已选择</p>}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 自定义设计要求 */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 px-1">💡 自定义设计要求 <span className="text-white/30 text-sm font-normal">(可选)</span></h3>
                <textarea
                    value={customRequirement}
                    onChange={(e) => handleCustomRequirementChange(e.target.value)}
                    placeholder="例如：我希望客厅有一个大书架、主卧需要梳妆台、偏好暖色调灯光..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all resize-none"
                />
                <p className="text-xs text-white/30 mt-2 px-1">AI 将根据您的要求调整软装建议和效果图生成</p>
            </div>
        </div>
    )
}
