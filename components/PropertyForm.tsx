'use client'

import { useState } from 'react'

export interface PropertyInfo {
    houseType: string
    area: string
    communityName: string
    price: string
    highlights: string[]
    platforms: string[]
}

interface PropertyFormProps {
    onSubmit: (info: PropertyInfo) => void
}

const HOUSE_TYPES = ['1室', '2室1厅', '2室2厅', '3室1厅', '3室2厅', '4室2厅', '自定义']
const HIGHLIGHT_OPTIONS = ['地铁近', '学区房', '朝南', '精装修', '电梯房', '低楼层', '有车位', '采光好']
const PLATFORM_OPTIONS = [
    { id: 'beike', name: '贝壳找房', icon: '🏠', desc: '专业房产平台' },
    { id: 'xiaohongshu', name: '小红书', icon: '📕', desc: '种草笔记风格' },
    { id: 'moments', name: '朋友圈', icon: '💬', desc: '朋友圈推广' }
]

export default function PropertyForm({ onSubmit }: PropertyFormProps) {
    const [formData, setFormData] = useState<PropertyInfo>({
        houseType: '2室1厅',
        area: '',
        communityName: '',
        price: '',
        highlights: [],
        platforms: ['beike']
    })

    const [customHouseType, setCustomHouseType] = useState('')
    const [showCustomHouseType, setShowCustomHouseType] = useState(false)
    const [customHighlight, setCustomHighlight] = useState('')

    const handleHouseTypeChange = (value: string) => {
        if (value === '自定义') {
            setShowCustomHouseType(true)
            setFormData({ ...formData, houseType: customHouseType || '' })
        } else {
            setShowCustomHouseType(false)
            setFormData({ ...formData, houseType: value })
        }
    }

    const toggleHighlight = (highlight: string) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.includes(highlight)
                ? prev.highlights.filter(h => h !== highlight)
                : [...prev.highlights, highlight]
        }))
    }

    const togglePlatform = (platformId: string) => {
        setFormData(prev => ({
            ...prev,
            platforms: prev.platforms.includes(platformId)
                ? prev.platforms.filter(p => p !== platformId)
                : [...prev.platforms, platformId]
        }))
    }

    const addCustomHighlight = () => {
        if (customHighlight.trim() && !formData.highlights.includes(customHighlight.trim())) {
            setFormData(prev => ({
                ...prev,
                highlights: [...prev.highlights, customHighlight.trim()]
            }))
            setCustomHighlight('')
        }
    }

    const removeHighlight = (highlight: string) => {
        setFormData(prev => ({
            ...prev,
            highlights: prev.highlights.filter(h => h !== highlight)
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 户型选择 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-200/80 pl-1">
                        户型结构
                    </label>
                    <div className="relative group">
                        <select
                            value={showCustomHouseType ? '自定义' : formData.houseType}
                            onChange={(e) => handleHouseTypeChange(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white appearance-none focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                        >
                            {HOUSE_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900 text-white">
                                    {type}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                    </div>

                    {showCustomHouseType && (
                        <input
                            type="text"
                            value={customHouseType}
                            onChange={(e) => {
                                setCustomHouseType(e.target.value)
                                setFormData({ ...formData, houseType: e.target.value })
                            }}
                            placeholder="例如：5室3厅2卫"
                            className="w-full mt-2 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                        />
                    )}
                </div>

                {/* 面积 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-200/80 pl-1">
                        建筑面积 (㎡)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        placeholder="89"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 小区名称 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-200/80 pl-1">
                        小区名称
                    </label>
                    <input
                        type="text"
                        value={formData.communityName}
                        onChange={(e) => setFormData({ ...formData, communityName: e.target.value })}
                        placeholder="例如：阳光花园"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                    />
                </div>

                {/* 价格 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-indigo-200/80 pl-1">
                        参考价格 (万元)
                    </label>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="350"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                    />
                </div>
            </div>

            {/* 亮点标签 */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-indigo-200/80 pl-1">
                    核心卖点
                </label>

                {/* 预设标签 */}
                <div className="flex flex-wrap gap-2">
                    {HIGHLIGHT_OPTIONS.map(highlight => {
                        const isSelected = formData.highlights.includes(highlight)
                        return (
                            <button
                                key={highlight}
                                type="button"
                                onClick={() => toggleHighlight(highlight)}
                                className={`px-4 py-2 rounded-full text-sm transition-all border ${isSelected
                                        ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'
                                    }`}
                            >
                                {highlight}
                            </button>
                        )
                    })}
                </div>

                {/* 自定义标签输入 */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={customHighlight}
                        onChange={(e) => setCustomHighlight(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomHighlight()
                            }
                        }}
                        placeholder="输入更多亮点..."
                        className="flex-1 h-10 bg-transparent border-b border-white/20 px-2 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={addCustomHighlight}
                        className="px-4 py-2 text-indigo-300 hover:text-white transition-colors text-sm font-medium"
                    >
                        + 添加
                    </button>
                </div>

                {/* 已选标签显示 */}
                {formData.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.highlights.map(highlight => (
                            <span
                                key={highlight}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white/90 rounded-lg text-xs"
                            >
                                {highlight}
                                <button
                                    type="button"
                                    onClick={() => removeHighlight(highlight)}
                                    className="hover:text-red-400 text-white/40 transition-colors"
                                >
                                    ✕
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 平台选择 */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-indigo-200/80 pl-1 flex items-center justify-between">
                    <span>目标平台</span>
                    <span className="text-xs text-indigo-300/60 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">2积分 / 平台</span>
                </label>
                <div className="grid grid-cols-3 gap-4">
                    {PLATFORM_OPTIONS.map(platform => {
                        const isSelected = formData.platforms.includes(platform.id)
                        return (
                            <button
                                key={platform.id}
                                type="button"
                                onClick={() => togglePlatform(platform.id)}
                                className={`relative p-4 rounded-xl border transition-all duration-300 group ${isSelected
                                        ? 'bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className={`text-2xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>{platform.icon}</div>
                                <div className={`font-medium text-sm mb-0.5 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{platform.name}</div>
                                <div className="text-[10px] text-white/40">{platform.desc}</div>

                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            <button
                type="submit"
                disabled={formData.platforms.length === 0}
                className="w-full relative group overflow-hidden bg-white text-black font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2 text-lg tracking-tight">
                    ✨ 启动引擎 · 生成文案 <span className="text-sm font-normal opacity-60 ml-1">(消耗 {formData.platforms.length * 2} 积分)</span>
                </span>
            </button>
        </form>
    )
}
