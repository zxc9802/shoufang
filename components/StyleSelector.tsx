'use client'

import { useState } from 'react'

interface StyleSelectorProps {
    onStyleChange: (style: string) => void
    onSceneChange: (scene: string) => void
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

export default function StyleSelector({ onStyleChange, onSceneChange }: StyleSelectorProps) {
    const [selectedStyle, setSelectedStyle] = useState<string>('cream')
    const [selectedScene, setSelectedScene] = useState<string>('single')

    const handleStyleSelect = (styleId: string) => {
        setSelectedStyle(styleId)
        onStyleChange(styleId)
    }

    const handleSceneSelect = (sceneId: string) => {
        setSelectedScene(sceneId)
        onSceneChange(sceneId)
    }

    return (
        <div className="space-y-6">
            {/* 生活场景选择 */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">🎭 选择生活场景</h3>
                <div className="grid grid-cols-3 gap-3">
                    {SCENES.map((scene) => {
                        const isSelected = selectedScene === scene.id
                        return (
                            <button
                                key={scene.id}
                                onClick={() => handleSceneSelect(scene.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all text-center ${isSelected
                                        ? 'bg-purple-500/20 border-purple-500/50 ring-2 ring-purple-400/30'
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <div className="text-3xl mb-2">{scene.icon}</div>
                                <h4 className="text-white font-semibold text-sm">{scene.name}</h4>
                                <p className="text-white/50 text-xs mt-2 leading-relaxed">{scene.keywords}</p>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 装修风格选择 */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">🎨 选择软装风格</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {STYLES.map((style) => {
                        const isSelected = selectedStyle === style.id
                        return (
                            <button
                                key={style.id}
                                onClick={() => handleStyleSelect(style.id)}
                                className={`relative p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? `${style.bgColor} ${style.borderColor} ring-2 ring-white/20`
                                        : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                {isSelected && (
                                    <div className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r ${style.color} flex items-center justify-center`}>
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${style.color} mb-2`} />
                                <h4 className="text-white font-semibold text-sm">{style.name}</h4>
                                <p className="text-white/40 text-xs mt-1">{style.nameEn}</p>
                                <p className="text-white/50 text-xs mt-2 leading-relaxed">{style.keywords}</p>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
